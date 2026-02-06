import React, { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
  ViewStyle,
  ScrollViewProps,
  View,
} from "react-native";

interface KeyboardAvoidingWrapperProps {
  children: ReactNode;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  keyboardVerticalOffset?: number;
  scrollEnabled?: boolean;
  enableScrollView?: boolean;
  keyboardShouldPersistTaps?: ScrollViewProps["keyboardShouldPersistTaps"];
}

export default function KeyboardAvoidingWrapper({
  children,
  style,
  contentContainerStyle,
  keyboardVerticalOffset = 0,
  scrollEnabled = true,
  enableScrollView = true,
  keyboardShouldPersistTaps = "handled",
}: KeyboardAvoidingWrapperProps) {
  if (!enableScrollView) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[styles.container, style]}
        keyboardVerticalOffset={keyboardVerticalOffset}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.innerContainer}>{children}</View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, style]}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      <ScrollView
        contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        keyboardDismissMode="on-drag"
        scrollEnabled={scrollEnabled}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.innerContainer}>{children}</View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  innerContainer: {
    flex: 1,
  },
});
