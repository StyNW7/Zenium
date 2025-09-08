import express from "express";
import {
  registerUser,
  loginUser,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyToken,
} from "../controllers/auth.controller.js";

import {
  getUserProfile,
  updateUserProfile,
  updateUserPassword,
  uploadProfilePhoto,
} from "../controllers/user.controller.js";

import {
  getDailyQuote,
  getUserDailyQuotes,
  deleteQuote,
  createUserQuote,
} from "../controllers/dailyQuote.controller.js";

import {
  getUserJournals,
  createJournal,
  updateJournal,
  deleteJournal,
  analyzeMyJournal,
} from "../controllers/journal.controller.js";

import {
  analyzeLocation,
  saveAnalysis,
  getUserAnalyses,
  getAnalysisById,
  deleteAnalysis,
  getNearbyAnalyses,
} from "../controllers/analysis.controller.js";

import { authenticate } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";
import { chatWithAI } from "../controllers/chatbot.controller.js";

const router = express.Router();

/* ===================== AUTH ROUTES ===================== */
router.post("/auth/register", registerUser);
router.post("/auth/login", loginUser);
router.put("/auth/change-password/:id", changePassword);
router.post("/auth/forgot-password", forgotPassword);
router.post("/auth/reset-password", resetPassword);
router.get("/auth/verify", authenticate, verifyToken);

/* ===================== USER ROUTES ===================== */
router.get("/user/profile", authenticate, getUserProfile);
router.put("/user/profile", authenticate, updateUserProfile);
router.put("/change-password", authenticate, updateUserPassword);
router.post("/user/upload-profile-photo", authenticate, upload.single("profilePhoto"), uploadProfilePhoto);

/* ===================== DAILY QUOTE ROUTES ===================== */
router.get("/daily-quote", getDailyQuote);
router.get("/quotes", authenticate, getUserDailyQuotes);
router.post("/user-quotes", authenticate, createUserQuote);
router.delete("/quotes/:id", authenticate, deleteQuote);

/* ===================== JOURNAL ROUTES ===================== */
router.get("/journals", authenticate, getUserJournals);
router.post("/journals/analyze-my-journal", authenticate, analyzeMyJournal);
router.post("/journals", authenticate, createJournal);
router.put("/journals/:id", authenticate, updateJournal);
router.delete("/journals/:id", authenticate, deleteJournal);

/* ===================== ANALYSIS ROUTES ===================== */
router.post("/analysis/analyze", analyzeLocation);
router.post("/analysis/save", authenticate, saveAnalysis);
router.get("/analysis", authenticate, getUserAnalyses);
router.get("/analysis/nearby", getNearbyAnalyses);
router.get("/analysis/:id", authenticate, getAnalysisById);
router.delete("/analysis/:id", authenticate, deleteAnalysis);

/* ===================== CHATBOT ===================== */
router.post("/chat", chatWithAI);

export default router;
