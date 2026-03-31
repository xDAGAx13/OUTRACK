import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState } from "react";
import "../../global.css";
import {  FIREBASE_DB } from "../../FirebaseConfig";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { auth } from "../../FirebaseConfig";
import { getWorkoutSummary } from "../../utils/gemini";

export default function History() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [workouts, setWorkouts] = useState([]);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState(null);
  const [summaries, setSummaries] = useState({});
  const [summaryLoading, setSummaryLoading] = useState({});

  const handleExpand = (id) => {
    setSelectedWorkoutId(selectedWorkoutId === id ? null : id);
  };

  const handleGenerateSummary = async (id, exercises) => {
    setSummaryLoading(prev => ({ ...prev, [id]: true }));
    const summary = await getWorkoutSummary(exercises);
    if (summary) {
      setSummaries(prev => ({ ...prev, [id]: summary }));
      try {
        const user = auth.currentUser;
        if (user) {
          await updateDoc(doc(FIREBASE_DB, `users/${user.uid}/workout/${id}`), { summary });
        }
      } catch (e) {
        console.error('Failed to save summary to Firestore:', e.message);
      }
    }
    setSummaryLoading(prev => ({ ...prev, [id]: false }));
  };

  const fetchWorkouts = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const snapshot = await getDocs(collection(FIREBASE_DB, `users/${user.uid}/workout`));
      const logs = snapshot.docs.map((d) => {
        const data = d.data();
        return { id: d.id, ...data, createdAt: data.createdAt?.toDate?.() || new Date(0) };
      });
      const sorted = logs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setWorkouts(sorted);

      // Seed summaries state from any already saved in Firestore
      const existing = {};
      sorted.forEach(w => { if (w.summary) existing[w.id] = w.summary; });
      setSummaries(existing);
    } catch (e) {
      console.log("Failed to set workouts: ", e.message);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setSummaries({});
    await fetchWorkouts();
    setRefreshing(false);
  };

  useEffect(() => { fetchWorkouts(); }, []);

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
        <Text className="text-neutral-400 text-base font-semibold uppercase tracking-widest">
          🗓{" "}
          {new Date(item.createdAt).toLocaleDateString("en-US", {
            weekday: "short",
            month: "long",
            day: "2-digit",
          })}
        </Text>
        <TouchableOpacity onPress={() => handleExpand(item.id)}>
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
            <Text className="text-white font-semibold text-lg">{group}</Text>
          </View>
        ))}
      </View>

      {/* Expanded Details */}
      {selectedWorkoutId === item.id && (
        <View className="mt-3 border-t border-neutral-700 pt-3">
          {/* AI Summary */}
          {summaries[item.id] ? (
            <View className="bg-neutral-800 rounded-xl px-3 py-3 mb-3 flex-row items-start gap-2">
              <Text className="text-orange-400 text-sm font-bold mt-0.5">✦ AI</Text>
              <Text className="text-neutral-300 text-base flex-1">{summaries[item.id]}</Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => handleGenerateSummary(item.id, item.exercises)}
              disabled={summaryLoading[item.id]}
              className="bg-neutral-800 border border-orange-500 rounded-xl px-3 py-2 mb-3 flex-row items-center gap-2 self-start"
            >
              <Text className="text-orange-400 text-sm font-bold">✦</Text>
              <Text className="text-orange-400 text-sm font-semibold">
                {summaryLoading[item.id] ? 'Generating...' : 'Generate AI Summary'}
              </Text>
            </TouchableOpacity>
          )}

          {item.exercises.map((exercise, idx) => (
            <View key={idx} className="mb-3">
              <Text className="text-white font-semibold text-xl">
                {exercise.exercise}{" "}
                <Text className="text-neutral-500 text-lg font-normal">
                  ({exercise.muscleGroup})
                </Text>
              </Text>
              {exercise.sets.map((set, i) => (
                <Text key={i} className="text-neutral-400 text-lg mt-1">
                  Set {i + 1}: {set.reps} reps @ {set.weight} kg
                </Text>
              ))}
            </View>
          ))}

          {/* Actions */}
          <View className="flex-row gap-4 mt-2 justify-end">
            <TouchableOpacity
              onPress={() => router.push(`/(app)/workoutlog?workoutId=${item.id}`)}
              className="bg-neutral-800 p-2 rounded-xl"
            >
              <Ionicons name="refresh" size={20} color="#22c55e" />
            </TouchableOpacity>
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
    <ScrollView
      className="bg-black flex-1 px-4 pt-8"
      contentContainerStyle={{ paddingBottom: 128 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f97316" />}
    >
      {refreshing && (
        <View className="items-center mb-4">
          <ActivityIndicator color="#f97316" size="small" />
        </View>
      )}

      <View className="items-center mb-6">
        <Text className="text-orange-500 text-base font-semibold uppercase tracking-widest mb-2">
          ✦ Your Logs
        </Text>
        <Text className="text-white text-4xl font-extrabold text-center">
          Workout History
        </Text>
        <Text className="text-neutral-400 text-xl mt-2">
          {workouts.length} {workouts.length === 1 ? 'session' : 'sessions'} logged
        </Text>
      </View>

      <FlatList
        data={workouts}
        keyExtractor={(item) => item.id}
        renderItem={renderWorkout}
        scrollEnabled={false}
      />
    </ScrollView>
  );
}
