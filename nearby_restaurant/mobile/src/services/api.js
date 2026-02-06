import axios from "axios";
import Constants from "expo-constants";

// API Configuration
const API_BASE_URL = __DEV__
  ? "http://192.168.1.11:5000/api/v1" // Replace with your local IP
  : "https://your-production-api.com/api/v1";

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // You can add auth tokens here if needed
    // config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // Server responded with error
      const message = error.response.data?.message || "An error occurred";
      return Promise.reject(new Error(message));
    } else if (error.request) {
      // Request made but no response
      return Promise.reject(
        new Error("No response from server. Please check your connection."),
      );
    } else {
      // Something else happened
      return Promise.reject(error);
    }
  },
);

// API Methods
export const restaurantAPI = {
  /**
   * Get nearby restaurants
   */
  getNearbyRestaurants: async (
    latitude,
    longitude,
    radius = 2,
    filters = {},
  ) => {
    try {
      const params = {
        latitude,
        longitude,
        radius,
        ...filters,
      };

      const response = await apiClient.get("/restaurants/nearby", { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get restaurant by ID
   */
  getRestaurantById: async (id) => {
    try {
      const response = await apiClient.get(`/restaurants/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get all restaurants with pagination
   */
  getAllRestaurants: async (page = 1, limit = 20, filters = {}) => {
    try {
      const params = {
        page,
        limit,
        ...filters,
      };

      const response = await apiClient.get("/restaurants", { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get available cuisines
   */
  getCuisines: async () => {
    try {
      const response = await apiClient.get("/restaurants/cuisines");
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default apiClient;
