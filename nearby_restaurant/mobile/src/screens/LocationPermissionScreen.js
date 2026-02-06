import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  requestLocationPermission,
  getCurrentLocation,
  checkLocationServices,
} from "../utils/location";

const LocationPermissionScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    // Auto-request permission on mount
    handleRequestPermission();
  }, []);

  const handleRequestPermission = async () => {
    setIsLoading(true);
    setPermissionDenied(false);

    // Check if location services are enabled
    const servicesEnabled = await checkLocationServices();
    if (!servicesEnabled) {
      setIsLoading(false);
      Alert.alert(
        "Location Services Disabled",
        "Please enable location services in your device settings to use this feature.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Open Settings",
            onPress: () => Linking.openSettings(),
          },
        ],
      );
      return;
    }

    // Request permission
    const permissionResult = await requestLocationPermission();

    if (!permissionResult.granted) {
      setIsLoading(false);
      setPermissionDenied(true);
      return;
    }

    // Get current location
    const locationResult = await getCurrentLocation();

    setIsLoading(false);

    if (locationResult.success) {
      // Navigate to map screen with location
      navigation.replace("MapScreen", {
        userLocation: locationResult.location,
      });
    } else {
      Alert.alert(
        "Location Error",
        locationResult.error ||
          "Unable to get your current location. Please try again.",
        [{ text: "OK" }],
      );
    }
  };

  const handleOpenSettings = () => {
    Linking.openSettings();
  };

  if (permissionDenied) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="location-off" size={80} color="#E74C3C" />
          </View>

          <Text style={styles.title}>Location Permission Denied</Text>
          <Text style={styles.description}>
            We need access to your location to show you nearby restaurants.
            Please enable location permission in your device settings.
          </Text>

          <TouchableOpacity
            style={styles.settingsButton}
            onPress={handleOpenSettings}
            activeOpacity={0.8}
          >
            <Ionicons name="settings-outline" size={20} color="#FFFFFF" />
            <Text style={styles.settingsButtonText}>Open Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={handleRequestPermission}
            activeOpacity={0.8}
          >
            <Text style={styles.backButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="location" size={80} color="#007AFF" />
        </View>

        <Text style={styles.title}>Enable Location</Text>
        <Text style={styles.description}>
          We need your location to show you the best restaurants nearby. Your
          location is only used while you're using the app.
        </Text>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Getting your location...</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.button}
            onPress={handleRequestPermission}
            activeOpacity={0.8}
          >
            <Ionicons name="location-outline" size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>Enable Location</Text>
          </TouchableOpacity>
        )}

        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Ionicons name="checkmark-circle" size={20} color="#2ECC71" />
            <Text style={styles.infoText}>Find restaurants near you</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="checkmark-circle" size={20} color="#2ECC71" />
            <Text style={styles.infoText}>Get accurate distances</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="checkmark-circle" size={20} color="#2ECC71" />
            <Text style={styles.infoText}>Personalized recommendations</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  button: {
    backgroundColor: "#007AFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: "100%",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  settingsButton: {
    backgroundColor: "#007AFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: "100%",
    marginBottom: 12,
  },
  settingsButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  backButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    alignItems: "center",
    marginVertical: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  infoContainer: {
    marginTop: 48,
    width: "100%",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  infoText: {
    fontSize: 15,
    color: "#666",
    marginLeft: 12,
  },
});

export default LocationPermissionScreen;
