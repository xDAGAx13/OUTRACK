import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState } from "react";
import DropDownPicker from "react-native-dropdown-picker";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import {  FIREBASE_DB } from "../../FirebaseConfig.js";
import ExerciseBlock from "../../components/ExerciseBlock.js";
import { logWorkout } from "../../components/workoutlogger.js";
import { auth } from "../../FirebaseConfig.js";
import { useLocalSearchParams } from "expo-router";

export default function workoutlog() {
  const { workoutId, suggestedWorkout } = useLocalSearchParams();
  const [muscleOptions, setMuscleOptions] = useState([]);
  const [exerciseMap, setExerciseMap] = useState({});
  const [exerciseInputs, setExerciseInputs] = useState([
    {
      id: Date.now().toString(),
      muscleGroup: "",
      exercise: "",
      sets: [{ reps: "", weight: "" }],
    },
  ]);
  const [reusedFrom, setReusedFrom] = useState(null);
  const [refreshing, setRefreshing] = useState(false);


  const fetchAll = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const snapshotMuscle = await getDocs(
        collection(FIREBASE_DB, `users/${user.uid}/muscleGroups`)
      );
      const options = snapshotMuscle.docs.map((d) => ({
        label: d.data().name,
        value: d.data().name,
      }));
      setMuscleOptions(options);
    } catch (err) {
      console.error("Failed to fetch Muscle Groups: ", err.message);
    }

    try {
      const snapshot = await getDocs(
        collection(FIREBASE_DB, `users/${user.uid}/exercises`)
      );
      const exercisesByGroup = {};
      snapshot.docs.forEach((d) => {
        const data = d.data();
        if (!exercisesByGroup[data.muscleGroup]) exercisesByGroup[data.muscleGroup] = [];
        exercisesByGroup[data.muscleGroup].push({ label: data.name, value: data.name });
      });
      setExerciseMap(exercisesByGroup);
    } catch (err) {
      console.error("Error fetching exercises:", err);
    }

    if (workoutId) {
      try {
        const snap = await getDoc(doc(FIREBASE_DB, `users/${user.uid}/workout/${workoutId}`));
        if (snap.exists()) {
          const data = snap.data();
          const preloaded = data.exercises.map((ex) => ({
            id: Date.now().toString() + Math.random(),
            muscleGroup: ex.muscleGroup || "",
            exercise: ex.exercise || "",
            sets: ex.sets?.map((s) => ({ reps: s.reps || "", weight: s.weight || "" })) || [{ reps: "", weight: "" }],
          }));
          setExerciseInputs(preloaded);
          const date = data.createdAt?.toDate?.();
          if (date) setReusedFrom(date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }));
        }
      } catch (err) {
        console.error("Failed to load workout for reuse:", err.message);
      }
    }

    if (suggestedWorkout) {
      try {
        const parsed = JSON.parse(suggestedWorkout);
        const preloaded = parsed.exercises.map((ex) => ({
          id: Date.now().toString() + Math.random(),
          muscleGroup: ex.muscleGroup || "",
          exercise: ex.exercise || "",
          sets: ex.sets?.map((s) => ({ reps: s.reps || "", weight: s.weight || "" })) || [{ reps: "", weight: "" }],
        }));
        setExerciseInputs(preloaded);
        setReusedFrom("OutChat");
      } catch (err) {
        console.error("Failed to load suggested workout:", err.message);
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAll();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const updateInput = (id, key, value) => {
    setExerciseInputs((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [key]: value } : item))
    );
  };

  const updateSetValue = (blockId, setIndex, key, value) => {
    setExerciseInputs((prev) =>
      prev.map((block) => {
        if (block.id !== blockId) return block;
        const updatedSets = block.sets.map((set, i) =>
          i == setIndex ? { ...set, [key]: value } : set
        );
        return { ...block, sets: updatedSets };
      })
    );
  };

  const addSetToBlock = (blockId) => {
    setExerciseInputs((prev) =>
      prev.map((block) =>
        block.id === blockId
          ? { ...block, sets: [...block.sets, { reps: "", weight: "" }] }
          : block
      )
    );
  };

  const removeSetFromBlock = (blockId, setIndex) => {
    setExerciseInputs((prev) =>
      prev.map((block) => {
        if (block.id !== blockId) return block;
        const updatedSets = block.sets.filter((_, i) => i !== setIndex);
        return { ...block, sets: updatedSets };
      })
    );
  };

  const addExerciseBlock = () => {
    setExerciseInputs((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        muscleGroup: "",
        exercise: "",
        sets: [{ reps: "", weight: "" }],
      },
    ]);
  };

  const removeExerciseBlock = (id) => {
    setExerciseInputs((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <View className="flex-1 bg-black">
      <ScrollView
        className="flex-1 bg-black px-4 pt-14"
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f97316" />}
      >
        <View className="items-center mb-6">
          <Text className="text-orange-500 text-base font-semibold uppercase tracking-widest mb-2">
            ✦ Log Session
          </Text>
          <Text className="text-white text-4xl text-center font-extrabold">
            Build Your Workout 💪
          </Text>
          {reusedFrom && (
            <View className="mt-3 bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-2 flex-row items-center gap-2">
              <Text className={`text-sm ${reusedFrom === "OutChat" ? "text-orange-400" : "text-green-400"}`}>
                {reusedFrom === "OutChat" ? "✦" : "↺"}
              </Text>
              <Text className="text-neutral-400 text-sm">
                {reusedFrom === "OutChat" ? "Suggested by OutChat — adjust as needed" : `Loaded from ${reusedFrom} — add or modify below`}
              </Text>
            </View>
          )}
        </View>

        {exerciseInputs.map((block, index) => (
          <ExerciseBlock
            key={block.id}
            block={block}
            index={index}
            muscleOptions={muscleOptions}
            exerciseMap={exerciseMap}
            updateInput={updateInput}
            updateSetValue={updateSetValue}
            addSetToBlock={addSetToBlock}
            removeSetFromBlock={removeSetFromBlock}
            removeExerciseBlock={removeExerciseBlock}
          />
        ))}

        <TouchableOpacity
          onPress={addExerciseBlock}
          className="bg-neutral-800 border border-neutral-600 rounded-2xl py-4 mb-3"
        >
          <Text className="text-white text-center text-lg font-semibold">
            + Add Exercise
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={async () => {
            const result = await logWorkout(exerciseInputs);
            if (result.success) {
              setExerciseInputs([{ id: Date.now().toString(), muscleGroup: "", exercise: "", sets: [{ reps: "", weight: "" }] }]);
              setReusedFrom(null);
              Alert.alert("Workout Logged Successfully!");
            } else {
              Alert.alert("Failed to log workout: " + result.message);
            }
          }}
          className="bg-orange-500 rounded-2xl py-5 mt-2"
        >
          <Text className="text-white text-center text-xl font-extrabold tracking-wide">
            Finish Workout ✅
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
