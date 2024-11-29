const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Your user model
const JWT_SECRET = "your_secret_key"; // Replace with your secret key

const authMiddleware = async (req, res, next) => {
  try {
    console.log("AuthMiddleware: Incoming request to", req.originalUrl);

    // Get token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("AuthMiddleware: Missing or invalid Authorization header");
      return res.status(401).json({ success: false, message: "Unauthorized: Token is missing" });
    }

    const token = authHeader.split(" ")[1]; // Extract token from the header
    console.log("AuthMiddleware: Extracted token:", token);

    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("AuthMiddleware: Decoded token payload:", decoded);

    if (!decoded) {
      console.log("AuthMiddleware: Token verification failed");
      return res.status(401).json({ success: false, message: "Unauthorized: Invalid token" });
    }

    // Find the user associated with the token
    const user = await User.findById(decoded.id);
    if (!user) {
      console.log("AuthMiddleware: User not found for ID:", decoded.id);
      return res.status(404).json({ success: false, message: "User not found" });
    }

    console.log("AuthMiddleware: User found:", user);

    // Attach user data to the request object
    req.user = user;

    console.log("AuthMiddleware: User successfully attached to request object");
    // Pass control to the next middleware/route handler
    next();
  } catch (error) {
    console.error("AuthMiddleware: Error occurred during authentication:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, message: "Unauthorized: Invalid token" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Unauthorized: Token expired" });
    }

    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = authMiddleware;
