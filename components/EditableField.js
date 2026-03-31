import { View, Text, Alert, TouchableOpacity, TextInput } from "react-native";
import React, { useState } from "react";
import { FIREBASE_DB } from "../FirebaseConfig";
import { doc, updateDoc } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "../FirebaseConfig";
import '../global.css'

export default function EditableField({ field, label, icon, value, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      const docRef = doc(FIREBASE_DB, `users/${user.uid}/userinfo/profile`);
      await updateDoc(docRef, { [field]: inputValue });
      onUpdate(field, inputValue);
      setEditing(false);
    } catch (e) {
      console.error("Error updating field: ", e.message);
      Alert.alert("Update Failed");
    }
  };

  const unit = field === 'height' ? ' cm' : field === 'weight' ? ' kg' : '';

  return (
    <View className="bg-neutral-900 border border-neutral-700 rounded-2xl px-4 py-4 mb-3">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3 flex-1">
          <View className="bg-neutral-800 p-2 rounded-xl">
            <Ionicons name={icon} size={20} color="#f97316" />
          </View>
          <View className="flex-1">
            <Text className="text-neutral-500 text-xs uppercase tracking-widest mb-1">{label}</Text>
            {editing ? (
              <TextInput
                className="text-white text-lg font-semibold"
                value={inputValue}
                onChangeText={setInputValue}
                placeholder={`Enter ${label}`}
                placeholderTextColor="#555"
                autoFocus
              />
            ) : (
              <Text className="text-white text-lg font-semibold">
                {value || '—'}{unit}
              </Text>
            )}
          </View>
        </View>
        {editing ? (
          <View className="flex-row gap-3">
            <TouchableOpacity onPress={() => setEditing(false)} className="bg-neutral-800 p-2 rounded-xl">
              <Ionicons name="close" size={20} color="#9ca3af" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} className="bg-orange-500 p-2 rounded-xl">
              <Ionicons name="checkmark" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={() => setEditing(true)} className="bg-neutral-800 p-2 rounded-xl">
            <Ionicons name="pencil" size={18} color="#f97316" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
