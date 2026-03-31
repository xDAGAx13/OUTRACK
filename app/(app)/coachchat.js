import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { FIREBASE_DB } from '../../FirebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../../FirebaseConfig';
import { sendChatMessage } from '../../utils/gemini';

const QUICK_PROMPTS = [
  'Plan my next workout',
  'Am I overtraining?',
  'How can I improve?',
  'Give me a rest day tip',
];

export default function coachchat() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState('');
  const [contextReady, setContextReady] = useState(false);
  const scrollRef = useRef(null);

  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  useEffect(() => {
    const fetchUser = async () => {
      const user = auth.currentUser;
      if (!user) return;
      try {
        const userinfoSnap = await getDocs(collection(FIREBASE_DB, `users/${user.uid}/userinfo`));
        const workoutSnap = await getDocs(collection(FIREBASE_DB, `users/${user.uid}/workout`));

        let profile = {};
        userinfoSnap.forEach((doc) => { profile = { ...profile, ...doc.data() }; });

        const workouts = workoutSnap.docs.map((doc) => doc.data());
        const formattedWorkouts = workouts.map((log, i) => `Workout ${i + 1}: ${JSON.stringify(log)}`).join('\n');
        const formattedProfile = Object.entries(profile).map(([key, value]) => `${capitalize(key)}: ${value}`).join('\n');

        const ctx = `User Profile:\n${formattedProfile}\n\nWorkout History:\n${formattedWorkouts}`;
        setContext(ctx);
        setContextReady(true);

        // Auto-greeting
        setLoading(true);
        try {
          const greeting = await sendChatMessage(
            [{ role: 'user', content: 'Give me a short personalized greeting based on my profile and recent workouts. Max 2 sentences. No asterisks.' }],
            ctx
          );
          setMessages([{ role: 'assistant', content: greeting }]);
        } catch (e) {
          setMessages([{ role: 'assistant', content: "Hey! I'm your AI coach. Ask me anything about your training." }]);
        } finally {
          setLoading(false);
        }
      } catch (e) {
        console.error('Error fetching data: ', e.message);
      }
    };
    fetchUser();
  }, []);

  const sendMessage = async (text) => {
    const content = (text || input).trim();
    if (!content) return;

    const userMessage = { role: 'user', content };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setLoading(true);
    setInput('');

    try {
      const reply = await sendChatMessage(updatedMessages, context);
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (e) {
      console.error('Gemini chat error: ', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages, loading]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-black"
        keyboardVerticalOffset={90}
      >
        {/* Header */}
        <View className="items-center pt-14 pb-4 px-6">
          <Text className="text-orange-500 text-base font-semibold uppercase tracking-widest mb-2">
            ✦ AI Coach
          </Text>
          <Text className="text-white text-4xl font-extrabold">OutChat</Text>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          className="flex-1 px-4"
          contentContainerStyle={{ paddingBottom: 16 }}
        >
          {messages.map((msg, idx) => (
            <View
              key={idx}
              className={`mb-3 max-w-xs ${msg.role === 'user' ? 'self-end items-end' : 'self-start items-start'}`}
            >
              {msg.role === 'assistant' && (
                <Text className="text-orange-500 text-xs font-bold mb-1 ml-1 uppercase tracking-widest">
                  ✦ Coach
                </Text>
              )}
              <View
                className={`rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-orange-500 rounded-tr-sm'
                    : 'bg-neutral-900 border border-neutral-700 rounded-tl-sm'
                }`}
              >
                <Text className={`text-base leading-relaxed ${msg.role === 'user' ? 'text-white' : 'text-neutral-200'}`}>
                  {msg.content}
                </Text>
              </View>
            </View>
          ))}

          {loading && (
            <View className="self-start bg-neutral-900 border border-neutral-700 rounded-2xl rounded-tl-sm px-4 py-3 mb-3">
              <ActivityIndicator color="#f97316" size="small" />
            </View>
          )}
        </ScrollView>

        {/* Quick Prompts */}
        {messages.length <= 1 && !loading && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="px-4 mb-3"
            contentContainerStyle={{ gap: 8, alignItems: 'center' }}
            style={{ flexGrow: 0 }}
          >
            {QUICK_PROMPTS.map((prompt) => (
              <TouchableOpacity
                key={prompt}
                onPress={() => sendMessage(prompt)}
                className="bg-neutral-900 border border-neutral-700 rounded-full px-4 py-2"
                style={{ alignSelf: 'flex-start' }}
              >
                <Text className="text-neutral-300 text-sm">{prompt}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Input Bar */}
        <View className="flex-row items-center gap-3 px-4 pb-36 pt-2 border-t border-neutral-800">
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask your coach..."
            placeholderTextColor="#555"
            className="bg-neutral-900 flex-1 px-4 py-3 rounded-2xl text-white text-base"
            style={{ borderWidth: 2, borderColor: '#404040' }}
            multiline
          />
          <TouchableOpacity
            onPress={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="bg-orange-500 p-3 rounded-2xl"
            style={{ opacity: loading || !input.trim() ? 0.4 : 1 }}
          >
            <Ionicons name="send" color="#fff" size={20} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
