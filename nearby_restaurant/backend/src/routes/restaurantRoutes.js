const express = require("express");
const router = express.Router();
const {
  getNearbyRestaurants,
  getRestaurantById,
  getAllRestaurants,
  getCuisines,
} = require("../controllers/restaurantController");
const { validate } = require("../middleware/validate");

// Get available cuisines
router.get("/cuisines", getCuisines);

// Get nearby restaurants (most important route)
router.get(
  "/nearby",
  validate("getNearbyRestaurants", "query"),
  getNearbyRestaurants,
);

// Get all restaurants (with pagination and filters)
router.get("/", getAllRestaurants);

// Get single restaurant by ID
router.get("/:id", validate("getRestaurantById", "params"), getRestaurantById);

module.exports = router;
