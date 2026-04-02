import { doc, getDocs, setDoc, collection, addDoc } from "firebase/firestore";
import { FIREBASE_DB } from "../FirebaseConfig";

const defaultMuscleGroups = [
  'Back',
  'Biceps',
  'Chest',
  'Legs',
  'Shoulders',
  'Triceps',
  'Cardio',
  'Core/Abs'
];

const defaultExercises = [
  // Back
  { name: 'Lat Pulldown', muscleGroup: 'Back' },
  { name: 'Seated Cable Row', muscleGroup: 'Back' },
  { name: 'Bent Over Barbell Row', muscleGroup: 'Back' },
  { name: 'Pull-Ups', muscleGroup: 'Back' },
  { name: 'T-Bar Row', muscleGroup: 'Back' },
  { name: 'Single Arm Dumbbell Row', muscleGroup: 'Back' },
  { name: 'Deadlift', muscleGroup: 'Back' },
  { name: 'Cable Pullover', muscleGroup: 'Back' },
  { name: 'Chest Supported Row', muscleGroup: 'Back' },
  { name: 'Face Pull', muscleGroup: 'Back' },

  // Biceps
  { name: 'Barbell Curl', muscleGroup: 'Biceps' },
  { name: 'Hammer Curl', muscleGroup: 'Biceps' },
  { name: 'Preacher Curl', muscleGroup: 'Biceps' },
  { name: 'Concentration Curl', muscleGroup: 'Biceps' },
  { name: 'Incline Dumbbell Curl', muscleGroup: 'Biceps' },
  { name: 'Cable Curl', muscleGroup: 'Biceps' },
  { name: 'Reverse Curl', muscleGroup: 'Biceps' },
  { name: 'Spider Curl', muscleGroup: 'Biceps' },

  // Chest
  { name: 'Flat Barbell Bench Press', muscleGroup: 'Chest' },
  { name: 'Incline Barbell Bench Press', muscleGroup: 'Chest' },
  { name: 'Incline Dumbbell Press', muscleGroup: 'Chest' },
  { name: 'Decline Bench Press', muscleGroup: 'Chest' },
  { name: 'Dumbbell Fly', muscleGroup: 'Chest' },
  { name: 'Cable Fly', muscleGroup: 'Chest' },
  { name: 'Push-Ups', muscleGroup: 'Chest' },
  { name: 'Chest Dips', muscleGroup: 'Chest' },
  { name: 'Pec Deck Machine', muscleGroup: 'Chest' },
  { name: 'Landmine Press', muscleGroup: 'Chest' },

  // Legs
  { name: 'Barbell Back Squat', muscleGroup: 'Legs' },
  { name: 'Front Squat', muscleGroup: 'Legs' },
  { name: 'Leg Press', muscleGroup: 'Legs' },
  { name: 'Lunges', muscleGroup: 'Legs' },
  { name: 'Romanian Deadlift', muscleGroup: 'Legs' },
  { name: 'Leg Extension', muscleGroup: 'Legs' },
  { name: 'Leg Curl', muscleGroup: 'Legs' },
  { name: 'Hip Thrust', muscleGroup: 'Legs' },
  { name: 'Calf Raise', muscleGroup: 'Legs' },
  { name: 'Bulgarian Split Squat', muscleGroup: 'Legs' },
  { name: 'Hack Squat', muscleGroup: 'Legs' },
  { name: 'Sumo Deadlift', muscleGroup: 'Legs' },

  // Shoulders
  { name: 'Barbell Overhead Press', muscleGroup: 'Shoulders' },
  { name: 'Dumbbell Shoulder Press', muscleGroup: 'Shoulders' },
  { name: 'Lateral Raise', muscleGroup: 'Shoulders' },
  { name: 'Front Raise', muscleGroup: 'Shoulders' },
  { name: 'Rear Delt Fly', muscleGroup: 'Shoulders' },
  { name: 'Arnold Press', muscleGroup: 'Shoulders' },
  { name: 'Cable Lateral Raise', muscleGroup: 'Shoulders' },
  { name: 'Upright Row', muscleGroup: 'Shoulders' },
  { name: 'Machine Shoulder Press', muscleGroup: 'Shoulders' },

  // Triceps
  { name: 'Tricep Pushdown', muscleGroup: 'Triceps' },
  { name: 'Overhead Tricep Extension', muscleGroup: 'Triceps' },
  { name: 'Close-Grip Bench Press', muscleGroup: 'Triceps' },
  { name: 'Tricep Dips', muscleGroup: 'Triceps' },
  { name: 'Skull Crushers', muscleGroup: 'Triceps' },
  { name: 'Cable Overhead Tricep Extension', muscleGroup: 'Triceps' },
  { name: 'Diamond Push-Ups', muscleGroup: 'Triceps' },
  { name: 'Kickbacks', muscleGroup: 'Triceps' },

  // Cardio
  { name: 'Treadmill Run', muscleGroup: 'Cardio' },
  { name: 'Outdoor Run', muscleGroup: 'Cardio' },
  { name: 'Cycling', muscleGroup: 'Cardio' },
  { name: 'Jump Rope', muscleGroup: 'Cardio' },
  { name: 'Rowing Machine', muscleGroup: 'Cardio' },
  { name: 'Stairmaster', muscleGroup: 'Cardio' },
  { name: 'Elliptical', muscleGroup: 'Cardio' },
  { name: 'HIIT Sprint Intervals', muscleGroup: 'Cardio' },
  { name: 'Battle Ropes', muscleGroup: 'Cardio' },

  // Core/Abs
  { name: 'Plank', muscleGroup: 'Core/Abs' },
  { name: 'Russian Twists', muscleGroup: 'Core/Abs' },
  { name: 'Leg Raises', muscleGroup: 'Core/Abs' },
  { name: 'Bicycle Crunches', muscleGroup: 'Core/Abs' },
  { name: 'Cable Crunch', muscleGroup: 'Core/Abs' },
  { name: 'Ab Wheel Rollout', muscleGroup: 'Core/Abs' },
  { name: 'Hanging Knee Raises', muscleGroup: 'Core/Abs' },
  { name: 'Sit-Ups', muscleGroup: 'Core/Abs' },
  { name: 'Side Plank', muscleGroup: 'Core/Abs' },
  { name: 'Mountain Climbers', muscleGroup: 'Core/Abs' },
];


export const initializeUserData = async (userId) => {
  const userDocRef = doc(FIREBASE_DB, 'users', userId);
  const muscleGroupsRef = collection(FIREBASE_DB, `users/${userId}/muscleGroups`);
  const exercisesRef = collection(FIREBASE_DB, `users/${userId}/exercises`);

  // Create user doc
  await setDoc(userDocRef, { createdAt: Date.now() }, { merge: true });

  // Add default muscle groups if none exist
  const existingGroups = await getDocs(muscleGroupsRef);
  if (existingGroups.empty) {
    for (const group of defaultMuscleGroups) {
      await addDoc(muscleGroupsRef, { name: group });
    }
  }

  // Add default exercises if none exist
  const existingExercises = await getDocs(exercisesRef);
  if (existingExercises.empty) {
    for (const ex of defaultExercises) {
      await addDoc(exercisesRef, ex);
    }
  }
};


export const greeting = ['Ready to crush it today?', "Let's freaking gooo!", "Uff The Rush!", "Make sure to get your protein!", "All you had to do was follow the damn workout CJ!"]