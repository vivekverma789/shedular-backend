const express = require("express");
const dotenv = require("dotenv");
const cookieSession = require("cookie-session");
const passport = require("passport");
const connectDB = require("./config/db");
const cors = require("cors");
const mutualTransferRoutes = require("./routes/mutualTransfer");
const path = require("path");

// Import Routes
const authRoutes = require("./routes/authRoutes");
const courseContentRoutes = require("./routes/courseContentRoutes");
const scheduleRoutes = require("./routes/ScheduleRoutes");
const purchasedScheduleRoutes = require("./routes/purchasedScheduleRoutes");
const expertRoutes = require("./routes/expertRoutes");
const profileRoutes = require("./routes/profileRoutes");

// Load environment variables
dotenv.config();

// Initialize Express App
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
// app.use(cors({
//  // origin: 'http://localhost:3000',
//     origin: 'https://shedular-admin-panel.vercel.app/',
//   origin: 'https://shedular-web.vercel.app/',

//   methods: 'GET,POST,PUT,DELETE',
//   allowedHeaders: 'Content-Type,Authorization',
//   credentials: true,
// }));


const allowedOrigins = [
  'https://shedular-admin-panel.vercel.app',
  'https://shedular-web.vercel.app',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true,
  })
);

// Session Middleware
app.use(
  cookieSession({
    name: "session",
    keys: [process.env.COOKIE_KEY],
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api", authRoutes);
app.use("/api", courseContentRoutes);
app.use("/api", scheduleRoutes);
app.use("/api", mutualTransferRoutes);
app.use("/api", purchasedScheduleRoutes);
app.use("/api/experts", expertRoutes);
app.use("/api", profileRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
