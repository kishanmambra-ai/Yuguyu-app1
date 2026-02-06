import { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Mail, Lock, ArrowLeft, Eye, EyeOff } from "lucide-react-native";

import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const loginMutation = trpc.auth.login.useMutation();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      const result = await loginMutation.mutateAsync({
        email: email.trim().toLowerCase(),
        password,
      });

      if (result.success && result.token && result.user) {
        await login(result.token, {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
        });
        router.replace("/diet");
      }
    } catch (error: any) {
      Alert.alert("Login Failed", error.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>Y</Text>
          </View>
          <Text style={styles.appName}>Yuguyu</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue your fitness journey</Text>

          <View style={styles.form}>
            <View style={styles.inputWrapper}>
              <View style={styles.inputIcon}>
                <Mail size={20} color={Colors.textSecondary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor={Colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputWrapper}>
              <View style={styles.inputIcon}>
                <Lock size={20} color={Colors.textSecondary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={Colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity 
                style={styles.eyeIcon} 
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={20} color={Colors.textSecondary} />
                ) : (
                  <Eye size={20} color={Colors.textSecondary} />
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => router.push("/forgot-password" as any)}
              style={styles.forgotPassword}
            >
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.divider} />
          </View>

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.replace("/signup" as any)}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.cardBackground,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 32,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryAccent,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: Colors.primaryAccent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    fontSize: 40,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  appName: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.text,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 32,
  },
  form: {
    gap: 16,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 56,
  },
  inputIcon: {
    width: 52,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    color: Colors.text,
    paddingRight: 16,
  },
  eyeIcon: {
    width: 52,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: 4,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: Colors.primaryAccent,
    fontWeight: "600",
  },
  loginButton: {
    height: 56,
    backgroundColor: Colors.primaryAccent,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    marginTop: 8,
    shadowColor: Colors.primaryAccent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 28,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  signupText: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  signupLink: {
    fontSize: 15,
    color: Colors.primaryAccent,
    fontWeight: "700",
  },
});
