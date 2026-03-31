import { View, TouchableOpacity } from "react-native";
import React from "react";
import { Tabs } from "expo-router";
import "../../global.css";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";

const HapticTab = (props) => (
  <TouchableOpacity
    {...props}
    onPress={(e) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      props.onPress?.(e);
    }}
  />
);

export default function AppLayout() {
  return (
    <View className="flex-1 bg-black mt-10">
      <View className="flex-1 ">
        
        <Tabs
        
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: "#ffa500",
            tabBarBackground: ()=>(
              <BlurView 
              intensity={50}
              tint="dark"
              style={{
                position: 'absolute',
                bottom: 15,
                left: 15,
                right: 15,
                borderRadius: 25,
              }}/>
            ),
            tabBarStyle: {
              backgroundColor: '#080808',
              height: 75,
              borderTopLeftRadius: 25,
              borderTopRightRadius: 25,
              marginHorizontal: 9,
              marginVertical: 0,
              position: 'absolute',
              elevation: 60,
              shadowColor: '#fff',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              borderColor: '#fb923c',
              borderWidth: 3,
              borderTopWidth: 3,
              borderBottomWidth: 0,
              flexDirection: 'row',
              display: 'flex',
            },
            tabBarItemStyle: {
              display: 'flex',
              paddingVertical: 5,
              justifyContent: "center",
              alignItems: "center",
            },
            tabBarShowLabel: false,
            tabBarButton: HapticTab,
          }}
        >
          <Tabs.Screen
            name="home"
            options={{
              title: "Home",
              tabBarIcon: ({ color, size, focused }) => (
                <Ionicons
                  name={focused ? "home" : "home-outline"}
                  size={30}
                  color={color}
                />
              ),
            }}
            
          />

          <Tabs.Screen
            name="workoutlog"
            options={{
              title: "Workout",
              tabBarIcon: ({ color, size, focused }) => (
                <Ionicons
                  name={focused ? "barbell" : "barbell-outline"}
                  size={30}
                  color={color}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="history"
            options={{
              title: "History",
              tabBarIcon: ({ color, size, focused }) => (
                <Ionicons
                  name={focused ? "document-text" : "document-text-outline"}
                  size={30}
                  color={color}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="coachchat"
            options={{
              title: "coachchat",
              tabBarIcon: ({ color, size, focused }) => (
                <Ionicons
                  name={focused ? "chatbubble" : "chatbubble-outline"}
                  size={30}
                  color={color}
                />
              ),
              
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: "profile",
              tabBarIcon: ({ color, size, focused }) => (
                <Ionicons
                  name={focused ? "person" : "person-outline"}
                  size={30}
                  color={color}
                />
              ),
            }}
          />
        </Tabs>
      </View>
    </View>
  );
}
