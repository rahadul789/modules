import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  Keyboard,
} from "react-native";
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import RestaurantCard from "../components/RestaurantCard";
import SearchBar from "../components/SearchBar";
import FilterBottomSheet from "../components/FilterBottomSheet";
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
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [radius, setRadius] = useState(2); // 2km default
  const [showList, setShowList] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  // Filter state
  const [filters, setFilters] = useState({
    cuisine: [],
    priceRange: null,
    minRating: null,
    features: [],
    sortBy: null,
  });
  const [availableCuisines, setAvailableCuisines] = useState([]);

  const mapRef = useRef(null);
  const filterBottomSheetRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    fetchNearbyRestaurants();
  }, [selectedLocation, radius]);

  useEffect(() => {
    fetchCuisines();
  }, []);

  // Apply search and filters whenever they change
  useEffect(() => {
    applySearchAndFilters();
  }, [restaurants, searchQuery, filters]);

  const fetchCuisines = async () => {
    try {
      const response = await restaurantAPI.getCuisines();
      if (response.success) {
        setAvailableCuisines(response.data.cuisines);
      }
    } catch (error) {
      console.error("Error fetching cuisines:", error);
    }
  };

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

  const applySearchAndFilters = () => {
    let result = [...restaurants];

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (restaurant) =>
          restaurant.name.toLowerCase().includes(query) ||
          restaurant.cuisine.some((c) => c.toLowerCase().includes(query)) ||
          restaurant.address.area.toLowerCase().includes(query) ||
          restaurant.description.toLowerCase().includes(query),
      );
    }

    // Apply cuisine filter
    if (filters.cuisine && filters.cuisine.length > 0) {
      result = result.filter((restaurant) =>
        restaurant.cuisine.some((c) => filters.cuisine.includes(c)),
      );
    }

    // Apply price range filter
    if (filters.priceRange) {
      result = result.filter(
        (restaurant) => restaurant.priceRange === filters.priceRange,
      );
    }

    // Apply minimum rating filter
    if (filters.minRating) {
      result = result.filter(
        (restaurant) => restaurant.rating.average >= filters.minRating,
      );
    }

    // Apply features filter
    if (filters.features && filters.features.length > 0) {
      result = result.filter((restaurant) =>
        filters.features.every(
          (feature) =>
            restaurant.features && restaurant.features.includes(feature),
        ),
      );
    }

    // Apply sorting
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case "distance":
          result.sort((a, b) => a.distance - b.distance);
          break;
        case "rating":
          result.sort((a, b) => b.rating.average - a.rating.average);
          break;
        case "name":
          result.sort((a, b) => a.name.localeCompare(b.name));
          break;
      }
    } else {
      // Default sort by distance
      result.sort((a, b) => a.distance - b.distance);
    }

    setFilteredRestaurants(result);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      cuisine: [],
      priceRange: null,
      minRating: null,
      features: [],
      sortBy: null,
    });
  };

  const handleOpenFilters = () => {
    Keyboard.dismiss();
    filterBottomSheetRef.current?.open();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.cuisine?.length > 0) count++;
    if (filters.priceRange) count++;
    if (filters.minRating) count++;
    if (filters.features?.length > 0) count++;
    if (filters.sortBy) count++;
    return count;
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
      <Text style={styles.headerTitle}>
        {searchQuery ? "Search Results" : "Nearby Restaurants"}
      </Text>
      <Text style={styles.headerSubtitle}>
        {filteredRestaurants.length} restaurant
        {filteredRestaurants.length !== 1 ? "s" : ""}
        {searchQuery && ` matching "${searchQuery}"`}
        {getActiveFiltersCount() > 0 &&
          ` • ${getActiveFiltersCount()} filter${getActiveFiltersCount() > 1 ? "s" : ""}`}
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container} edges={["top"]}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBarWrapper}>
            <SearchBar
              value={searchQuery}
              onChangeText={handleSearch}
              onClear={handleClearSearch}
              loading={searchLoading}
              placeholder="Search restaurants, cuisine..."
            />
          </View>

          <TouchableOpacity
            style={[
              styles.filterButton,
              getActiveFiltersCount() > 0 && styles.filterButtonActive,
            ]}
            onPress={handleOpenFilters}
            activeOpacity={0.8}
          >
            <Ionicons
              name="options"
              size={20}
              color={getActiveFiltersCount() > 0 ? "#FFFFFF" : "#1A1A1A"}
            />
            {getActiveFiltersCount() > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>
                  {getActiveFiltersCount()}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

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
              pinColor="#007AFF"
            />

            {/* Search radius circle */}
            <Circle
              center={selectedLocation}
              radius={radius * 1000} // Convert km to meters
              fillColor="rgba(0, 122, 255, 0.1)"
              strokeColor="rgba(0, 122, 255, 0.5)"
              strokeWidth={2}
            />

            {/* Restaurant markers - only show filtered results */}
            {filteredRestaurants.map((restaurant, index) => (
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
            style={styles.toggleButton}
            onPress={() => setShowList(!showList)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={showList ? "map" : "list"}
              size={20}
              color="#FFFFFF"
            />
            <Text style={styles.toggleButtonText}>
              {showList ? "Show Map" : "Show List"}
            </Text>
            {filteredRestaurants.length > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>
                  {filteredRestaurants.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Loading indicator */}
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Finding restaurants...</Text>
            </View>
          )}
        </View>

        {/* Restaurant List */}
        {showList && (
          <View style={styles.listContainer}>
            <FlatList
              data={filteredRestaurants}
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
        {showList && filteredRestaurants.length > 0 && (
          <View style={styles.bottomCard}>
            <View style={styles.bottomCardContent}>
              <View>
                <Text style={styles.bottomCardTitle}>
                  {filteredRestaurants.length} Restaurant
                  {filteredRestaurants.length !== 1 ? "s" : ""} Found
                </Text>
                {(searchQuery || getActiveFiltersCount() > 0) && (
                  <Text style={styles.bottomCardSubtitle}>
                    {searchQuery && `"${searchQuery}"`}
                    {searchQuery && getActiveFiltersCount() > 0 && " • "}
                    {getActiveFiltersCount() > 0 &&
                      `${getActiveFiltersCount()} filter${getActiveFiltersCount() > 1 ? "s" : ""}`}
                  </Text>
                )}
              </View>
              {(searchQuery || getActiveFiltersCount() > 0) && (
                <TouchableOpacity
                  style={styles.clearAllButton}
                  onPress={() => {
                    handleClearSearch();
                    handleClearFilters();
                  }}
                >
                  <Ionicons name="close-circle" size={20} color="#E74C3C" />
                  <Text style={styles.clearAllButtonText}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* No results info */}
        {!showList &&
          filteredRestaurants.length === 0 &&
          restaurants.length > 0 &&
          !loading && (
            <View style={styles.bottomCard}>
              <Text style={styles.bottomCardTitle}>No matches found</Text>
              <Text style={styles.bottomCardSubtitle}>
                Try adjusting your filters or search
              </Text>
              <TouchableOpacity
                style={styles.clearFiltersButton}
                onPress={() => {
                  handleClearSearch();
                  handleClearFilters();
                }}
              >
                <Text style={styles.clearFiltersButtonText}>
                  Clear All Filters
                </Text>
              </TouchableOpacity>
            </View>
          )}

        {/* Filter Bottom Sheet */}
        <FilterBottomSheet
          ref={filterBottomSheetRef}
          filters={filters}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
          availableCuisines={availableCuisines}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    gap: 10,
  },
  searchBarWrapper: {
    flex: 1,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  filterButtonActive: {
    backgroundColor: "#007AFF",
  },
  filterBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#E74C3C",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  filterBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
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
  countBadge: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  countBadgeText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "700",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
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
    lineHeight: 20,
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
    textAlign: "center",
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
  bottomCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    marginTop: 2,
  },
  clearAllButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  clearAllButtonText: {
    color: "#E74C3C",
    fontSize: 14,
    fontWeight: "600",
  },
  clearFiltersButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    alignItems: "center",
  },
  clearFiltersButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default MapScreen;
