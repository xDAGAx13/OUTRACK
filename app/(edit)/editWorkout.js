import { View, Text, Alert, ScrollView, TextInput, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { FIREBASE_DB } from '../../FirebaseConfig';
import { updateDoc, doc, getDoc } from 'firebase/firestore';
import { auth } from '../../FirebaseConfig';
import { Ionicons } from '@expo/vector-icons';

export default function editWorkout() {
  const router = useRouter();
  const { workoutId } = useLocalSearchParams();
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkout = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
        const workoutDoc = await getDoc(doc(FIREBASE_DB, `users/${user.uid}/workout/${workoutId}`));
        if (workoutDoc.exists()) {
          setExercises(workoutDoc.data().exercises || []);
        } else {
          Alert.alert('Workout not found');
          router.back();
        }
      } catch (e) {
        Alert.alert('Error', 'Could not load workout.');
        router.back();
      } finally {
        setLoading(false);
      }
    };
    fetchWorkout();
  }, []);

  const handleExerciseChange = (index, key, value) => {
    setExercises((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: value };
      return updated;
    });
  };

  const handleSetChange = (exerciseIndex, setIndex, key, value) => {
    setExercises((prev) => {
      const updated = [...prev];
      const updatedSets = [...updated[exerciseIndex].sets];
      updatedSets[setIndex] = { ...updatedSets[setIndex], [key]: value };
      updated[exerciseIndex] = { ...updated[exerciseIndex], sets: updatedSets };
      return updated;
    });
  };

  const saveWorkout = async () => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user found');
      await updateDoc(doc(FIREBASE_DB, `users/${user.uid}/workout/${workoutId}`), { exercises });
      Alert.alert('Saved', 'Workout updated successfully.');
      router.replace('../(app)/history');
    } catch (e) {
      Alert.alert('Error', 'Could not save workout.');
    }
  };

  const inputClass = "bg-neutral-800 text-white px-4 h-12 rounded-xl border border-neutral-600 text-base";

  return (
    <ScrollView className="bg-black flex-1 px-4 pt-14" contentContainerStyle={{ paddingBottom: 60 }}>

      {/* Header */}
      <View className="mb-8">
        <Text className="text-orange-500 text-xs font-semibold uppercase tracking-widest mb-2">✦ Edit</Text>
        <Text className="text-white text-4xl font-extrabold">Edit Workout</Text>
      </View>

      {exercises.map((exercise, idx) => (
        <View key={idx} className="bg-neutral-900 border border-neutral-700 rounded-2xl p-4 mb-4">
          <Text className="text-orange-500 text-xs font-semibold uppercase tracking-widest mb-3">
            Exercise {idx + 1}
          </Text>

          <TextInput
            value={exercise.exercise}
            onChangeText={(text) => handleExerciseChange(idx, 'exercise', text)}
            className={inputClass}
            placeholder="Exercise Name"
            placeholderTextColor="#555"
            textAlignVertical="center"
          />

          <View className="mt-3">
            {exercise.sets.map((set, setIdx) => (
              <View key={setIdx} className="mb-2">
                <Text className="text-neutral-500 text-xs uppercase tracking-widest mb-1">Set {setIdx + 1}</Text>
                <View className="flex-row gap-3">
                  <TextInput
                    value={set.reps.toString()}
                    onChangeText={(text) => handleSetChange(idx, setIdx, 'reps', text)}
                    className={`${inputClass} flex-1`}
                    placeholder="Reps"
                    placeholderTextColor="#555"
                    keyboardType="numeric"
                    textAlignVertical="center"
                  />
                  <TextInput
                    value={set.weight.toString()}
                    onChangeText={(text) => handleSetChange(idx, setIdx, 'weight', text)}
                    className={`${inputClass} flex-1`}
                    placeholder="Weight (kg)"
                    placeholderTextColor="#555"
                    keyboardType="numeric"
                    textAlignVertical="center"
                  />
                </View>
              </View>
            ))}
          </View>
        </View>
      ))}

      <TouchableOpacity
        onPress={saveWorkout}
        className="bg-orange-500 rounded-xl py-4 mt-2 flex-row items-center justify-center gap-2"
      >
        <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
        <Text className="text-white text-center text-lg font-bold">Save Changes</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}
