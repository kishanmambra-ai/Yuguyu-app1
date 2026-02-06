import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Platform, StatusBar, UIManager } from "react-native";

import Colors from "@/constants/colors";
import { AuthContext } from "@/contexts/AuthContext";
import { DietProvider } from "@/contexts/DietContext";
import { WorkoutProvider } from "@/contexts/WorkoutContext";
import { trpc, trpcClient } from "@/lib/trpc";

SplashScreen.preventAutoHideAsync();

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Back",
        headerStyle: {
          backgroundColor: Colors.background,
        },
        headerTintColor: Colors.text,
        headerTitleStyle: {
          fontWeight: "600",
          fontSize: Platform.OS === 'ios' ? 17 : 18,
        },
        headerBackTitleStyle: {
          fontSize: Platform.OS === 'ios' ? 17 : 14,
        },
        headerShadowVisible: Platform.OS === 'ios',
        animation: Platform.OS === 'ios' ? 'default' : 'fade',
      }}
    >
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
      <Stack.Screen
        name="forgot-password"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="reset-password"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="create-routine"
        options={{ 
          headerShown: false, 
          presentation: "modal",
          animation: Platform.OS === 'ios' ? 'default' : 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="edit-routine"
        options={{ 
          headerShown: false, 
          presentation: "modal",
          animation: Platform.OS === 'ios' ? 'default' : 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="active-workout"
        options={{ 
          headerShown: false,
          gestureEnabled: false,
          animation: Platform.OS === 'ios' ? 'default' : 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="exercise-library"
        options={{ 
          headerShown: false, 
          presentation: "modal",
          animation: Platform.OS === 'ios' ? 'default' : 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="meal-library"
        options={{ 
          headerShown: false, 
          presentation: "modal",
          animation: Platform.OS === 'ios' ? 'default' : 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="workout-templates"
        options={{ 
          headerShown: false, 
          presentation: "modal",
          animation: Platform.OS === 'ios' ? 'default' : 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="record-activity"
        options={{ 
          headerShown: false,
          gestureEnabled: false,
          animation: Platform.OS === 'ios' ? 'default' : 'slide_from_right',
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AuthContext>
          <WorkoutProvider>
            <DietProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                {Platform.OS === 'android' && (
                  <StatusBar
                    barStyle="dark-content"
                    backgroundColor={Colors.background}
                    translucent={false}
                    animated={true}
                  />
                )}
                {Platform.OS === 'ios' && (
                  <StatusBar
                    barStyle="dark-content"
                    animated={true}
                    translucent={false}
                  />
                )}
                <RootLayoutNav />
              </GestureHandlerRootView>
            </DietProvider>
          </WorkoutProvider>
        </AuthContext>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
