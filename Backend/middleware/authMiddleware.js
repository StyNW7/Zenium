import jwt from "jsonwebtoken";

// Middleware untuk verifikasi token JWT
export const authenticate = async (req, res, next) => {
  const authHeader = req.header("Authorization");

  console.log("🔐 AUTH MIDDLEWARE - Header received:", authHeader ? authHeader.substring(0, 50) : 'null');

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.error("❌ AUTH FAILED - No Bearer token in header");
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  const token = authHeader.replace("Bearer ", "");
  console.log("🔐 AUTH - Token extracted (first 20 chars):", token.substring(0, 20));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ AUTH SUCCESS - Decoded token:", JSON.stringify(decoded, null, 2));

    // Ensure userId exists in decoded token
    if (!decoded.userId && !decoded.id && !decoded._id && !decoded.user_id) {
      console.error("❌ AUTH FAILED - No user ID in decoded token");
      console.log("🔍 Available fields in decoded:", Object.keys(decoded));
      return res.status(401).json({
        success: false,
        message: "Invalid token - no user identification found. Expected userId, id, _id, or user_id"
      });
    }

    // Map different possible user ID field names to userId
    req.user = {
      ...decoded,
      userId: decoded.userId || decoded.id || decoded._id || decoded.user_id
    };

    console.log("🎯 AUTH COMPLETE - req.user.userId:", req.user.userId);
    next();
  } catch (err) {
    console.error("❌ AUTH FAILED - JWT verification error:", err.message);
    console.error("🔍 JWT Error details:", {
      name: err.name,
      message: err.message
    });
    return res.status(401).json({ success: false, message: "Invalid/expired token" });
  }
};
