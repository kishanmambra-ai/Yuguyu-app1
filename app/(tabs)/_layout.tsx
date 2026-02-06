import { Tabs } from "expo-router";
import {
  Calendar as CalendarIcon,
  Dumbbell,
  TrendingUp,
  UtensilsCrossed,
  User,
} from "lucide-react-native";
import React, { useMemo } from "react";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  
  const tabBarStyle = useMemo(() => ({
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: Colors.primaryAccent,
    height: Platform.OS === "ios" ? 49 + insets.bottom : 64 + insets.bottom,
    paddingTop: Platform.OS === "ios" ? 4 : 8,
    paddingBottom: Platform.OS === "ios" ? insets.bottom : Math.max(8, insets.bottom),
    borderRadius: 0,
    elevation: Platform.OS === "android" ? 8 : 0,
    shadowOpacity: Platform.OS === "ios" ? 0.3 : 0,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 4,
    shadowColor: Colors.primaryAccent,
  }), [insets.bottom]);

  const screenOptions = useMemo(() => ({
    tabBarActiveTintColor: Colors.primaryAccent,
    tabBarInactiveTintColor: '#999999',
    tabBarStyle,
    tabBarLabelStyle: {
      fontSize: Platform.OS === "ios" ? 10 : 12,
      fontWeight: Platform.OS === "ios" ? "500" as const : "600" as const,
      marginTop: Platform.OS === "ios" ? -2 : 0,
    },
    tabBarItemStyle: {
      borderRadius: 0,
      paddingTop: Platform.OS === "ios" ? 4 : 0,
    },
    tabBarIconStyle: {
      marginTop: Platform.OS === "ios" ? 2 : 0,
    },
    headerStyle: {
      backgroundColor: Colors.background,
      borderBottomWidth: Platform.OS === "ios" ? 0.5 : 1,
      borderBottomColor: Platform.OS === "ios" ? '#C6C6C8' : Colors.border,
      elevation: Platform.OS === "android" ? 4 : 0,
      shadowOpacity: Platform.OS === "ios" ? 0.12 : 0,
      shadowOffset: { width: 0, height: 0.5 },
      shadowRadius: 0,
      shadowColor: '#000000',
    },
    headerTitleStyle: {
      fontSize: Platform.OS === "ios" ? 17 : 18,
      fontWeight: Platform.OS === "ios" ? "600" as const : "600" as const,
      color: Colors.text,
    },
    headerShown: true,
  }), [tabBarStyle]);

  return (
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen
        name="diet"
        options={{
          title: "Diet",
          tabBarIcon: ({ color, size }) => (
            <UtensilsCrossed color={color} size={Platform.OS === "ios" ? 26 : size} strokeWidth={Platform.OS === "ios" ? 2 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="workouts"
        options={{
          title: "Workouts",
          tabBarIcon: ({ color, size }) => (
            <Dumbbell color={color} size={Platform.OS === "ios" ? 26 : size} strokeWidth={Platform.OS === "ios" ? 2 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="journey"
        options={{
          title: "Journey",
          tabBarIcon: ({ color, size }) => (
            <TrendingUp color={color} size={Platform.OS === "ios" ? 26 : size} strokeWidth={Platform.OS === "ios" ? 2 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          tabBarIcon: ({ color, size }) => (
            <CalendarIcon color={color} size={Platform.OS === "ios" ? 26 : size} strokeWidth={Platform.OS === "ios" ? 2 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User color={color} size={Platform.OS === "ios" ? 26 : size} strokeWidth={Platform.OS === "ios" ? 2 : 2} />,
        }}
      />
    </Tabs>
  );
}
