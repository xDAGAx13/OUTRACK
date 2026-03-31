import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import "../../global.css";
import {  FIREBASE_DB } from "../../FirebaseConfig";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { auth } from "../../FirebaseConfig";
import { getWorkoutSummary } from "../../utils/gemini";

export default function History() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [workouts, setWorkouts] = useState([]);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState(null);
  const [summaries, setSummaries] = useState({});
  const [summaryLoading, setSummaryLoading] = useState({});

  const handleExpand = async (id, exercises) => {
    const isExpanding = selectedWorkoutId !== id;
    setSelectedWorkoutId(isExpanding ? id : null);
    if (isExpanding && !summaries[id]) {
      setSummaryLoading(prev => ({ ...prev, [id]: true }));
      const summary = await getWorkoutSummary(exercises);
      setSummaries(prev => ({ ...prev, [id]: summary }));
      setSummaryLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const snapshot = await getDocs(
          collection(FIREBASE_DB, `users/${user.uid}/workout`)
        );

        const logs = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || new Date(0), // fallback to epoch
          };
        });

        const sortedLogs = logs.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setWorkouts(sortedLogs);
      } catch (e) {
        console.log("Failed to set workouts: ", e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkouts();
  }, []);

  const handleDeleteWorkout = (workoutId) => {
    Alert.alert(
      "Delete Workout",
      "Are you sure you want to delete this workout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const user = auth.currentUser;
              if (!user) return;

              await deleteDoc(
                doc(FIREBASE_DB, `users/${user.uid}/workout/${workoutId}`)
              );
              setWorkouts((prev) =>
                prev.filter((workout) => workout.id !== workoutId)
              );
              Alert.alert("Workout Deleted");
            } catch (e) {
              console.error("Error deleting item: ", e.message);
              Alert.alert("Error", "Failed to delete workout");
            }
          },
        },
      ]
    );
  };

  const renderWorkout = ({ item }) => (
    <View className="bg-neutral-900 border border-neutral-700 rounded-2xl p-4 mb-4">
      {/* Card Header */}
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-neutral-400 text-sm font-semibold uppercase tracking-widest">
          🗓{" "}
          {new Date(item.createdAt).toLocaleDateString("en-US", {
            weekday: "short",
            month: "long",
            day: "2-digit",
          })}
        </Text>
        <TouchableOpacity onPress={() => handleExpand(item.id, item.exercises)}>
          <Ionicons
            name={
              selectedWorkoutId === item.id
                ? "chevron-up-outline"
                : "chevron-down-outline"
            }
            size={22}
            color="#fff"
          />
        </TouchableOpacity>
      </View>

      {/* Muscle Group Tags */}
      <View className="flex-row flex-wrap gap-2 mb-1">
        {[
          ...new Set(item.exercises.map((exercise) => exercise.muscleGroup)),
        ].map((group, idx) => (
          <View
            key={idx}
            className="bg-orange-500 rounded-full px-3 py-1 justify-center"
          >
            <Text className="text-white font-semibold text-base">{group}</Text>
          </View>
        ))}
      </View>

      {/* Expanded Details */}
      {selectedWorkoutId === item.id && (
        <View className="mt-3 border-t border-neutral-700 pt-3">
          {/* AI Summary */}
          <View className="bg-neutral-800 rounded-xl px-3 py-2 mb-3 flex-row items-center gap-2">
            <Text className="text-orange-400 text-xs">✦ AI</Text>
            {summaryLoading[item.id] ? (
              <Text className="text-neutral-500 text-sm italic">Summarising...</Text>
            ) : (
              <Text className="text-neutral-300 text-sm flex-1">{summaries[item.id] || '—'}</Text>
            )}
          </View>

          {item.exercises.map((exercise, idx) => (
            <View key={idx} className="mb-3">
              <Text className="text-white font-semibold text-lg">
                {exercise.exercise}{" "}
                <Text className="text-neutral-500 text-base font-normal">
                  ({exercise.muscleGroup})
                </Text>
              </Text>
              {exercise.sets.map((set, i) => (
                <Text key={i} className="text-neutral-400 text-base mt-1">
                  Set {i + 1}: {set.reps} reps @ {set.weight} kg
                </Text>
              ))}
            </View>
          ))}

          {/* Actions */}
          <View className="flex-row gap-4 mt-2 justify-end">
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: `/(app)/editWorkout?workoutId=${item.id}`,
                })
              }
              className="bg-neutral-800 p-2 rounded-xl"
            >
              <Ionicons name="pencil" size={20} color="#fb923c" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDeleteWorkout(item.id)}
              className="bg-neutral-800 p-2 rounded-xl"
            >
              <Ionicons name="trash" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView className="bg-black flex-1 px-4 pt-8 pb-32">
      <Text className="text-white text-5xl font-bold text-center mb-6">
        Workout History
      </Text>

      <FlatList
        data={workouts}
        keyExtractor={(item) => item.id}
        renderItem={renderWorkout}
        scrollEnabled={false}
      />
    </ScrollView>
  );
}
