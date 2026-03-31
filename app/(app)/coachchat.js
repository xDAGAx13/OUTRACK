import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native'
import React from 'react'
import { useState } from 'react'
import { useEffect } from 'react';
import {  FIREBASE_DB } from '../../FirebaseConfig';
import { collection, doc, getDocs } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../../FirebaseConfig';
import { sendChatMessage } from '../../utils/gemini';




export default function coachchat() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState('');
  

  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  useEffect(()=>{
    const fetchUser = async ()=>{
      const user = auth.currentUser;
        if(!user)return;
      try{
        const userinfoSnap = await getDocs(collection(FIREBASE_DB, `users/${user.uid}/userinfo`));
        const workoutSnap = await getDocs(collection(FIREBASE_DB, `users/${user.uid}/workout`));

        let profile = {};
        userinfoSnap.forEach(doc=>{
          profile = {...profile, ...doc.data()};
        })

        const workouts = workoutSnap.docs.map(doc=>doc.data());

        const formattedWorkouts = workouts.map((log, i)=>(
          `Workout ${i+1}: ${JSON.stringify(log)}`
        )).join('\n');

        const formattedProfile = Object.entries(profile).map(([key, value])=>(
          `${capitalize(key)}: ${value}`
        )).join('\n')

        const context = `User Profile :\n ${formattedProfile}\n\nWorkout History: \n${formattedWorkouts}`;
        setContext(context);
      }catch(e){
        console.error('Error Fetching Data: ', e.message);
      }
    }
    fetchUser();
  },[])

  const sendMessagetoGPT = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setLoading(true);
    setInput('');
    try {
      const reply = await sendChatMessage(updatedMessages, context);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (e) {
      console.error('Gemini chat error: ', e.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':'height'}
    className="flex-1 bg-black"
    keyboardVerticalOffset={0}>
    <View className="flex-1 bg-black p-3 pb-32">
      <Text className="text-white text-4xl font-bold text-center mb-2 mt-4">OutChat</Text>
      <ScrollView className="flex-1 mb-3">
        {messages.map((msg, idx)=>(
          <View key={idx} className="mb-2">
            <Text className={`text-lg ${msg.role==='user'?'text-right text-orange-400': 'text-left text-white'}`}>
              {msg.content}
            </Text>
          </View>
        ))}
        {loading&&<ActivityIndicator size='large' className="mt-4"/>}
      </ScrollView>
      <View className="flex-row items-center gap-2 mx-2">
        <TextInput 
        value={input}
        onChangeText={setInput}
        placeholder="Ask Awayyy!!!!!!"
        placeholderTextColor={'gray'}
        className="bg-white flex-1 px-4 py-3 rounded-2xl text-xl"/>
        <TouchableOpacity onPress={sendMessagetoGPT} className="bg-orange-500 p-3 rounded-3xl">
          <Text className=""><Ionicons name='send' color='#fff' size={25}/></Text>
        </TouchableOpacity>
      </View>
    </View>
    </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  )
}