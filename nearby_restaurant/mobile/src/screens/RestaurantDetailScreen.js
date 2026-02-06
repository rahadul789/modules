import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatDistance } from "../utils/location";

const RestaurantDetailScreen = ({ route, navigation }) => {
  const { restaurant } = route.params;

  const handleCall = () => {
    const phoneNumber = restaurant.phone.replace(/[^0-9+]/g, "");
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleEmail = () => {
    if (restaurant.email) {
      Linking.openURL(`mailto:${restaurant.email}`);
    }
  };

  const handleDirections = () => {
    const { latitude, longitude } = {
      latitude: restaurant.location.coordinates[1],
      longitude: restaurant.location.coordinates[0],
    };

    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    Linking.openURL(url);
  };

  const renderRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons key={`full-${i}`} name="star" size={20} color="#FFD700" />,
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Ionicons key="half" name="star-half" size={20} color="#FFD700" />,
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Ionicons
          key={`empty-${i}`}
          name="star-outline"
          size={20}
          color="#FFD700"
        />,
      );
    }

    return stars;
  };

  const formatOpeningHours = (hours) => {
    const days = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
    const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    return days.map((day, index) => {
      const dayHours = hours[day];
      return (
        <View key={day} style={styles.hoursRow}>
          <Text style={styles.dayLabel}>{dayLabels[index]}</Text>
          <Text style={styles.hoursText}>
            {dayHours?.open && dayHours?.close
              ? `${dayHours.open} - ${dayHours.close}`
              : "Closed"}
          </Text>
        </View>
      );
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
        </View>

        {/* Restaurant Info */}
        <View style={styles.content}>
          <Text style={styles.name}>{restaurant.name}</Text>

          {/* Rating and Price */}
          <View style={styles.ratingContainer}>
            <View style={styles.stars}>
              {renderRatingStars(restaurant.rating.average)}
            </View>
            <Text style={styles.ratingText}>
              {restaurant.rating.average.toFixed(1)} ({restaurant.rating.count}{" "}
              reviews)
            </Text>
            <Text style={styles.separator}>•</Text>
            <Text style={styles.priceRange}>{restaurant.priceRange}</Text>
          </View>

          {/* Cuisine */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="restaurant" size={20} color="#007AFF" />
              <Text style={styles.sectionTitle}>Cuisine</Text>
            </View>
            <View style={styles.cuisineContainer}>
              {restaurant.cuisine.map((cuisine, index) => (
                <View key={index} style={styles.cuisineBadge}>
                  <Text style={styles.cuisineText}>{cuisine}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle" size={20} color="#007AFF" />
              <Text style={styles.sectionTitle}>About</Text>
            </View>
            <Text style={styles.description}>{restaurant.description}</Text>
          </View>

          {/* Location & Distance */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="location" size={20} color="#007AFF" />
              <Text style={styles.sectionTitle}>Location</Text>
            </View>
            <Text style={styles.address}>
              {restaurant.address.street}, {restaurant.address.area}
            </Text>
            <Text style={styles.address}>
              {restaurant.address.city} {restaurant.address.zipCode}
            </Text>
            <View style={styles.distanceRow}>
              <Ionicons name="navigate" size={16} color="#007AFF" />
              <Text style={styles.distanceText}>
                {formatDistance(restaurant.distance)} away
              </Text>
            </View>
          </View>

          {/* Contact */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="call" size={20} color="#007AFF" />
              <Text style={styles.sectionTitle}>Contact</Text>
            </View>
            <TouchableOpacity style={styles.contactRow} onPress={handleCall}>
              <Ionicons name="call-outline" size={18} color="#007AFF" />
              <Text style={styles.contactText}>{restaurant.phone}</Text>
            </TouchableOpacity>
            {restaurant.email && (
              <TouchableOpacity style={styles.contactRow} onPress={handleEmail}>
                <Ionicons name="mail-outline" size={18} color="#007AFF" />
                <Text style={styles.contactText}>{restaurant.email}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Opening Hours */}
          {restaurant.openingHours && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="time" size={20} color="#007AFF" />
                <Text style={styles.sectionTitle}>Opening Hours</Text>
                {restaurant.isOpenNow !== undefined && (
                  <View
                    style={[
                      styles.statusBadge,
                      restaurant.isOpenNow
                        ? styles.openBadge
                        : styles.closedBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        restaurant.isOpenNow
                          ? styles.openText
                          : styles.closedText,
                      ]}
                    >
                      {restaurant.isOpenNow ? "Open Now" : "Closed"}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.hoursContainer}>
                {formatOpeningHours(restaurant.openingHours)}
              </View>
            </View>
          )}

          {/* Features */}
          {restaurant.features && restaurant.features.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="checkmark-circle" size={20} color="#007AFF" />
                <Text style={styles.sectionTitle}>Features</Text>
              </View>
              <View style={styles.featuresContainer}>
                {restaurant.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Ionicons name="checkmark" size={16} color="#2ECC71" />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.callButton]}
          onPress={handleCall}
          activeOpacity={0.8}
        >
          <Ionicons name="call" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Call</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.directionsButton]}
          onPress={handleDirections}
          activeOpacity={0.8}
        >
          <Ionicons name="navigate" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Directions</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  content: {
    padding: 16,
  },
  name: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  stars: {
    flexDirection: "row",
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    color: "#666",
  },
  separator: {
    fontSize: 14,
    color: "#CCC",
    marginHorizontal: 8,
  },
  priceRange: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2ECC71",
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    marginLeft: 8,
    flex: 1,
  },
  cuisineContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cuisineBadge: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  cuisineText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "500",
  },
  description: {
    fontSize: 15,
    color: "#666",
    lineHeight: 22,
  },
  address: {
    fontSize: 15,
    color: "#666",
    marginBottom: 4,
  },
  distanceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  distanceText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
    marginLeft: 6,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  contactText: {
    fontSize: 15,
    color: "#007AFF",
    marginLeft: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: "auto",
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
  hoursContainer: {
    marginTop: 4,
  },
  hoursRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  dayLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
    width: 50,
  },
  hoursText: {
    fontSize: 14,
    color: "#666",
  },
  featuresContainer: {
    marginTop: 4,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  featureText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    marginHorizontal: 6,
  },
  callButton: {
    backgroundColor: "#2ECC71",
  },
  directionsButton: {
    backgroundColor: "#007AFF",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 6,
  },
});

export default RestaurantDetailScreen;
