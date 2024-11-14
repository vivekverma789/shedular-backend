const express = require("express");
const dotenv = require("dotenv");
const cookieSession = require("cookie-session");
const connectDB = require("./config/db");
const bodyParser = require("body-parser");
const cors = require("cors"); // Import cors
const courseContentRoutes = require('./routes/courseContentRoutes');
const scheduleRoutes = require('./routes/ScheduleRoutes'); // Add this line

dotenv.config();
connectDB();

const app = express();
app.use(bodyParser.json());

// Enable CORS for all routes
app.use(cors({
  origin: 'http://localhost:3000', // Replace with your frontend URL
  credentials: true // Allow cookies and sessions to be sent across origins
}));

// Session middleware (Optional, can remove if not using sessions)
app.use(
  cookieSession({
    name: "session",
    keys: [process.env.COOKIE_KEY],
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

// Routes
app.use('/api', courseContentRoutes);
app.use('/api', scheduleRoutes);  // Schedule Routes

// Your other routes

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
