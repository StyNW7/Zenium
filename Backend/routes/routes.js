import express from "express";
import {
  registerUser,
  loginUser,
  changePassword,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";
import { getUserProfile, updateUserProfile, updateUserPassword } from "../controllers/user.controller.js";
import { getDailyQuote } from "../controllers/dailyQuote.controller.js";
import {
  getUserJournals,
  getJournalById,
  createJournal,
  updateJournal,
  deleteJournal
} from "../controllers/journal.controller.js";
import {
  getLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
  seedLocations,
  analyzeLocationMentalHealth,
  batchAnalyzeLocations,
  getUserAnalysisHistory,
  getUserMentalHealthInsights,
  addLocationFeedback,
  getTopPeacefulLocations,
  saveUserGeospatialAnalysis
} from "../controllers/location.controller.js";
import { protect } from "../middleware/protect.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/auth/register", registerUser);
router.post("/auth/login", loginUser);
router.put("/auth/change-password/:id", changePassword);
router.post("/auth/forgot-password", forgotPassword);
router.post("/auth/reset-password", resetPassword);

router.get("/user/profile", protect, getUserProfile);
router.put("/user/profile", protect, updateUserProfile);
router.put("/user/change-password", protect, updateUserPassword);

router.get('/daily-quote', protect, getDailyQuote);

// Journal routes
router.get('/journals', protect, getUserJournals);
router.get('/journals/:id', protect, getJournalById);
router.post('/journals', protect, createJournal);
router.put('/journals/:id', protect, updateJournal);
router.delete('/journals/:id', protect, deleteJournal);

// Location routes
router.get('/locations', getLocations);
router.get('/locations/:id', getLocationById);
router.post('/locations', protect, createLocation);
router.put('/locations/:id', protect, updateLocation);
router.delete('/locations/:id', protect, deleteLocation);
router.post('/locations/seed', protect, seedLocations);

// Mental Health Analysis routes
router.post('/locations/analyze', protect, analyzeLocationMentalHealth);
router.post('/locations/batch-analyze', protect, batchAnalyzeLocations);
router.get('/locations/top-peaceful', getTopPeacefulLocations);
router.get('/user/analysis-history', protect, getUserAnalysisHistory);
router.get('/user/mental-health-insights', protect, getUserMentalHealthInsights);
router.post('/locations/:id/feedback', protect, addLocationFeedback);

// PeaceFinder geospatial analysis save endpoint
router.post('/analysis/save', protect, saveUserGeospatialAnalysis);
export default router;