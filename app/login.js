import {
  View,
  Text,
  Alert,
  Image,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../FirebaseConfig";

export default function login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  //LoginCheck function
  const handleLogin = async () => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("Login Successful", userCredential.user);
      router.replace("/(app)/home");
    } catch (e) {
      Alert.alert("Login Failed", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="pt-10">
          {/* TITLE OF THE APP */}
          <View className="pt-16 flex-col">
            <Text className="text-white text-center text-7xl font-extrabold ">
              OUTRACK
            </Text>
            <Text className="text-white text-center text-5xl font-semibold mt-4">
              LOGIN
            </Text>
          </View>
          {/* IMAGE */}
          <View className="items-center pt-6">
            <Image
              className="w-96 h-64"
              source={require("../assets/images/Workout-rafiki.png")}
            />
          </View>

          {/* Auth Inputs */}
          <View className="flex-col gap-4 pt-7 px-5">
            <TextInput
              value={email}
              onChangeText={setEmail}
              className="bg-neutral-800 h-14 px-5 text-white text-lg rounded-xl border border-neutral-600"
              placeholder="Email"
              placeholderTextColor="#555"
              keyboardType="email-address"
              autoCapitalize="none"
              textAlignVertical="center"
            />
            <TextInput
              value={password}
              onChangeText={setPassword}
              className="bg-neutral-800 h-14 px-5 text-white text-lg rounded-xl border border-neutral-600"
              placeholder="Password"
              placeholderTextColor="#555"
              secureTextEntry
              textAlignVertical="center"
            />
          </View>

          {/* LOGIN BUTTON */}
          <View className="pt-5 flex-col px-5">
            <TouchableOpacity
              className="h-14 bg-orange-500 rounded-xl justify-center"
              onPress={handleLogin}
            >
              <Text className="text-white text-center text-3xl font-semibold">
                Sign In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={() => router.push("/signUp")}
            >
              <Text className="text-white pt-4 text-center text-xl">
                Don't have an account?
              </Text>
            </TouchableOpacity>
          </View>

          <View className="">
            <Text className="text-gray-200 text-center mt-10">
              Made by Rohan Daga
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
