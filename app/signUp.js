import {
  View,
  Text,
  Alert,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword, signInWithCredential } from "firebase/auth";
import { initializeUserData } from "../utils/initializeUserData";
import { Ionicons } from "@expo/vector-icons";
import { GoogleAuthProvider } from "firebase/auth";
import { auth } from "../FirebaseConfig";

WebBrowser.maybeCompleteAuthSession();

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: '335688520458-m9a7a7uo7f4qki0ml04064qoo61ckikn.apps.googleusercontent.com',
    iosClientId: '335688520458-u3fgqf2eupt3tvkihco1ioupqcirge1h.apps.googleusercontent.com',
    webClientId: '335688520458-m9a7a7uo7f4qki0ml04064qoo61ckikn.apps.googleusercontent.com',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.authentication;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then((cred) => {
          console.log('Google Sign In Success: ', cred.user);
        }).catch((e) => {
          console.error('Firebase sign-in error: ', e);
        });
    }
  }, [response]);

  const handleSignUp = async () => {
    setLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;
      await initializeUserData(uid);
      router.replace("/userinfo");
    } catch (e) {
      Alert.alert("SignUp Failed", e.message);
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
        <View className="flex-1 pt-10">
          {/* TITLE */}
          <View className="pt-16 flex-col">
            <Text className="text-white text-center text-7xl font-extrabold">
              OUTRACK
            </Text>
            <Text className="text-white text-center text-5xl font-semibold mt-4">
              SIGN UP
            </Text>
          </View>

          {/* Center block: inputs + buttons */}
          <View className="flex-1 mt-24 px-5 gap-4">
            {/* Auth Inputs */}
            <View className="flex-col gap-4">
              <TextInput
                value={email}
                onChangeText={setEmail}
                className="bg-neutral-800 h-14 px-5 text-white text-lg rounded-xl border border-neutral-600"
                placeholder="Email"
                placeholderTextColor="#D3D3D3"
                keyboardType="email-address"
                autoCapitalize="none"
                textAlignVertical="center"
              />
              <TextInput
                value={password}
                onChangeText={setPassword}
                className="bg-neutral-800 h-14 px-5 text-white text-lg rounded-xl border border-neutral-600"
                placeholder="Password"
                placeholderTextColor="#D3D3D3"
                secureTextEntry
                textAlignVertical="center"
              />
            </View>

            {/* Buttons */}
            <View className="flex-col gap-3 mt-10">
              {loading ? (
                <ActivityIndicator size="large" color="#f97316" />
              ) : (
                <>
                  <TouchableOpacity
                    className="h-14 bg-orange-500 rounded-xl justify-center"
                    onPress={handleSignUp}
                  >
                    <Text className="text-white text-center text-xl font-bold">
                      Sign Up
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="h-14 bg-neutral-800 rounded-xl justify-center border border-neutral-600"
                    onPress={() => promptAsync()}
                  >
                    <View className="flex-row items-center justify-center gap-3">
                      <Ionicons name="logo-google" size={22} color="white" />
                      <Text className="text-white text-center text-lg font-semibold">
                        Continue with Google
                      </Text>
                    </View>
                  </TouchableOpacity>
                </>
              )}

              <TouchableOpacity
                activeOpacity={0.5}
                onPress={() => router.push("/login")}
              >
                <Text className="text-white pt-2 text-center text-lg">
                  Already have an account?
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Terms pinned to bottom */}
          <View className="pb-8">
            <Text className="text-gray-600 text-center text-sm">
              Terms and Conditions may apply
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
