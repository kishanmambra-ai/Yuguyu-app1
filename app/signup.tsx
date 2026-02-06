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
import { Mail, Lock, User, ArrowLeft, Eye, EyeOff } from "lucide-react-native";

import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const signupMutation = trpc.auth.signup.useMutation();

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (name.trim().length < 2) {
      Alert.alert("Error", "Name must be at least 2 characters");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const result = await signupMutation.mutateAsync({
        name: name.trim(),
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
      Alert.alert("Signup Failed", error.message || "Could not create account");
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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Start your fitness journey today</Text>

          <View style={styles.form}>
            <View style={styles.inputWrapper}>
              <View style={styles.inputIcon}>
                <User size={20} color={Colors.textSecondary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Full name"
                placeholderTextColor={Colors.textSecondary}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

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
                placeholder="Password (min 6 characters)"
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

            <View style={styles.inputWrapper}>
              <View style={styles.inputIcon}>
                <Lock size={20} color={Colors.textSecondary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Confirm password"
                placeholderTextColor={Colors.textSecondary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity 
                style={styles.eyeIcon} 
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color={Colors.textSecondary} />
                ) : (
                  <Eye size={20} color={Colors.textSecondary} />
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.signupButton, isLoading && styles.signupButtonDisabled]}
              onPress={handleSignup}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.signupButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              By signing up, you agree to our{" "}
              <Text style={styles.termsLink}>Terms of Service</Text>
              {" "}and{" "}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.divider} />
          </View>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.replace("/login" as any)}>
              <Text style={styles.loginLink}>Sign In</Text>
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
    marginTop: 12,
    marginBottom: 24,
  },
  logoCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.primaryAccent,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: Colors.primaryAccent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    fontSize: 36,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  appName: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: Colors.text,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 28,
  },
  form: {
    gap: 14,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 54,
  },
  inputIcon: {
    width: 50,
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
    width: 50,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  signupButton: {
    height: 54,
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
  signupButtonDisabled: {
    opacity: 0.7,
  },
  signupButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  termsContainer: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  termsText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  termsLink: {
    color: Colors.primaryAccent,
    fontWeight: "600",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
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
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  loginText: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  loginLink: {
    fontSize: 15,
    color: Colors.primaryAccent,
    fontWeight: "700",
  },
});
