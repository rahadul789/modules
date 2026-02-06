const Restaurant = require("../models/Restaurant");
const { AppError } = require("../middleware/errorHandler");
const { asyncHandler } = require("../middleware/errorHandler");

/**
 * @desc    Get nearby restaurants based on user location
 * @route   GET /api/v1/restaurants/nearby
 * @access  Public
 */
exports.getNearbyRestaurants = asyncHandler(async (req, res, next) => {
  const {
    latitude,
    longitude,
    radius,
    cuisine,
    priceRange,
    minRating,
    limit,
    skip,
  } = req.query;

  // Prepare cuisine array
  let cuisineArray = null;
  if (cuisine) {
    cuisineArray = Array.isArray(cuisine) ? cuisine : [cuisine];
  }

  // Find nearby restaurants
  const restaurants = await Restaurant.findNearby(longitude, latitude, radius, {
    cuisine: cuisineArray,
    priceRange,
    minRating,
    limit: parseInt(limit),
    skip: parseInt(skip),
  });

  // Calculate distance for each restaurant (MongoDB returns it in meters)
  const restaurantsWithDistance = restaurants.map((restaurant) => {
    const rest = restaurant.toObject();

    // Calculate distance using Haversine formula for accuracy
    const distance = calculateDistance(
      parseFloat(latitude),
      parseFloat(longitude),
      rest.location.coordinates[1],
      rest.location.coordinates[0],
    );

    return {
      ...rest,
      distance: parseFloat(distance.toFixed(2)), // in km
      isOpenNow: restaurant.isOpenNow(),
    };
  });

  res.status(200).json({
    success: true,
    count: restaurantsWithDistance.length,
    data: {
      restaurants: restaurantsWithDistance,
      searchParams: {
        location: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
        },
        radius: parseFloat(radius),
        filters: {
          cuisine: cuisineArray,
          priceRange,
          minRating: minRating ? parseFloat(minRating) : null,
        },
      },
    },
  });
});

/**
 * @desc    Get single restaurant by ID
 * @route   GET /api/v1/restaurants/:id
 * @access  Public
 */
exports.getRestaurantById = asyncHandler(async (req, res, next) => {
  const restaurant = await Restaurant.findById(req.params.id);

  if (!restaurant) {
    return next(new AppError("Restaurant not found", 404));
  }

  if (!restaurant.isActive) {
    return next(new AppError("This restaurant is currently unavailable", 404));
  }

  const restaurantData = restaurant.toObject();
  restaurantData.isOpenNow = restaurant.isOpenNow();

  res.status(200).json({
    success: true,
    data: {
      restaurant: restaurantData,
    },
  });
});

/**
 * @desc    Get all restaurants (with pagination)
 * @route   GET /api/v1/restaurants
 * @access  Public
 */
exports.getAllRestaurants = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const query = { isActive: true };

  // Add filters if provided
  if (req.query.cuisine) {
    const cuisineArray = Array.isArray(req.query.cuisine)
      ? req.query.cuisine
      : [req.query.cuisine];
    query.cuisine = { $in: cuisineArray };
  }

  if (req.query.priceRange) {
    query.priceRange = req.query.priceRange;
  }

  if (req.query.minRating) {
    query["rating.average"] = { $gte: parseFloat(req.query.minRating) };
  }

  const total = await Restaurant.countDocuments(query);
  const restaurants = await Restaurant.find(query)
    .limit(limit)
    .skip(skip)
    .select("-__v")
    .sort("-rating.average");

  res.status(200).json({
    success: true,
    count: restaurants.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
    data: {
      restaurants,
    },
  });
});

/**
 * @desc    Get available cuisines
 * @route   GET /api/v1/restaurants/cuisines
 * @access  Public
 */
exports.getCuisines = asyncHandler(async (req, res, next) => {
  const cuisines = await Restaurant.distinct("cuisine", { isActive: true });

  res.status(200).json({
    success: true,
    count: cuisines.length,
    data: {
      cuisines: cuisines.sort(),
    },
  });
});

/**
 * Helper function: Calculate distance between two points using Haversine formula
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}
