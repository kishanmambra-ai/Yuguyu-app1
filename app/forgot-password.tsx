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

import Colors from "@/constants/colors";
import { trpc } from "@/lib/trpc";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendResetCodeMutation = trpc.auth.sendResetCode.useMutation();

  const handleSendCode = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      await sendResetCodeMutation.mutateAsync({
        email: email.trim().toLowerCase(),
      });

      Alert.alert(
        "Code Sent",
        "If an account exists with this email, you will receive a reset code.",
        [
          {
            text: "Continue",
            onPress: () => router.push({ pathname: "/reset-password" as any, params: { email: email.trim().toLowerCase() } }),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to send reset code");
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
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter your email address and we'll send you a code to reset your password
          </Text>

          <View style={styles.form}>
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

            <TouchableOpacity
              style={[styles.sendButton, isLoading && styles.sendButtonDisabled]}
              onPress={handleSendCode}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.background} />
              ) : (
                <Text style={styles.sendButtonText}>Send Reset Code</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Remember your password? </Text>
            <TouchableOpacity onPress={() => router.replace("/login" as any)}>
              <Text style={styles.loginLink}>Log In</Text>
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
  sendButton: {
    height: 56,
    backgroundColor: Colors.primaryAccent,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 0,
    marginTop: 20,
  },
  sendButtonDisabled: {
    opacity: 0.7,
  },
  sendButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.background,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 32,
  },
  loginText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  loginLink: {
    fontSize: 16,
    color: Colors.primaryAccent,
    fontWeight: "600",
  },
});
