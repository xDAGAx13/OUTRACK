import {
  View,
  Text,
  Alert,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import { FIREBASE_DB } from "../FirebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "expo-router";
import DropDownPicker from "react-native-dropdown-picker";
import { auth } from "../FirebaseConfig";

const TOTAL_STEPS = 3;

const steps = [
  {
    title: "Let's get started",
    subtitle: "Tell us a bit about yourself",
  },
  {
    title: "Your body metrics",
    subtitle: "Used to personalise your experience",
  },
  {
    title: "Your gym profile",
    subtitle: "Help us tailor your workouts",
  },
];

export default function UserInfo() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    name: "",
    age: "",
    height: "",
    weight: "",
    bodyFat: "",
    experience: null,
    frequency: "",
    gymAccess: null,
  });

  const [experienceOpen, setExperienceOpen] = useState(false);
  const [accessOpen, setAccessOpen] = useState(false);

  const experienceItems = [
    { label: "None", value: "None" },
    { label: "Beginner", value: "Beginner" },
    { label: "Intermediate", value: "Intermediate" },
    { label: "Advanced", value: "Advanced" },
  ];
  const accessItems = [
    { label: "Yes - Full Gym", value: "full" },
    { label: "Yes - Dumbbells", value: "dumbbells" },
    { label: "No Access", value: "none" },
  ];

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const validateStep = () => {
    if (step === 1) {
      if (!form.name.trim()) { Alert.alert("Missing field", "Please enter your name."); return false; }
      if (!form.age.trim()) { Alert.alert("Missing field", "Please enter your age."); return false; }
    }
    if (step === 2) {
      if (!form.height.trim()) { Alert.alert("Missing field", "Please enter your height."); return false; }
      if (!form.weight.trim()) { Alert.alert("Missing field", "Please enter your weight."); return false; }
    }
    if (step === 3) {
      if (!form.experience) { Alert.alert("Missing field", "Please select your gym experience."); return false; }
      if (!form.gymAccess) { Alert.alert("Missing field", "Please select your gym access."); return false; }
      if (!form.frequency.trim()) { Alert.alert("Missing field", "Please enter your gym frequency."); return false; }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setStep((s) => s + 1);
  };

  const handleSave = async () => {
    if (!validateStep()) return;
    try {
      const user = auth.currentUser;
      if (!user) { Alert.alert("Error", "User not logged in"); return; }
      await setDoc(doc(FIREBASE_DB, `users/${user.uid}/userinfo/profile`), form);
      router.replace("/(app)/home");
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  const inputClass = "bg-neutral-800 h-14 px-5 text-white text-lg rounded-xl border border-neutral-600";

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: "#000" }}
    >
      <ScrollView
        className="flex-1 bg-black px-5 pt-14"
        contentContainerStyle={{ paddingBottom: 60 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Progress dots */}
        <View className="flex-row justify-center gap-2 mb-10">
          {[1, 2, 3].map((i) => (
            <View
              key={i}
              className={`h-2 rounded-full ${i === step ? "w-8 bg-orange-500" : "w-2 bg-neutral-600"}`}
            />
          ))}
        </View>

        {/* Step header */}
        <View className="mb-8">
          <Text className="text-orange-500 text-xs font-semibold uppercase tracking-widest mb-2">
            Step {step} of {TOTAL_STEPS}
          </Text>
          <Text className="text-white text-4xl font-extrabold mb-1">
            {steps[step - 1].title}
          </Text>
          <Text className="text-neutral-400 text-base">
            {steps[step - 1].subtitle}
          </Text>
        </View>

        {/* Step 1 — Personal */}
        {step === 1 && (
          <View className="gap-4">
            <TextInput
              placeholder="Name"
              value={form.name}
              onChangeText={(v) => update("name", v)}
              className={inputClass}
              placeholderTextColor="#D3D3D3"
              textAlignVertical="center"
            />
            <TextInput
              placeholder="Age"
              value={form.age}
              onChangeText={(v) => update("age", v)}
              className={inputClass}
              placeholderTextColor="#D3D3D3"
              keyboardType="numeric"
              textAlignVertical="center"
            />
          </View>
        )}

        {/* Step 2 — Body metrics */}
        {step === 2 && (
          <View className="gap-4">
            <TextInput
              placeholder="Height (cm)"
              value={form.height}
              onChangeText={(v) => update("height", v)}
              className={inputClass}
              placeholderTextColor="#D3D3D3"
              keyboardType="numeric"
              textAlignVertical="center"
            />
            <TextInput
              placeholder="Weight (kg)"
              value={form.weight}
              onChangeText={(v) => update("weight", v)}
              className={inputClass}
              placeholderTextColor="#D3D3D3"
              keyboardType="numeric"
              textAlignVertical="center"
            />
            <TextInput
              placeholder="Body Fat % (optional)"
              value={form.bodyFat}
              onChangeText={(v) => update("bodyFat", v)}
              className={inputClass}
              placeholderTextColor="#D3D3D3"
              keyboardType="numeric"
              textAlignVertical="center"
            />
          </View>
        )}

        {/* Step 3 — Gym profile */}
        {step === 3 && (
          <View className="gap-4">
            <DropDownPicker
              open={experienceOpen}
              setOpen={setExperienceOpen}
              value={form.experience}
              setValue={(cb) => update("experience", cb(form.experience))}
              items={experienceItems}
              placeholder="Gym Experience"
              style={{
                backgroundColor: "#262626",
                borderColor: "#525252",
                borderRadius: 12,
                height: 56,
              }}
              dropDownContainerStyle={{
                backgroundColor: "#262626",
                borderColor: "#525252",
                borderRadius: 12,
              }}
              textStyle={{ color: "#fff", fontSize: 16 }}
              placeholderStyle={{ color: "#D3D3D3" }}
              selectedItemLabelStyle={{ color: "#f97316" }}
              listMode="SCROLLVIEW"
              zIndex={2000}
            />
            <DropDownPicker
              open={accessOpen}
              setOpen={setAccessOpen}
              value={form.gymAccess}
              setValue={(cb) => update("gymAccess", cb(form.gymAccess))}
              items={accessItems}
              placeholder="Gym Access"
              style={{
                backgroundColor: "#262626",
                borderColor: "#525252",
                borderRadius: 12,
                height: 56,
                marginTop: experienceOpen ? 120 : 0,
              }}
              dropDownContainerStyle={{
                backgroundColor: "#262626",
                borderColor: "#525252",
                borderRadius: 12,
              }}
              textStyle={{ color: "#fff", fontSize: 16 }}
              placeholderStyle={{ color: "#D3D3D3" }}
              selectedItemLabelStyle={{ color: "#f97316" }}
              listMode="SCROLLVIEW"
              zIndex={1000}
            />
            <TextInput
              placeholder="Gym Frequency (days/week)"
              value={form.frequency}
              onChangeText={(v) => update("frequency", v)}
              className={inputClass}
              placeholderTextColor="#D3D3D3"
              keyboardType="numeric"
              textAlignVertical="center"
              style={{ marginTop: accessOpen ? 120 : 0 }}
            />
          </View>
        )}

        {/* Navigation buttons */}
        <View className="mt-10 gap-3">
          {step < TOTAL_STEPS ? (
            <TouchableOpacity
              className="h-14 bg-orange-500 rounded-xl justify-center"
              onPress={handleNext}
            >
              <Text className="text-white text-center text-xl font-bold">
                Next
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              className="h-14 bg-orange-500 rounded-xl justify-center"
              onPress={handleSave}
            >
              <Text className="text-white text-center text-xl font-bold">
                Let's Go
              </Text>
            </TouchableOpacity>
          )}

          {step > 1 && (
            <TouchableOpacity
              className="h-14 bg-neutral-800 rounded-xl justify-center border border-neutral-600"
              onPress={() => setStep((s) => s - 1)}
            >
              <Text className="text-white text-center text-lg font-semibold">
                Back
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
