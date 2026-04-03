import { useRouter } from "expo-router";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  where,
  Timestamp,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View, ScrollView, RefreshControl, ActivityIndicator } from "react-native";
import { auth, FIREBASE_DB } from "../../FirebaseConfig";
import "../../global.css";
import { greeting } from "../../utils/initializeUserData";
import { getSuggestedMuscle } from "../../utils/gemini";

const HYPE_MESSAGES = [
  "Well done King!",
  "That's my goat!",
  "That lock in was insane!",
  "You ate and left no crumbs fr.",
  "No days off, that's the vibe.",
  "Bro is built different no cap.",
  "W session, no debate.",
];

// Local date string — avoids UTC vs local timezone mismatches
const localDateStr = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const todayStr = () => localDateStr(new Date());

export default function home() {
  const [username, setUsername] = useState("");
  const [lastworkout, setLastworkout] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [loggedToday, setLoggedToday] = useState(false);
  const [hypeMsg] = useState(HYPE_MESSAGES[Math.floor(Math.random() * HYPE_MESSAGES.length)]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const randomNum = Math.floor(Math.random() * 5);

  const fetchData = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userinfoSnap = await getDocs(collection(FIREBASE_DB, `users/${user.uid}/userinfo`));
      if (!userinfoSnap.empty) {
        const fullName = userinfoSnap.docs[0].data().name;
        setUsername(fullName.split(" ")[0]);
      }
    } catch (e) {
      console.error("Error fetching user name: ", e.message);
    }

    try {
      // Fetch last workout for the "Last Session" card
      const latestQuery = query(
        collection(FIREBASE_DB, `users/${user.uid}/workout`),
        orderBy("createdAt", "desc"),
        limit(1)
      );
      const latestSnap = await getDocs(latestQuery);
      if (!latestSnap.empty) {
        const latestWorkout = latestSnap.docs[0].data();
        const workoutDate = latestWorkout.createdAt?.toDate?.();
        const formattedDate = workoutDate
          ? workoutDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
          : "Unknown Date";
        const muscleGroups = [...new Set(latestWorkout.exercises.map(ex => ex.muscleGroup))].join(", ");
        setLastworkout(`${muscleGroups} — ${formattedDate}`);
      }

      // Directly query Firestore for any workout logged today
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const todayQuery = query(
        collection(FIREBASE_DB, `users/${user.uid}/workout`),
        where("createdAt", ">=", Timestamp.fromDate(startOfToday)),
        limit(1)
      );
      const todaySnap = await getDocs(todayQuery);

      if (!todaySnap.empty) {
        // Workout logged today — show hype, no API call
        setLoggedToday(true);
        setSuggestion("");
        return;
      }

      // No workout today — check Firestore cache first
      setLoggedToday(false);
      const cacheRef = doc(FIREBASE_DB, `users/${user.uid}/homeCache/suggestion`);
      const cacheSnap = await getDoc(cacheRef);
      if (cacheSnap.exists() && cacheSnap.data().date === todayStr()) {
        setSuggestion(cacheSnap.data().suggestion);
        return;
      }

      // Cache miss — fetch recent workouts, call API once, store result
      const recentQuery = query(
        collection(FIREBASE_DB, `users/${user.uid}/workout`),
        orderBy("createdAt", "desc"),
        limit(5)
      );
      const recentSnap = await getDocs(recentQuery);
      const recentWorkouts = recentSnap.docs.map(d => d.data());
      if (recentWorkouts.length > 0) {
        const aiSuggestion = await getSuggestedMuscle(recentWorkouts);
        if (aiSuggestion) {
          setSuggestion(aiSuggestion);
          await setDoc(cacheRef, { date: todayStr(), suggestion: aiSuggestion });
        }
      }
    } catch (e) {
      console.error("Error fetching last workout: ", e.message);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <ScrollView
      className="bg-black flex-1"
      contentContainerStyle={{ paddingBottom: 128 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f97316" />}
    >
      {/* Refresh indicator */}
      {refreshing && (
        <View className="items-center pt-4">
          <ActivityIndicator color="#f97316" size="small" />
        </View>
      )}

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

      {/* AI Suggestion or Hype Message */}
      {(loggedToday || suggestion) ? (
        <View className="mx-4 mb-4">
          <View className="bg-neutral-900 border border-orange-500 px-5 py-4 rounded-2xl flex-row gap-3 items-center">
            <Text className="text-orange-400 text-base">✦</Text>
            <Text className="text-neutral-300 text-lg flex-1">
              {loggedToday ? hypeMsg : suggestion}
            </Text>
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
    </ScrollView>
  );
}
