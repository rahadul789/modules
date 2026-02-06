import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import LocationPermissionScreen from "../screens/LocationPermissionScreen";
import MapScreen from "../screens/MapScreen";
import RestaurantDetailScreen from "../screens/RestaurantDetailScreen";

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    // <NavigationContainer>
    <Stack.Navigator
      initialRouteName="LocationPermission"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: "#F8F9FA" },
      }}
    >
      <Stack.Screen
        name="LocationPermission"
        component={LocationPermissionScreen}
      />
      <Stack.Screen name="MapScreen" component={MapScreen} />
      <Stack.Screen
        name="RestaurantDetail"
        component={RestaurantDetailScreen}
        options={{
          headerShown: true,
          presentation: "card",
        }}
      />
    </Stack.Navigator>
    // </NavigationContainer>
  );
};

export default AppNavigator;
