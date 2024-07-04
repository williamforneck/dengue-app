import {
  BottomTabNavigationProp,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";

import { NewFocus } from "@screens/NewFocus";
import { Rank } from "@screens/Rank";
import RankSvg from "@assets/rank.svg";
import { Home } from "@screens/Home";
import HomeSvg from "@assets/home.svg";
import { Platform } from "react-native";
import { Profile } from "@screens/Profile";
import ProfileSvg from "@assets/profile.svg";
import { useTheme } from "native-base";
import { FocusDetails } from "@screens/FocusDetails";

type AppRoutes = {
  home: undefined;
  history: undefined;
  profile: undefined;
  addFocus: undefined;
  focusDetails: { id: number };
};

export type AppNavigatorRoutesProps = BottomTabNavigationProp<AppRoutes>;

const { Navigator, Screen } = createBottomTabNavigator<AppRoutes>();

export function AppRoutes() {
  const { sizes, colors } = useTheme();
  const iconSize = sizes[6];
  return (
    <Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.green[500],
        tabBarInactiveTintColor: colors.gray[200],
        tabBarStyle: {
          backgroundColor: colors.gray[600],
          borderTopWidth: 0,
          height: Platform.OS === "android" ? 64 : 96,
        },
      }}
    >
      <Screen
        name="home"
        component={Home}
        options={{
          tabBarIcon: ({ color }) => (
            <HomeSvg fill={color} width={iconSize} height={iconSize} />
          ),
        }}
      />
      <Screen
        name="history"
        component={Rank}
        options={{
          tabBarIcon: ({ color }) => (
            <RankSvg fill={color} width={iconSize} height={iconSize} />
          ),
        }}
      />
      <Screen
        name="profile"
        component={Profile}
        options={{
          tabBarIcon: ({ color }) => (
            <ProfileSvg fill={color} width={iconSize} height={iconSize} />
          ),
        }}
      />
      <Screen
        name="addFocus"
        component={NewFocus}
        options={{ tabBarButton: () => null }}
      />
      <Screen
        name="focusDetails"
        component={FocusDetails}
        options={{ tabBarButton: () => null }}
      />
    </Navigator>
  );
}