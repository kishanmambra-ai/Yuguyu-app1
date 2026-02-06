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
import { Lock, ArrowLeft, Eye, EyeOff, Shield } from "lucide-react-native";

import Colors from "@/constants/colors";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/contexts/AuthContext";

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();

  const changePasswordMutation = trpc.auth.changePassword.useMutation();

  const handleChangePassword = async () => {
    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "New password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }

    if (currentPassword === newPassword) {
      Alert.alert("Error", "New password must be different from current password");
      return;
    }

    if (!token) {
      Alert.alert("Error", "Please log in again");
      return;
    }

    setIsLoading(true);
    try {
      await changePasswordMutation.mutateAsync({
        token,
        currentPassword,
        newPassword,
      });

      Alert.alert(
        "Success",
        "Your password has been changed successfully",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to change password");
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
          <Text style={styles.headerTitle}>Change Password</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Shield size={40} color="#FFFFFF" />
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.subtitle}>
            Enter your current password and choose a new secure password
          </Text>

          <View style={styles.form}>
            <Text style={styles.label}>Current Password</Text>
            <View style={styles.inputWrapper}>
              <View style={styles.inputIcon}>
                <Lock size={20} color={Colors.textSecondary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Enter current password"
                placeholderTextColor={Colors.textSecondary}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry={!showCurrentPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? (
                  <EyeOff size={20} color={Colors.textSecondary} />
                ) : (
                  <Eye size={20} color={Colors.textSecondary} />
                )}
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>New Password</Text>
            <View style={styles.inputWrapper}>
              <View style={styles.inputIcon}>
                <Lock size={20} color={Colors.textSecondary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Enter new password (min 6 characters)"
                placeholderTextColor={Colors.textSecondary}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff size={20} color={Colors.textSecondary} />
                ) : (
                  <Eye size={20} color={Colors.textSecondary} />
                )}
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Confirm New Password</Text>
            <View style={styles.inputWrapper}>
              <View style={styles.inputIcon}>
                <Lock size={20} color={Colors.textSecondary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Confirm new password"
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
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleChangePassword}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Update Password</Text>
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
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.cardBackground,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
  },
  headerSpacer: {
    width: 44,
  },
  iconContainer: {
    alignItems: "center",
    marginVertical: 24,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryAccent,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.primaryAccent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },
  form: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginTop: 8,
    marginBottom: 4,
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
  submitButton: {
    height: 54,
    backgroundColor: Colors.primaryAccent,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    marginTop: 24,
    shadowColor: Colors.primaryAccent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
