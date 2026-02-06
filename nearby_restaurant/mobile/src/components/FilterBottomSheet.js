import React, {
  useCallback,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";

const FilterBottomSheet = forwardRef(
  (
    { filters, onApplyFilters, onClearFilters, availableCuisines = [] },
    ref,
  ) => {
    const bottomSheetRef = React.useRef(null);
    const snapPoints = useMemo(() => ["75%", "90%"], []);

    // Local state for filters
    const [localFilters, setLocalFilters] = React.useState(filters);

    // Update local filters when props change
    React.useEffect(() => {
      setLocalFilters(filters);
    }, [filters]);

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
      open: () => bottomSheetRef.current?.expand(),
      close: () => bottomSheetRef.current?.close(),
    }));

    const renderBackdrop = useCallback(
      (props) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      ),
      [],
    );

    const handleCuisineToggle = (cuisine) => {
      setLocalFilters((prev) => {
        const cuisines = prev.cuisine || [];
        const index = cuisines.indexOf(cuisine);

        if (index > -1) {
          // Remove cuisine
          return {
            ...prev,
            cuisine: cuisines.filter((c) => c !== cuisine),
          };
        } else {
          // Add cuisine
          return {
            ...prev,
            cuisine: [...cuisines, cuisine],
          };
        }
      });
    };

    const handlePriceRangeToggle = (price) => {
      setLocalFilters((prev) => ({
        ...prev,
        priceRange: prev.priceRange === price ? null : price,
      }));
    };

    const handleMinRatingChange = (rating) => {
      setLocalFilters((prev) => ({
        ...prev,
        minRating: prev.minRating === rating ? null : rating,
      }));
    };

    const handleFeatureToggle = (feature) => {
      setLocalFilters((prev) => {
        const features = prev.features || [];
        const index = features.indexOf(feature);

        if (index > -1) {
          return {
            ...prev,
            features: features.filter((f) => f !== feature),
          };
        } else {
          return {
            ...prev,
            features: [...features, feature],
          };
        }
      });
    };

    const handleSortByChange = (sortBy) => {
      setLocalFilters((prev) => ({
        ...prev,
        sortBy: prev.sortBy === sortBy ? null : sortBy,
      }));
    };

    const handleApply = () => {
      onApplyFilters(localFilters);
      bottomSheetRef.current?.close();
    };

    const handleClear = () => {
      const clearedFilters = {
        cuisine: [],
        priceRange: null,
        minRating: null,
        features: [],
        sortBy: null,
      };
      setLocalFilters(clearedFilters);
      onClearFilters();
      bottomSheetRef.current?.close();
    };

    const getActiveFiltersCount = () => {
      let count = 0;
      if (localFilters.cuisine?.length > 0) count++;
      if (localFilters.priceRange) count++;
      if (localFilters.minRating) count++;
      if (localFilters.features?.length > 0) count++;
      if (localFilters.sortBy) count++;
      return count;
    };

    const priceRanges = ["$", "$$", "$$$", "$$$$"];
    const ratings = [5, 4, 3];
    const sortOptions = [
      { value: "distance", label: "Distance", icon: "location" },
      { value: "rating", label: "Rating", icon: "star" },
      { value: "name", label: "Name", icon: "text" },
    ];

    const commonFeatures = [
      "Dine-in",
      "Takeaway",
      "Delivery",
      "Outdoor Seating",
      "WiFi",
      "Parking",
      "Air Conditioned",
      "Family Friendly",
      "Halal",
      "Vegan Options",
    ];

    return (
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <BottomSheetScrollView style={styles.contentContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Filters</Text>
              {getActiveFiltersCount() > 0 && (
                <Text style={styles.subtitle}>
                  {getActiveFiltersCount()} filter
                  {getActiveFiltersCount() > 1 ? "s" : ""} active
                </Text>
              )}
            </View>
            <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
          </View>

          {/* Sort By */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sort By</Text>
            <View style={styles.sortContainer}>
              {sortOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.sortButton,
                    localFilters.sortBy === option.value &&
                      styles.sortButtonActive,
                  ]}
                  onPress={() => handleSortByChange(option.value)}
                >
                  <Ionicons
                    name={option.icon}
                    size={18}
                    color={
                      localFilters.sortBy === option.value ? "#FFFFFF" : "#666"
                    }
                  />
                  <Text
                    style={[
                      styles.sortButtonText,
                      localFilters.sortBy === option.value &&
                        styles.sortButtonTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Cuisine */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Cuisine{" "}
              {localFilters.cuisine?.length > 0 &&
                `(${localFilters.cuisine.length})`}
            </Text>
            <View style={styles.chipContainer}>
              {availableCuisines.map((cuisine) => (
                <TouchableOpacity
                  key={cuisine}
                  style={[
                    styles.chip,
                    localFilters.cuisine?.includes(cuisine) &&
                      styles.chipActive,
                  ]}
                  onPress={() => handleCuisineToggle(cuisine)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      localFilters.cuisine?.includes(cuisine) &&
                        styles.chipTextActive,
                    ]}
                  >
                    {cuisine}
                  </Text>
                  {localFilters.cuisine?.includes(cuisine) && (
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color="#FFFFFF"
                      style={styles.chipIcon}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Price Range */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Price Range</Text>
            <View style={styles.priceContainer}>
              {priceRanges.map((price) => (
                <TouchableOpacity
                  key={price}
                  style={[
                    styles.priceButton,
                    localFilters.priceRange === price &&
                      styles.priceButtonActive,
                  ]}
                  onPress={() => handlePriceRangeToggle(price)}
                >
                  <Text
                    style={[
                      styles.priceButtonText,
                      localFilters.priceRange === price &&
                        styles.priceButtonTextActive,
                    ]}
                  >
                    {price}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Minimum Rating */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Minimum Rating</Text>
            <View style={styles.ratingContainer}>
              {ratings.map((rating) => (
                <TouchableOpacity
                  key={rating}
                  style={[
                    styles.ratingButton,
                    localFilters.minRating === rating &&
                      styles.ratingButtonActive,
                  ]}
                  onPress={() => handleMinRatingChange(rating)}
                >
                  <Ionicons
                    name="star"
                    size={16}
                    color={
                      localFilters.minRating === rating ? "#FFFFFF" : "#FFD700"
                    }
                  />
                  <Text
                    style={[
                      styles.ratingButtonText,
                      localFilters.minRating === rating &&
                        styles.ratingButtonTextActive,
                    ]}
                  >
                    {rating}+ Stars
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Features */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Features{" "}
              {localFilters.features?.length > 0 &&
                `(${localFilters.features.length})`}
            </Text>
            <View style={styles.chipContainer}>
              {commonFeatures.map((feature) => (
                <TouchableOpacity
                  key={feature}
                  style={[
                    styles.chip,
                    localFilters.features?.includes(feature) &&
                      styles.chipActive,
                  ]}
                  onPress={() => handleFeatureToggle(feature)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      localFilters.features?.includes(feature) &&
                        styles.chipTextActive,
                    ]}
                  >
                    {feature}
                  </Text>
                  {localFilters.features?.includes(feature) && (
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color="#FFFFFF"
                      style={styles.chipIcon}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Bottom Padding */}
          <View style={{ height: 100 }} />
        </BottomSheetScrollView>

        {/* Apply Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.applyButton}
            onPress={handleApply}
            activeOpacity={0.8}
          >
            <Text style={styles.applyButtonText}>
              Apply Filters{" "}
              {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}
            </Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    );
  },
);

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handleIndicator: {
    backgroundColor: "#DDD",
    width: 40,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  subtitle: {
    fontSize: 14,
    color: "#007AFF",
    marginTop: 4,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearButtonText: {
    color: "#E74C3C",
    fontSize: 15,
    fontWeight: "600",
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 12,
  },
  sortContainer: {
    flexDirection: "row",
    gap: 10,
  },
  sortButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  sortButtonActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginLeft: 6,
  },
  sortButtonTextActive: {
    color: "#FFFFFF",
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  chipActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  chipText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  chipTextActive: {
    color: "#FFFFFF",
  },
  chipIcon: {
    marginLeft: 6,
  },
  priceContainer: {
    flexDirection: "row",
    gap: 10,
  },
  priceButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    alignItems: "center",
  },
  priceButtonActive: {
    backgroundColor: "#2ECC71",
    borderColor: "#2ECC71",
  },
  priceButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#666",
  },
  priceButtonTextActive: {
    color: "#FFFFFF",
  },
  ratingContainer: {
    flexDirection: "row",
    gap: 10,
  },
  ratingButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  ratingButtonActive: {
    backgroundColor: "#FFD700",
    borderColor: "#FFD700",
  },
  ratingButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginLeft: 6,
  },
  ratingButtonTextActive: {
    color: "#1A1A1A",
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    backgroundColor: "#FFFFFF",
  },
  applyButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  applyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default FilterBottomSheet;
