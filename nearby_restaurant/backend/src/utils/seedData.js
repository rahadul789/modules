require("dotenv").config();
const mongoose = require("mongoose");
const Restaurant = require("../models/Restaurant");

// Your base location: 24.876535, 90.724821 (Dhaka, Bangladesh)
const BASE_LAT = 24.876535;
const BASE_LNG = 90.724821;

/**
 * Generate random coordinate within radius
 * @param {number} centerLat - Center latitude
 * @param {number} centerLng - Center longitude
 * @param {number} radiusKm - Radius in kilometers
 */
function generateRandomLocation(centerLat, centerLng, radiusKm) {
  // Convert radius from km to degrees (approximate)
  const radiusDeg = radiusKm / 111.32;

  // Generate random angle
  const angle = Math.random() * 2 * Math.PI;

  // Generate random distance within radius
  const distance = Math.sqrt(Math.random()) * radiusDeg;

  // Calculate new coordinates
  const lat = centerLat + distance * Math.cos(angle);
  const lng = centerLng + distance * Math.sin(angle);

  return {
    latitude: parseFloat(lat.toFixed(6)),
    longitude: parseFloat(lng.toFixed(6)),
  };
}

// Dummy restaurant data
const dummyRestaurants = [
  // WITHIN 2KM - These will show up in your search
  {
    name: "Spice Garden",
    description:
      "Authentic Bangladeshi cuisine with a modern twist. Famous for biryani and traditional curries.",
    cuisine: ["Bangladeshi", "Indian"],
    location: generateRandomLocation(BASE_LAT, BASE_LNG, 0.5), // Very close - 0.5km
    address: {
      street: "House 45, Road 12",
      area: "Gulshan",
      city: "Dhaka",
      zipCode: "1212",
    },
    phone: "+880 1712-345678",
    email: "info@spicegarden.com",
    rating: { average: 4.5, count: 234 },
    priceRange: "$$",
    openingHours: {
      monday: { open: "11:00", close: "23:00" },
      tuesday: { open: "11:00", close: "23:00" },
      wednesday: { open: "11:00", close: "23:00" },
      thursday: { open: "11:00", close: "23:00" },
      friday: { open: "11:00", close: "23:30" },
      saturday: { open: "11:00", close: "23:30" },
      sunday: { open: "11:00", close: "23:00" },
    },
    images: ["https://example.com/spice-garden-1.jpg"],
    features: [
      "Dine-in",
      "Takeaway",
      "Delivery",
      "Air Conditioned",
      "Parking",
      "WiFi",
    ],
    isActive: true,
    verified: true,
  },
  {
    name: "Pizza Paradise",
    description:
      "Wood-fired pizzas and Italian delicacies. Fresh ingredients, authentic taste.",
    cuisine: ["Italian", "Fast Food"],
    location: generateRandomLocation(BASE_LAT, BASE_LNG, 1.2), // 1.2km away
    address: {
      street: "Plot 78, Avenue 5",
      area: "Banani",
      city: "Dhaka",
      zipCode: "1213",
    },
    phone: "+880 1823-456789",
    email: "contact@pizzaparadise.com",
    rating: { average: 4.2, count: 189 },
    priceRange: "$$$",
    openingHours: {
      monday: { open: "12:00", close: "22:30" },
      tuesday: { open: "12:00", close: "22:30" },
      wednesday: { open: "12:00", close: "22:30" },
      thursday: { open: "12:00", close: "22:30" },
      friday: { open: "12:00", close: "23:00" },
      saturday: { open: "12:00", close: "23:00" },
      sunday: { open: "12:00", close: "22:30" },
    },
    images: ["https://example.com/pizza-paradise-1.jpg"],
    features: [
      "Dine-in",
      "Takeaway",
      "Delivery",
      "Outdoor Seating",
      "Family Friendly",
    ],
    isActive: true,
    verified: true,
  },
  {
    name: "Thai Orchid",
    description:
      "Exquisite Thai cuisine in an elegant setting. Popular for pad thai and green curry.",
    cuisine: ["Thai"],
    location: generateRandomLocation(BASE_LAT, BASE_LNG, 0.8), // 0.8km away
    address: {
      street: "Level 3, Dhaka Tower",
      area: "Gulshan",
      city: "Dhaka",
      zipCode: "1212",
    },
    phone: "+880 1934-567890",
    email: "hello@thaiorchid.com",
    rating: { average: 4.7, count: 312 },
    priceRange: "$$$",
    openingHours: {
      monday: { open: "12:00", close: "22:00" },
      tuesday: { open: "12:00", close: "22:00" },
      wednesday: { open: "12:00", close: "22:00" },
      thursday: { open: "12:00", close: "22:00" },
      friday: { open: "12:00", close: "23:00" },
      saturday: { open: "12:00", close: "23:00" },
      sunday: { open: "12:00", close: "22:00" },
    },
    images: ["https://example.com/thai-orchid-1.jpg"],
    features: [
      "Dine-in",
      "Takeaway",
      "Air Conditioned",
      "Accepts Cards",
      "WiFi",
    ],
    isActive: true,
    verified: true,
  },
  {
    name: "Burger Buzz",
    description:
      "Gourmet burgers and shakes. Home of the famous triple-stack beef burger.",
    cuisine: ["American", "Fast Food"],
    location: generateRandomLocation(BASE_LAT, BASE_LNG, 1.5), // 1.5km away
    address: {
      street: "Shop 12, Food Street",
      area: "Baridhara",
      city: "Dhaka",
      zipCode: "1212",
    },
    phone: "+880 1745-678901",
    email: "info@burgerbuzz.com",
    rating: { average: 4.0, count: 156 },
    priceRange: "$$",
    openingHours: {
      monday: { open: "11:00", close: "23:00" },
      tuesday: { open: "11:00", close: "23:00" },
      wednesday: { open: "11:00", close: "23:00" },
      thursday: { open: "11:00", close: "23:00" },
      friday: { open: "11:00", close: "00:00" },
      saturday: { open: "11:00", close: "00:00" },
      sunday: { open: "11:00", close: "23:00" },
    },
    images: ["https://example.com/burger-buzz-1.jpg"],
    features: ["Dine-in", "Takeaway", "Delivery", "WiFi", "Family Friendly"],
    isActive: true,
    verified: true,
  },
  {
    name: "Sushi Station",
    description: "Fresh sushi and Japanese cuisine. Daily fresh fish delivery.",
    cuisine: ["Japanese", "Seafood"],
    location: generateRandomLocation(BASE_LAT, BASE_LNG, 1.8), // 1.8km away
    address: {
      street: "House 23, Road 45",
      area: "Gulshan",
      city: "Dhaka",
      zipCode: "1212",
    },
    phone: "+880 1856-789012",
    email: "orders@sushistation.com",
    rating: { average: 4.6, count: 287 },
    priceRange: "$$$$",
    openingHours: {
      monday: { open: "12:00", close: "22:00" },
      tuesday: { open: "12:00", close: "22:00" },
      wednesday: { open: "12:00", close: "22:00" },
      thursday: { open: "12:00", close: "22:00" },
      friday: { open: "12:00", close: "23:00" },
      saturday: { open: "12:00", close: "23:00" },
      sunday: { open: "12:00", close: "22:00" },
    },
    images: ["https://example.com/sushi-station-1.jpg"],
    features: [
      "Dine-in",
      "Takeaway",
      "Air Conditioned",
      "Accepts Cards",
      "WiFi",
    ],
    isActive: true,
    verified: true,
  },
  {
    name: "Veggie Delight",
    description:
      "100% vegetarian restaurant with healthy and delicious options.",
    cuisine: ["Vegetarian", "Indian"],
    location: generateRandomLocation(BASE_LAT, BASE_LNG, 1.0), // 1km away
    address: {
      street: "Road 11, Block C",
      area: "Banani",
      city: "Dhaka",
      zipCode: "1213",
    },
    phone: "+880 1967-890123",
    email: "contact@veggiedelight.com",
    rating: { average: 4.3, count: 201 },
    priceRange: "$$",
    openingHours: {
      monday: { open: "11:00", close: "22:00" },
      tuesday: { open: "11:00", close: "22:00" },
      wednesday: { open: "11:00", close: "22:00" },
      thursday: { open: "11:00", close: "22:00" },
      friday: { open: "11:00", close: "22:30" },
      saturday: { open: "11:00", close: "22:30" },
      sunday: { open: "11:00", close: "22:00" },
    },
    images: ["https://example.com/veggie-delight-1.jpg"],
    features: ["Dine-in", "Takeaway", "Delivery", "Vegan Options", "Halal"],
    isActive: true,
    verified: true,
  },

  // OUTSIDE 2KM - These will NOT show up in your default search
  {
    name: "Ocean Breeze Seafood",
    description: "Premium seafood restaurant with ocean-fresh catch daily.",
    cuisine: ["Seafood", "Continental"],
    location: generateRandomLocation(BASE_LAT, BASE_LNG, 5.5), // 5.5km away
    address: {
      street: "Marine Drive 101",
      area: "Uttara",
      city: "Dhaka",
      zipCode: "1230",
    },
    phone: "+880 1678-901234",
    email: "info@oceanbreeze.com",
    rating: { average: 4.8, count: 423 },
    priceRange: "$$$$",
    openingHours: {
      monday: { open: "12:00", close: "23:00" },
      tuesday: { open: "12:00", close: "23:00" },
      wednesday: { open: "12:00", close: "23:00" },
      thursday: { open: "12:00", close: "23:00" },
      friday: { open: "12:00", close: "23:30" },
      saturday: { open: "12:00", close: "23:30" },
      sunday: { open: "12:00", close: "23:00" },
    },
    images: ["https://example.com/ocean-breeze-1.jpg"],
    features: [
      "Dine-in",
      "Outdoor Seating",
      "Parking",
      "Air Conditioned",
      "Accepts Cards",
    ],
    isActive: true,
    verified: true,
  },
  {
    name: "Dragon Wok",
    description:
      "Authentic Chinese cuisine with a wide variety of dim sum and noodles.",
    cuisine: ["Chinese"],
    location: generateRandomLocation(BASE_LAT, BASE_LNG, 8.2), // 8.2km away
    address: {
      street: "China Town Complex",
      area: "Motijheel",
      city: "Dhaka",
      zipCode: "1000",
    },
    phone: "+880 1589-012345",
    email: "orders@dragonwok.com",
    rating: { average: 4.1, count: 178 },
    priceRange: "$$",
    openingHours: {
      monday: { open: "11:30", close: "22:00" },
      tuesday: { open: "11:30", close: "22:00" },
      wednesday: { open: "11:30", close: "22:00" },
      thursday: { open: "11:30", close: "22:00" },
      friday: { open: "11:30", close: "22:30" },
      saturday: { open: "11:30", close: "22:30" },
      sunday: { open: "11:30", close: "22:00" },
    },
    images: ["https://example.com/dragon-wok-1.jpg"],
    features: ["Dine-in", "Takeaway", "Delivery", "Family Friendly"],
    isActive: true,
    verified: true,
  },
  {
    name: "Cafe Mocha",
    description:
      "Cozy cafe serving specialty coffee, desserts, and light snacks.",
    cuisine: ["Cafe", "Desserts"],
    location: generateRandomLocation(BASE_LAT, BASE_LNG, 3.7), // 3.7km away
    address: {
      street: "Road 27, Dhanmondi",
      area: "Dhanmondi",
      city: "Dhaka",
      zipCode: "1209",
    },
    phone: "+880 1490-123456",
    email: "hello@cafemocha.com",
    rating: { average: 4.4, count: 267 },
    priceRange: "$",
    openingHours: {
      monday: { open: "08:00", close: "22:00" },
      tuesday: { open: "08:00", close: "22:00" },
      wednesday: { open: "08:00", close: "22:00" },
      thursday: { open: "08:00", close: "22:00" },
      friday: { open: "08:00", close: "23:00" },
      saturday: { open: "08:00", close: "23:00" },
      sunday: { open: "08:00", close: "22:00" },
    },
    images: ["https://example.com/cafe-mocha-1.jpg"],
    features: [
      "Dine-in",
      "Takeaway",
      "WiFi",
      "Air Conditioned",
      "Outdoor Seating",
    ],
    isActive: true,
    verified: true,
  },
  {
    name: "Taco Fiesta",
    description:
      "Vibrant Mexican restaurant with authentic tacos, burritos, and margaritas.",
    cuisine: ["Mexican"],
    location: generateRandomLocation(BASE_LAT, BASE_LNG, 6.1), // 6.1km away
    address: {
      street: "Level 2, City Mall",
      area: "Mirpur",
      city: "Dhaka",
      zipCode: "1216",
    },
    phone: "+880 1701-234567",
    email: "info@tacofiesta.com",
    rating: { average: 3.9, count: 142 },
    priceRange: "$$",
    openingHours: {
      monday: { open: "12:00", close: "22:00" },
      tuesday: { open: "12:00", close: "22:00" },
      wednesday: { open: "12:00", close: "22:00" },
      thursday: { open: "12:00", close: "22:00" },
      friday: { open: "12:00", close: "23:00" },
      saturday: { open: "12:00", close: "23:00" },
      sunday: { open: "12:00", close: "22:00" },
    },
    images: ["https://example.com/taco-fiesta-1.jpg"],
    features: ["Dine-in", "Takeaway", "Family Friendly", "Air Conditioned"],
    isActive: true,
    verified: true,
  },
];

// Convert locations to GeoJSON format
const restaurantsData = dummyRestaurants.map((restaurant) => ({
  ...restaurant,
  location: {
    type: "Point",
    coordinates: [restaurant.location.longitude, restaurant.location.latitude],
  },
}));

// Seed function
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing restaurants
    await Restaurant.deleteMany({});
    console.log("🗑️  Cleared existing restaurants");

    // Insert dummy data
    const restaurants = await Restaurant.insertMany(restaurantsData);
    console.log(`✅ Successfully seeded ${restaurants.length} restaurants`);

    // Log summary
    console.log("\n📊 Seed Summary:");
    console.log(`   Base Location: ${BASE_LAT}, ${BASE_LNG}`);
    console.log(`   Restaurants within 2km: 6`);
    console.log(`   Restaurants outside 2km: 4`);

    // Show sample restaurant
    console.log("\n📍 Sample Restaurant (within 2km):");
    const sample = restaurants[0];
    console.log(`   Name: ${sample.name}`);
    console.log(
      `   Location: ${sample.location.coordinates[1]}, ${sample.location.coordinates[0]}`,
    );
    console.log(`   Cuisine: ${sample.cuisine.join(", ")}`);
    console.log(
      `   Rating: ${sample.rating.average}/5 (${sample.rating.count} reviews)`,
    );

    console.log("\n✅ Database seeded successfully!");
    console.log("\n🚀 You can now start your server with: npm run dev");
    console.log("\n📱 Test the API:");
    console.log(
      `   http://localhost:5000/api/v1/restaurants/nearby?latitude=${BASE_LAT}&longitude=${BASE_LNG}&radius=2`,
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

// Run seed
seedDatabase();
