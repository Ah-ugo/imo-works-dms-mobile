import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import { createTamagui, TamaguiProvider } from "tamagui";
import { defaultConfig } from "@tamagui/config/v4";
import { PaperProvider } from "react-native-paper";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();
const config = createTamagui(defaultConfig);

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    PoppinsBlack: require("../assets/fonts/Poppins/Poppins-Black.ttf"),
    PoppinsBold: require("../assets/fonts/Poppins/Poppins-Bold.ttf"),
    PoppinsXBold: require("../assets/fonts/Poppins/Poppins-ExtraBold.ttf"),
    PoppinsXLight: require("../assets/fonts/Poppins/Poppins-ExtraLight.ttf"),
    PoppinsLight: require("../assets/fonts/Poppins/Poppins-Light.ttf"),
    PoppinsMed: require("../assets/fonts/Poppins/Poppins-Medium.ttf"),
    PoppinsReg: require("../assets/fonts/Poppins/Poppins-Regular.ttf"),
    PoppinsSemiBold: require("../assets/fonts/Poppins/Poppins-SemiBold.ttf"),
    PoppinsThin: require("../assets/fonts/Poppins/Poppins-Thin.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <PaperProvider>
      <TamaguiProvider config={config}>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen
              name="(auth)/signIn"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="(auth)/signUp"
              options={{ headerShown: false }}
            />
            <Stack.Screen name="(main)/home" options={{ headerShown: false }} />
            <Stack.Screen
              name="(main)/allProjects"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="(main)/projectDetails"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="(main)/recentFiles"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="(main)/fileItems"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="(main)/comingSoon"
              options={{ headerShown: false }}
            />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </TamaguiProvider>
    </PaperProvider>
  );
}
