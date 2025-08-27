import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// Middleware untuk verifikasi token JWT
export const authenticate = async (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }
  const token = authHeader.replace("Bearer ", "");
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

// Middleware/utility untuk cek admin
export const isAdmin = (req) => {
  // req.user harus sudah diisi oleh middleware authenticate
  return req.user && req.user.role === "admin";
};
