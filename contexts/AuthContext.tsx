import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState, useCallback } from "react";
import createContextHook from "@nkzw/create-context-hook";

export interface User {
  id: string;
  email: string;
  name: string;
  profilePicture?: string;
}

const TOKEN_KEY = "auth_token";
const USER_KEY = "user_data";

export const [AuthContext, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const [storedToken, storedUser] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(USER_KEY),
      ]);

      if (storedToken && storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed && parsed.id && parsed.email && parsed.name) {
            setToken(storedToken);
            setUser(parsed);
          } else {
            // Fallback to guest login if parsing fails
            await loginAsGuest();
          }
        } catch {
          // Fallback to guest login if error
          await loginAsGuest();
        }
      } else {
        // No stored auth? Login as guest automatically!
        await loginAsGuest();
      }
    } catch (error) {
      console.error("Failed to load stored auth:", error);
      // Ensure we still let them in
      await loginAsGuest();
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsGuest = async () => {
    const guestUser: User = {
      id: "guest_user_id",
      email: "guest@example.com",
      name: "Guest User",
    };
    const guestToken = "guest_token";

    // We don't save to storage to keep it ephemeral (or we could), 
    // but setting state is enough to pass 'isAuthenticated' check.
    setToken(guestToken);
    setUser(guestUser);
  };

  const clearAuth = async () => {
    await Promise.all([
      AsyncStorage.removeItem(TOKEN_KEY),
      AsyncStorage.removeItem(USER_KEY),
    ]);
    setToken(null);
    setUser(null);
  };

  const login = useCallback(async (authToken: string, userData: User) => {
    try {
      await Promise.all([
        AsyncStorage.setItem(TOKEN_KEY, authToken),
        AsyncStorage.setItem(USER_KEY, JSON.stringify(userData)),
      ]);
      setToken(authToken);
      setUser(userData);
    } catch (error) {
      console.error("Failed to save auth:", error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await clearAuth();
    } catch (error) {
      console.error("Failed to logout:", error);
      throw error;
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<Omit<User, 'id' | 'email'>>) => {
    try {
      if (!user) return;

      const updatedUser = { ...user, ...updates };

      // Ensure we persist both user and token so loadStoredAuth works on next reload
      // This "upgrades" an ephemeral guest session to a persisted one
      if (token) {
        await AsyncStorage.setItem(TOKEN_KEY, token);
      }
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));

      setUser(updatedUser);
    } catch (error) {
      console.error("Failed to update profile:", error);
      throw error;
    }
  }, [user, token]);

  const getToken = useCallback(() => token, [token]);

  return {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    logout,
    updateProfile,
    getToken,
  };
});
