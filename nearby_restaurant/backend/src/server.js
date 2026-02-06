require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/database");
const restaurantRoutes = require("./routes/restaurantRoutes");
const { errorHandler, notFound } = require("./middleware/errorHandler");

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Trust proxy (important for rate limiting behind reverse proxies)
app.set("trust proxy", 1);

// Security Middleware
app.use(helmet()); // Set security headers

// CORS Configuration
const corsOptions = {
  //   origin: process.env.ALLOWED_ORIGINS
  //     ? process.env.ALLOWED_ORIGINS.split(",")
  //     : "*",
  origin: "*",
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);

// Body Parser Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// // Data Sanitization against NoSQL injection
// app.use(mongoSanitize());

// Compression Middleware
app.use(compression());

// Logging Middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Health Check Route
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// API Routes
app.use("/api/v1/restaurants", restaurantRoutes);

app.get("/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Restaurant Finder API",
  });
});

// Root Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Restaurant Finder API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      restaurants: {
        nearby:
          "GET /api/v1/restaurants/nearby?latitude=24.876535&longitude=90.724821&radius=2",
        all: "GET /api/v1/restaurants",
        byId: "GET /api/v1/restaurants/:id",
        cuisines: "GET /api/v1/restaurants/cuisines",
      },
    },
  });
});

// 404 Handler
app.use(notFound);

// Global Error Handler
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(
    `🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`,
  );
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error(`❌ Uncaught Exception: ${err.message}`);
  process.exit(1);
});

module.exports = app;
