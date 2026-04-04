import { httpsCallable } from 'firebase/functions';
import { FIREBASE_FUNCTIONS } from '../FirebaseConfig';

export const getWorkoutSummary = async (exercises) => {
  try {
    const exerciseList = exercises
      .map(e => `${e.exercise} (${e.muscleGroup}): ${e.sets.map(s => `${s.reps} reps @ ${s.weight}kg`).join(', ')}`)
      .join('\n');

    const fn = httpsCallable(FIREBASE_FUNCTIONS, 'workoutSummary');
    const result = await fn({ exerciseList });
    return result.data.text;
  } catch (e) {
    console.error('workoutSummary error:', e.message);
    return null;
  }
};

export const getSuggestedMuscle = async (recentWorkouts) => {
  try {
    const history = recentWorkouts.slice(0, 5).map((w, i) => {
      const muscles = [...new Set(w.exercises.map(e => e.muscleGroup))].join(', ');
      return `Workout ${i + 1}: ${muscles}`;
    }).join('\n');

    const fn = httpsCallable(FIREBASE_FUNCTIONS, 'suggestedMuscle');
    const result = await fn({ history });
    return result.data.text;
  } catch (e) {
    console.error('suggestedMuscle error:', e.message);
    return null;
  }
};

export const sendChatMessage = async (messages, context) => {
  try {
    const fn = httpsCallable(FIREBASE_FUNCTIONS, 'chat', { timeout: 20000 });
    const result = await fn({ messages, context });
    return result.data.text;
  } catch (e) {
    console.error('chat error:', e.message);
    throw e;
  }
};
