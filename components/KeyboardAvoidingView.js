import { KeyboardAvoidingView as RNKeyboardAvoidingView, ScrollView } from "react-native";
import React from "react";
import { Platform } from "react-native";

export default function KeyboardAvoidingView({ children }) {
  return (
    <RNKeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {children}
      </ScrollView>
    </RNKeyboardAvoidingView>
  );
}
