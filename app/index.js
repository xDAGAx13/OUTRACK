import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth';
import { Redirect } from 'expo-router';
import { auth } from '../FirebaseConfig';


export default function index() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    const unsub = onAuthStateChanged(auth, (user)=>{
      setUser(user);
      setLoading(false);
    });
    return unsub;
  }, [])

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <Redirect href={user?'/(app)/profile':'/login'}/>
  )
}