import { useRouter } from "expo-router";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { auth, FIREBASE_DB } from "../../FirebaseConfig";
import "../../global.css";
import { greeting } from "../../utils/initializeUserData";
import { getSuggestedMuscle } from "../../utils/gemini";

export default function home() {
  const [username, setUsername] = useState("");
  const [lastworkout, setLastworkout] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const router = useRouter();
  const randomNum = Math.floor(Math.random()*5);



  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const fetchUserName = async () => {
      try {
        const userinfoSnap = await getDocs(
          collection(FIREBASE_DB, `users/${user.uid}/userinfo`)
        );

        if (!userinfoSnap.empty) {
          const userInfoDoc = userinfoSnap.docs[0];
          const fullName = userInfoDoc.data().name;
          const firstName = fullName.split(" ")[0];
          setUsername(firstName);
        }
      } catch (e) {
        console.error("Error fetching user name: ", e.message);
      }
    };

    const fetchLastWorkout = async () => {
      try {
        const workoutRef = collection(FIREBASE_DB, `users/${user.uid}/workout`);
        const workoutQuery = query(workoutRef, orderBy("createdAt", "desc"), limit(5));
        const workoutSnap = await getDocs(workoutQuery);

        if (!workoutSnap.empty) {
          const latestWorkout = workoutSnap.docs[0].data();
          const workoutDate = latestWorkout.createdAt?.toDate?.();
          const formattedDate = workoutDate
            ? workoutDate.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })
            : "Unknown Date";

          const muscleGroups = [
            ...new Set(latestWorkout.exercises.map((ex) => ex.muscleGroup)),
          ].join(", ");
          setLastworkout(`${muscleGroups} — ${formattedDate}`);

          const recentWorkouts = workoutSnap.docs.map(d => d.data());
          const aiSuggestion = await getSuggestedMuscle(recentWorkouts);
          if (aiSuggestion) setSuggestion(aiSuggestion);
        }
      } catch (e) {
        console.error("Error fetching last workout: ", e.message);
      }
    };
    
    fetchUserName();
    fetchLastWorkout();
  }, []);

  return (
    <View className="bg-black flex-1 pb-32">
      {/* TITLE AND GREETING */}
      <View className="pt-16 px-6 pb-6">
        <Text className="text-orange-500 text-6xl font-extrabold text-center tracking-widest mb-2">
          OUTRACK
        </Text>
        <Text className="text-white text-center font-semibold text-3xl mt-1">
          Welcome back, {username} 👋
        </Text>
        <Text className="text-neutral-500 text-center text-lg mt-2">
          {greeting[randomNum]}
        </Text>
      </View>

      {/* Last Workout Card */}
      <View className="mx-4 mb-4">
        <TouchableOpacity
          className="bg-neutral-900 border border-neutral-700 px-5 py-5 rounded-2xl"
          onPress={() => router.replace("history")}
        >
          <Text className="text-neutral-500 text-sm font-semibold uppercase tracking-widest mb-2">
            Last Session
          </Text>
          <Text className="text-neutral-300 text-xl">
            {lastworkout || "No workouts logged yet — start one!"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* AI Suggestion */}
      {suggestion ? (
        <View className="mx-4 mb-4">
          <View className="bg-neutral-900 border border-orange-500 px-5 py-4 rounded-2xl flex-row gap-3 items-center">
            <Text className="text-orange-400 text-base">✦</Text>
            <Text className="text-neutral-300 text-lg flex-1">{suggestion}</Text>
          </View>
        </View>
      ) : null}

      {/* CTA Button */}
      <View className="mx-4 mt-4">
        <TouchableOpacity
          className="bg-orange-500 rounded-2xl py-6"
          onPress={() => router.replace("/(app)/workoutlog")}
          activeOpacity={0.7}
        >
          <Text className="text-center text-3xl text-white font-extrabold tracking-wider">
            START HUSTLING 🔥
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
