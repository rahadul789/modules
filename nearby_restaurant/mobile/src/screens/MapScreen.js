import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import RestaurantCard from "../components/RestaurantCard";
import { restaurantAPI } from "../services/api";
import { formatDistance } from "../utils/location";

const { width, height } = Dimensions.get("window");
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.05;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const MapScreen = ({ route, navigation }) => {
  const { userLocation } = route.params;

  const [region, setRegion] = useState({
    latitude: userLocation.latitude,
    longitude: userLocation.longitude,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  });

  const [selectedLocation, setSelectedLocation] = useState({
    latitude: userLocation.latitude,
    longitude: userLocation.longitude,
  });

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [radius, setRadius] = useState(2); // 2km default
  const [showList, setShowList] = useState(false);

  console.log(restaurants[0]);

  const mapRef = useRef(null);

  useEffect(() => {
    fetchNearbyRestaurants();
  }, [selectedLocation, radius]);

  const fetchNearbyRestaurants = async () => {
    setLoading(true);
    try {
      const response = await restaurantAPI.getNearbyRestaurants(
        selectedLocation.latitude,
        selectedLocation.longitude,
        radius,
      );

      if (response.success) {
        setRestaurants(response.data.restaurants);
      }
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to fetch restaurants");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerDragEnd = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });

    // Animate map to new position
    mapRef.current?.animateToRegion({
      latitude,
      longitude,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    });
  };

  const handleRecenter = () => {
    setSelectedLocation({
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
    });

    mapRef.current?.animateToRegion({
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    });
  };

  const handleRestaurantPress = (restaurant) => {
    navigation.navigate("RestaurantDetail", { restaurant });
  };

  const renderRestaurantCard = ({ item }) => (
    <RestaurantCard
      restaurant={item}
      onPress={() => handleRestaurantPress(item)}
    />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Nearby Restaurants</Text>
      <Text style={styles.headerSubtitle}>
        {restaurants.length} restaurant{restaurants.length !== 1 ? "s" : ""}{" "}
        within {radius}km
      </Text>
    </View>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="restaurant-outline" size={64} color="#CCC" />
      <Text style={styles.emptyText}>No restaurants found</Text>
      <Text style={styles.emptySubtext}>
        Try increasing the search radius or moving the marker
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Map View */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={region}
          showsUserLocation
          showsMyLocationButton={false}
        >
          {/* Draggable marker for selected location */}
          <Marker
            coordinate={selectedLocation}
            draggable
            onDragEnd={handleMarkerDragEnd}
            title="Search Location"
            description="Drag to change search location"
            pinColor="#ffb300"
          />

          {/* Search radius circle */}
          <Circle
            center={selectedLocation}
            radius={radius * 1000} // Convert km to meters
            fillColor="rgba(255, 179, 0, 0.08)"
            strokeColor="rgba(255, 179, 0, 0.35)"
            strokeWidth={2}
          />

          {/* Restaurant markers */}
          {restaurants.map((restaurant, index) => (
            <Marker
              key={restaurant._id}
              coordinate={{
                latitude: restaurant.location.coordinates[1],
                longitude: restaurant.location.coordinates[0],
              }}
              title={restaurant.name}
              description={`${restaurant.cuisine.join(", ")} • ${formatDistance(restaurant.distance)}`}
              onCalloutPress={() => handleRestaurantPress(restaurant)}
            >
              <View style={styles.restaurantMarker}>
                <Ionicons name="restaurant" size={20} color="#FFFFFF" />
              </View>
            </Marker>
          ))}
        </MapView>

        {/* Map Controls */}
        <View style={styles.mapControls}>
          {/* Recenter button */}
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleRecenter}
            activeOpacity={0.8}
          >
            <Ionicons name="locate" size={24} color="#007AFF" />
          </TouchableOpacity>

          {/* Radius selector */}
          <View style={styles.radiusContainer}>
            <Text style={styles.radiusLabel}>Radius</Text>
            <View style={styles.radiusButtons}>
              {[1, 2, 5, 10].map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[
                    styles.radiusButton,
                    radius === r && styles.radiusButtonActive,
                  ]}
                  onPress={() => setRadius(r)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.radiusButtonText,
                      radius === r && styles.radiusButtonTextActive,
                    ]}
                  >
                    {r}km
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Toggle List Button */}
        <TouchableOpacity
          style={[styles.toggleButton, { backgroundColor: "#ffb300" }]}
          onPress={() => setShowList(!showList)}
          activeOpacity={0.8}
        >
          <Ionicons
            name={showList ? "map" : "list"}
            size={20}
            color="#fff" // better contrast on yellow
          />
          <Text style={[styles.toggleButtonText, { color: "#fff" }]}>
            {showList ? "Show Map" : "Show List"}
          </Text>
        </TouchableOpacity>

        {/* Loading indicator */}
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        )}
      </View>

      {/* Restaurant List */}
      {showList && (
        <View style={styles.listContainer}>
          <FlatList
            data={restaurants}
            renderItem={renderRestaurantCard}
            keyExtractor={(item) => item._id}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={!loading && renderEmptyList}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}

      {/* Bottom Info Card (when list is hidden) */}
      {!showList && restaurants.length > 0 && (
        <>
          {/* <TouchableOpacity
            onPress={() => setShowList(!showList)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={showList ? "map" : "list"}
              size={20}
              color="#FFFFFF"
            />
            <Text>Show List</Text>
          </TouchableOpacity> */}
          {/* <View style={styles.bottomCard}>
            <Text style={styles.bottomCardTitle}>
              {restaurants.length} Restaurant
              {restaurants.length !== 1 ? "s" : ""} Found
            </Text>

            <Text style={styles.bottomCardSubtitle}>
              Tap "Show List" to see all restaurants
            </Text>
          </View> */}
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  restaurantMarker: {
    backgroundColor: "#E74C3C",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  mapControls: {
    position: "absolute",
    top: 16,
    right: 16,
  },
  controlButton: {
    backgroundColor: "#FFFFFF",
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  radiusContainer: {
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  radiusLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
    textAlign: "center",
  },
  radiusButtons: {
    flexDirection: "row",
  },
  radiusButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginHorizontal: 2,
    backgroundColor: "#F0F0F0",
  },
  radiusButtonActive: {
    backgroundColor: "#007AFF",
  },
  radiusButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  radiusButtonTextActive: {
    color: "#FFFFFF",
  },
  toggleButton: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: "#007AFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  toggleButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  listContent: {
    paddingVertical: 8,
  },
  header: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 48,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
  bottomCard: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  bottomCardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  bottomCardSubtitle: {
    fontSize: 13,
    color: "#666",
  },
});

export default MapScreen;
