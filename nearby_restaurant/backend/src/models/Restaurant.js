const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Restaurant name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
      index: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    cuisine: {
      type: [String],
      required: [true, "At least one cuisine type is required"],
      enum: [
        "Bangladeshi",
        "Indian",
        "Chinese",
        "Thai",
        "Italian",
        "American",
        "Fast Food",
        "Continental",
        "Mexican",
        "Japanese",
        "Korean",
        "Mediterranean",
        "Seafood",
        "Vegetarian",
        "Desserts",
        "Cafe",
      ],
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: function (coords) {
            return (
              coords.length === 2 &&
              coords[0] >= -180 &&
              coords[0] <= 180 && // longitude
              coords[1] >= -90 &&
              coords[1] <= 90
            ); // latitude
          },
          message: "Invalid coordinates. Format: [longitude, latitude]",
        },
      },
    },
    address: {
      street: {
        type: String,
        required: true,
      },
      area: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      zipCode: String,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^[0-9+\-\s()]{10,20}$/, "Please provide a valid phone number"],
    },
    email: {
      type: String,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    rating: {
      average: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    priceRange: {
      type: String,
      enum: ["$", "$$", "$$$", "$$$$"],
      required: true,
    },
    openingHours: {
      monday: { open: String, close: String },
      tuesday: { open: String, close: String },
      wednesday: { open: String, close: String },
      thursday: { open: String, close: String },
      friday: { open: String, close: String },
      saturday: { open: String, close: String },
      sunday: { open: String, close: String },
    },
    images: [String],
    features: {
      type: [String],
      enum: [
        "Dine-in",
        "Takeaway",
        "Delivery",
        "Outdoor Seating",
        "WiFi",
        "Parking",
        "Air Conditioned",
        "Family Friendly",
        "Wheelchair Accessible",
        "Accepts Cards",
        "Halal",
        "Vegan Options",
      ],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Create 2dsphere index for geospatial queries
restaurantSchema.index({ location: "2dsphere" });

// Compound indexes for common queries
restaurantSchema.index({ "rating.average": -1, isActive: 1 });
restaurantSchema.index({ cuisine: 1, isActive: 1 });
restaurantSchema.index({ priceRange: 1, isActive: 1 });

// Virtual for distance (will be populated by geospatial queries)
restaurantSchema.virtual("distance").get(function () {
  return this._distance;
});

// Static method to find nearby restaurants
restaurantSchema.statics.findNearby = async function (
  longitude,
  latitude,
  radiusInKm = 2,
  options = {},
) {
  const { cuisine, priceRange, minRating, limit = 50, skip = 0 } = options;

  const query = {
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [parseFloat(longitude), parseFloat(latitude)],
        },
        $maxDistance: radiusInKm * 1000, // Convert km to meters
      },
    },
    isActive: true,
  };

  // Add optional filters
  if (cuisine && cuisine.length > 0) {
    query.cuisine = { $in: cuisine };
  }

  if (priceRange) {
    query.priceRange = priceRange;
  }

  if (minRating) {
    query["rating.average"] = { $gte: parseFloat(minRating) };
  }

  const restaurants = await this.find(query)
    .limit(limit)
    .skip(skip)
    .select("-__v");

  return restaurants;
};

// Instance method to check if restaurant is currently open
restaurantSchema.methods.isOpenNow = function () {
  const now = new Date();
  const day = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ][now.getDay()];
  const currentTime = now.getHours() * 100 + now.getMinutes(); // e.g., 14:30 becomes 1430

  const hours = this.openingHours[day];
  if (!hours || !hours.open || !hours.close) return false;

  const openTime = parseInt(hours.open.replace(":", ""));
  const closeTime = parseInt(hours.close.replace(":", ""));

  return currentTime >= openTime && currentTime <= closeTime;
};

const Restaurant = mongoose.model("Restaurant", restaurantSchema);

module.exports = Restaurant;
