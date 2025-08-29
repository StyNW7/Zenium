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
  deleteJournal,
  getGuidedQuestions,
  analyzeJournal,
  analyzeAndAttachJournal,
  getJournalSummary
} from "../controllers/journal.controller.js";
import {
  getLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
  seedLocations,
  saveLocationAnalysis
} from "../controllers/location.controller.js";
import {
  analyzeLocation,
  saveAnalysis,
  getUserAnalyses,
  getAnalysisById,
  deleteAnalysis,
  getNearbyAnalyses
} from "../controllers/analysis.controller.js";
import { protect } from "../middleware/protect.js";
import { authenticate } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

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
router.get('/journals/guided-questions', protect, getGuidedQuestions);
router.get('/journals/summary', protect, getJournalSummary);
router.post('/journals/analyze', protect, analyzeJournal);
router.post('/journals/:id/analyze-attach', protect, analyzeAndAttachJournal);
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
router.post('/locations/analysis', protect, saveLocationAnalysis);

// Analysis routes (PeaceFinder)
router.post('/analysis/analyze', analyzeLocation);
router.post('/analysis/upload', protect, upload.single('mapImage'), analyzeLocation);
router.post('/analysis/save', protect, saveAnalysis);
router.get('/analysis', protect, getUserAnalyses);
router.get('/analysis/nearby', getNearbyAnalyses);
router.get('/analysis/:id', protect, getAnalysisById);
router.delete('/analysis/:id', protect, deleteAnalysis);

export default router;
