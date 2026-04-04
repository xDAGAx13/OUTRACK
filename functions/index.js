const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { GoogleGenAI } = require("@google/genai");
const { defineSecret } = require("firebase-functions/params");

const geminiKey = defineSecret("GEMINI_API_KEY");

const withTimeout = (promise, ms = 15000) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), ms)
    ),
  ]);

// Chat with AI coach
exports.chat = onCall({ secrets: [geminiKey] }, async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Login required.");

  const { messages, context } = request.data;
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new HttpsError("invalid-argument", "Messages are required.");
  }

  const ai = new GoogleGenAI({ apiKey: geminiKey.value() });

  const contents = [
    {
      role: "user",
      parts: [{ text: `You are a fitness coach for the app OUTRACK. Use this user data as context:\n${context || ""}\n\nRespond concisely — max 3-4 short sentences. No fluff, no long lists, straight to the point. Use **bold** sparingly for key terms only. IMPORTANT: When you suggest or plan a specific workout, append this exact tag at the very end of your response (no extra text after it): WORKOUT_JSON:{"exercises":[{"muscleGroup":"MuscleGroup","exercise":"ExerciseName","sets":[{"reps":"10","weight":"0"}]}]} — fill in real values, keep reps/weight as strings, weight 0 if bodyweight. Only include this tag when you are explicitly planning a workout routine.` }],
    },
    {
      role: "model",
      parts: [{ text: "Got it! I'm ready to help as your personal fitness coach." }],
    },
    ...messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
  ];

  try {
    const response = await withTimeout(
      ai.models.generateContent({ model: "gemini-2.5-flash", contents })
    );
    return { text: response.text.trim() };
  } catch (e) {
    throw new HttpsError("internal", "AI request failed. Please try again.");
  }
});

// Workout summary (one punchy sentence)
exports.workoutSummary = onCall({ secrets: [geminiKey] }, async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Login required.");

  const { exerciseList } = request.data;
  if (!exerciseList) throw new HttpsError("invalid-argument", "Exercise list required.");

  const ai = new GoogleGenAI({ apiKey: geminiKey.value() });

  try {
    const response = await withTimeout(
      ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `You are a fitness coach. Summarize this workout in ONE short punchy sentence (max 12 words). Be specific and motivating:\n${exerciseList}\nDo not use asterisks.`,
      })
    );
    return { text: response.text.trim() };
  } catch (e) {
    throw new HttpsError("internal", "AI request failed. Please try again.");
  }
});

// Suggest next muscle group
exports.suggestedMuscle = onCall({ secrets: [geminiKey] }, async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Login required.");

  const { history } = request.data;
  if (!history) throw new HttpsError("invalid-argument", "Workout history required.");

  const ai = new GoogleGenAI({ apiKey: geminiKey.value() });

  try {
    const response = await withTimeout(
      ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `You are a fitness coach. Based on this recent workout history:\n${history}\n\nSuggest ONE muscle group to train next in ONE short sentence. Use Gen-Z lingo. No asterisks or formatting.`,
      })
    );
    return { text: response.text.trim() };
  } catch (e) {
    throw new HttpsError("internal", "AI request failed. Please try again.");
  }
});
