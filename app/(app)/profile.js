import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { FIREBASE_DB } from "../../FirebaseConfig";
import "../../global.css";
import { doc, getDoc } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import EditableField from "../../components/EditableField";
import { auth } from "../../FirebaseConfig";

export default function profile() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [userinfo, setUserinfo] = useState({});

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) return;
      try {
        const userinfoSnap = await getDoc(doc(FIREBASE_DB, `users/${user.uid}/userinfo/profile`));
        setUserinfo(userinfoSnap.data() || {});
      } catch (e) {
        console.error("Error Fetching Data :", e.message);
      }
    };
    fetchUserData();
  }, []);

  const handleSignout = async () => {
    setLoading(true);
    try {
      await auth.signOut();
      router.replace("/login");
    } catch (error) {
      Alert.alert("Signout Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  const initials = userinfo.name
    ? userinfo.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const gymAccessLabel = {
    full: "Full Gym",
    dumbbells: "Dumbbells Only",
    none: "No Access",
  }[userinfo.gymAccess] || "—";

  return (
    <ScrollView className="flex-1 bg-black" contentContainerStyle={{ paddingBottom: 128 }}>

      {/* Avatar + Name Header */}
      <View className="items-center pt-16 pb-6 px-6">
        <View className="bg-orange-500 w-24 h-24 rounded-full items-center justify-center mb-4">
          <Text className="text-white text-4xl font-extrabold">{initials}</Text>
        </View>
        <Text className="text-white text-4xl font-bold">{userinfo.name || "—"}</Text>
        <Text className="text-neutral-500 text-base mt-1">Your fitness profile</Text>
      </View>

      {/* Quick Stats Row */}
      <View className="flex-row mx-4 gap-3 mb-6">
        {[
          { label: "Age", value: userinfo.age, unit: "yrs" },
          { label: "Height", value: userinfo.height, unit: "cm" },
          { label: "Weight", value: userinfo.weight, unit: "kg" },
        ].map(stat => (
          <View key={stat.label} className="flex-1 bg-neutral-900 border border-neutral-700 rounded-2xl py-4 items-center">
            <Text className="text-white text-2xl font-bold">{stat.value || "—"}</Text>
            <Text className="text-neutral-500 text-xs uppercase tracking-widest mt-1">{stat.label}</Text>
            {stat.value ? <Text className="text-neutral-600 text-xs">{stat.unit}</Text> : null}
          </View>
        ))}
      </View>

      {/* Editable Fields */}
      <View className="mx-4 mb-2">
        <Text className="text-neutral-500 text-xs font-semibold uppercase tracking-widest mb-3">Edit Profile</Text>
        <EditableField
          field="name"
          label="Name"
          icon="person"
          value={userinfo.name}
          onUpdate={(key, val) => setUserinfo(prev => ({ ...prev, [key]: val }))}
        />
        <EditableField
          field="age"
          label="Age"
          icon="calendar"
          value={userinfo.age}
          onUpdate={(key, val) => setUserinfo(prev => ({ ...prev, [key]: val }))}
        />
        <EditableField
          field="height"
          label="Height"
          icon="analytics"
          value={userinfo.height}
          onUpdate={(key, val) => setUserinfo(prev => ({ ...prev, [key]: val }))}
        />
        <EditableField
          field="weight"
          label="Weight"
          icon="barbell"
          value={userinfo.weight}
          onUpdate={(key, val) => setUserinfo(prev => ({ ...prev, [key]: val }))}
        />
        <EditableField
          field="bodyFat"
          label="Body Fat %"
          icon="fitness"
          value={userinfo.bodyFat}
          onUpdate={(key, val) => setUserinfo(prev => ({ ...prev, [key]: val }))}
        />
      </View>

      {/* Gym Info (read-only) */}
      <View className="mx-4 mt-4 mb-6">
        <Text className="text-neutral-500 text-xs font-semibold uppercase tracking-widest mb-3">Gym Info</Text>
        <View className="bg-neutral-900 border border-neutral-700 rounded-2xl overflow-hidden">
          {[
            { icon: "trophy", label: "Experience", value: userinfo.experience || "—" },
            { icon: "time", label: "Frequency", value: userinfo.frequency ? `${userinfo.frequency} days/week` : "—" },
            { icon: "location", label: "Gym Access", value: gymAccessLabel },
          ].map((item, idx, arr) => (
            <View
              key={item.label}
              className={`flex-row items-center px-4 py-4 gap-3 ${idx < arr.length - 1 ? "border-b border-neutral-700" : ""}`}
            >
              <View className="bg-neutral-800 p-2 rounded-xl">
                <Ionicons name={item.icon} size={18} color="#f97316" />
              </View>
              <View className="flex-1">
                <Text className="text-neutral-500 text-xs uppercase tracking-widest">{item.label}</Text>
                <Text className="text-white text-base font-semibold mt-0.5">{item.value}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Sign Out */}
      <View className="mx-4">
        <TouchableOpacity
          className="border border-red-500 rounded-2xl py-4 flex-row items-center justify-center gap-2"
          onPress={handleSignout}
          disabled={loading}
        >
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text className="text-red-500 text-lg font-semibold">Sign Out</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}
