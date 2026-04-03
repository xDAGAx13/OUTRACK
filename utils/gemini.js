import { GoogleGenAI } from '@google/genai';
import Constants from 'expo-constants';

const getClient = () => new GoogleGenAI({
  apiKey: Constants.expoConfig.extra.GEMINI_API_KEY,
});

const withTimeout = (promise, ms = 15000) =>
  Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), ms)),
  ]);

export const getWorkoutSummary = async (exercises) => {
  try {
    const ai = getClient();
    const exerciseList = exercises
      .map(e => `${e.exercise} (${e.muscleGroup}): ${e.sets.map(s => `${s.reps} reps @ ${s.weight}kg`).join(', ')}`)
      .join('\n');

    const response = await withTimeout(ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a fitness coach. Summarize this workout in ONE short punchy sentence (max 12 words). Be specific and motivating:\n${exerciseList} and do not use Asterisks`,
    }));

    return response.text.trim();
  } catch (e) {
    console.error('Gemini summary error:', e);
    return null;
  }
};

export const getSuggestedMuscle = async (recentWorkouts) => {
  try {
    const ai = getClient();
    const history = recentWorkouts.slice(0, 5).map((w, i) => {
      const muscles = [...new Set(w.exercises.map(e => e.muscleGroup))].join(', ');
      return `Workout ${i + 1}: ${muscles}`;
    }).join('\n');

    const response = await withTimeout(ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a fitness coach. Based on this recent workout history:\n${history}\n\nSuggest ONE muscle group to train next in ONE short sentence. Try to use Gen-z Lingo. No asterisks or formatting.`,
    }));

    return response.text.trim();
  } catch (e) {
    console.error('Gemini suggestion error:', e);
    return null;
  }
};

export const sendChatMessage = async (messages, context) => {
  try {
    const ai = getClient();

    const contents = [
      {
        role: 'user',
        parts: [{ text: `You are a fitness coach for the app OUTRACK. Use this user data as context:\n${context}\n\nRespond concisely — max 3-4 short sentences. No fluff, no long lists, straight to the point. Use **bold** sparingly for key terms only. IMPORTANT: When you suggest or plan a specific workout, append this exact tag at the very end of your response (no extra text after it): WORKOUT_JSON:{"exercises":[{"muscleGroup":"MuscleGroup","exercise":"ExerciseName","sets":[{"reps":"10","weight":"0"}]}]} — fill in real values, keep reps/weight as strings, weight 0 if bodyweight. Only include this tag when you are explicitly planning a workout routine.` }],
      },
      { role: 'model', parts: [{ text: 'Got it! I\'m ready to help as your personal fitness coach.' }] },
      ...messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
    ];

    const response = await withTimeout(ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
    }));

    return response.text.trim();
  } catch (e) {
    console.error('Gemini chat error:', e);
    throw e;
  }
};
