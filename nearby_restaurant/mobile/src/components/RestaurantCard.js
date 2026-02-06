import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatDistance } from "../utils/location";

const RestaurantCard = ({ restaurant, onPress }) => {
  const renderRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons key={`full-${i}`} name="star" size={14} color="#FFD700" />,
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Ionicons key="half" name="star-half" size={14} color="#FFD700" />,
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Ionicons
          key={`empty-${i}`}
          name="star-outline"
          size={14}
          color="#FFD700"
        />,
      );
    }

    return stars;
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardContent}>
        {/* Restaurant Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.name} numberOfLines={1}>
            {restaurant.name}
          </Text>

          <View style={styles.cuisineContainer}>
            <Ionicons name="restaurant-outline" size={14} color="#666" />
            <Text style={styles.cuisine} numberOfLines={1}>
              {restaurant.cuisine.join(", ")}
            </Text>
          </View>

          <View style={styles.detailsRow}>
            {/* Rating */}
            <View style={styles.ratingContainer}>
              {renderRatingStars(restaurant.rating.average)}
              <Text style={styles.ratingText}>
                {restaurant.rating.average.toFixed(1)} (
                {restaurant.rating.count})
              </Text>
            </View>

            {/* Price Range */}
            <Text style={styles.priceRange}>{restaurant.priceRange}</Text>
          </View>

          {/* Distance and Status */}
          <View style={styles.bottomRow}>
            <View style={styles.distanceContainer}>
              <Ionicons name="location-outline" size={14} color="#007AFF" />
              <Text style={styles.distance}>
                {formatDistance(restaurant.distance)}
              </Text>
            </View>

            {restaurant.isOpenNow !== undefined && (
              <View
                style={[
                  styles.statusBadge,
                  restaurant.isOpenNow ? styles.openBadge : styles.closedBadge,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    restaurant.isOpenNow ? styles.openText : styles.closedText,
                  ]}
                >
                  {restaurant.isOpenNow ? "Open" : "Closed"}
                </Text>
              </View>
            )}
          </View>

          {/* Features */}
          {restaurant.features && restaurant.features.length > 0 && (
            <View style={styles.featuresContainer}>
              {restaurant.features.slice(0, 3).map((feature, index) => (
                <View key={index} style={styles.featureBadge}>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
              {restaurant.features.length > 3 && (
                <Text style={styles.moreFeatures}>
                  +{restaurant.features.length - 3} more
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Arrow Icon */}
        <Ionicons name="chevron-forward" size={20} color="#CCC" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  cuisineContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  cuisine: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
    flex: 1,
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 13,
    color: "#666",
    marginLeft: 4,
  },
  priceRange: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2ECC71",
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  distanceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  distance: {
    fontSize: 13,
    color: "#007AFF",
    fontWeight: "600",
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  openBadge: {
    backgroundColor: "#E8F5E9",
  },
  closedBadge: {
    backgroundColor: "#FFEBEE",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  openText: {
    color: "#2ECC71",
  },
  closedText: {
    color: "#E74C3C",
  },
  featuresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
  },
  featureBadge: {
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  featureText: {
    fontSize: 11,
    color: "#666",
  },
  moreFeatures: {
    fontSize: 11,
    color: "#007AFF",
    alignSelf: "center",
  },
});

export default RestaurantCard;
