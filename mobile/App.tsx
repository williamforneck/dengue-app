import { Roboto_400Regular, Roboto_700Bold } from "@expo-google-fonts/roboto";

import { AuthContextProvider } from "@contexts/AuthContext";
import { Loading } from "@components/Loading";
import { NativeBaseProvider } from "native-base";
import { Routes } from "@routes/index";
import { LogBox, StatusBar } from "react-native";
import { THEME } from "./src/theme";
import { useFonts } from "expo-font";
import { useEffect } from "react";

export default function App() {
  const [fontsLoaded] = useFonts({ Roboto_400Regular, Roboto_700Bold });

  useEffect(() => {
    LogBox.ignoreLogs([
      "In React 18, SSRProvider is not necessary and is a noop. You can remove it from your app.",
    ]);
  }, []);

  return (
    <NativeBaseProvider theme={THEME}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <AuthContextProvider>
        {fontsLoaded ? <Routes /> : <Loading />}
      </AuthContextProvider>
    </NativeBaseProvider>
  );
}
