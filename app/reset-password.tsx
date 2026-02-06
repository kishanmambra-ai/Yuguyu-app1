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
import { router, useLocalSearchParams } from "expo-router";

import Colors from "@/constants/colors";
import { trpc } from "@/lib/trpc";

export default function ResetPassword() {
  const { email: emailParam } = useLocalSearchParams<{ email: string }>();
  const [email, setEmail] = useState(emailParam || "");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const resetPasswordMutation = trpc.auth.resetPassword.useMutation();

  const handleResetPassword = async () => {
    if (!email.trim() || !code.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (code.length !== 6) {
      Alert.alert("Error", "Please enter the 6-digit code");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      await resetPasswordMutation.mutateAsync({
        email: email.trim().toLowerCase(),
        code: code.trim(),
        newPassword,
      });

      Alert.alert("Success", "Your password has been reset successfully", [
        {
          text: "Log In",
          onPress: () => router.replace("/login" as any),
        },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to reset password");
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
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>New Password</Text>
          <Text style={styles.subtitle}>Enter the code we sent to your email and create a new password</Text>

          <View style={styles.form}>
            {!emailParam && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor={Colors.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Reset Code</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter 6-digit code"
                placeholderTextColor={Colors.textSecondary}
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>New Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Create new password (min 6 characters)"
                placeholderTextColor={Colors.textSecondary}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm New Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirm new password"
                placeholderTextColor={Colors.textSecondary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={[styles.resetButton, isLoading && styles.resetButtonDisabled]}
              onPress={handleResetPassword}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.background} />
              ) : (
                <Text style={styles.resetButtonText}>Reset Password</Text>
              )}
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
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingHorizontal: 24,
  },
  backButton: {
    paddingVertical: 8,
  },
  backText: {
    fontSize: 16,
    color: Colors.primaryAccent,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 40,
    lineHeight: 24,
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
  input: {
    height: 52,
    backgroundColor: Colors.cardBackground,
    borderRadius: 0,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resetButton: {
    height: 56,
    backgroundColor: Colors.primaryAccent,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 0,
    marginTop: 20,
  },
  resetButtonDisabled: {
    opacity: 0.7,
  },
  resetButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.background,
  },
});
