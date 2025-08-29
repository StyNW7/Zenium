import express from "express";
import {
  registerUser,
  loginUser,
  changePassword,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";
import { getUserProfile, updateUserProfile, updateUserPassword } from "../controllers/user.controller.js";
import { getDailyQuote, getUserDailyQuotes, deleteQuote } from "../controllers/dailyQuote.controller.js";
import uploadPdf from "../middleware/uploadPdf.js";
import { uploadJournalPdf, analyzePdfAndGenerateQuote, getPdfHistory } from "../controllers/journal.controller.js";
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
import {
  getUserRecommendations,
  getRecommendationById,
  markRecommendationCompleted,
  deleteRecommendation,
  getRecommendationStats,
  triggerAIWorkflow,
  getRecommendationsByType,
  getHighPriorityRecommendations
} from "../controllers/recommendation.controller.js";
import { authenticate } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post("/auth/register", registerUser);
router.post("/auth/login", loginUser);
router.put("/auth/change-password/:id", changePassword);
router.post("/auth/forgot-password", forgotPassword);
router.post("/auth/reset-password", resetPassword);

router.get("/user/profile", authenticate, getUserProfile);
router.put("/user/profile", authenticate, updateUserProfile);
router.put("/change-password", authenticate, updateUserPassword);

router.get('/daily-quote', authenticate, getDailyQuote);
router.get('/quotes', authenticate, getUserDailyQuotes);
router.delete('/quotes/:id', authenticate, deleteQuote);

// Journal routes
router.get('/journals', authenticate, getUserJournals);
router.get('/journals/guided-questions', authenticate, getGuidedQuestions);
router.get('/journals/summary', authenticate, getJournalSummary);
router.post('/journals/analyze', authenticate, analyzeJournal);
router.post('/journals/:id/analyze-attach', authenticate, analyzeAndAttachJournal);
router.get('/journals/:id', authenticate, getJournalById);
router.post('/journals', authenticate, createJournal);
router.put('/journals/:id', authenticate, updateJournal);
router.delete('/journals/:id', authenticate, deleteJournal);

// AI Workflow routes
router.post('/journals/:id/trigger-workflow', authenticate, triggerAIWorkflow);

// Journal PDF routes (single model)
router.post('/journal-pdf', authenticate, uploadPdf.single('file'), uploadJournalPdf);
router.post('/journal-pdf/:id/analyze-quote', authenticate, analyzePdfAndGenerateQuote);
router.get('/journal-pdf', authenticate, getPdfHistory);

// AI Recommendation routes
router.get('/recommendations', authenticate, getUserRecommendations);
router.get('/recommendations/stats', authenticate, getRecommendationStats);
router.get('/recommendations/high-priority', authenticate, getHighPriorityRecommendations);
router.get('/recommendations/type/:type', authenticate, getRecommendationsByType);
router.get('/recommendations/:id', authenticate, getRecommendationById);
router.put('/recommendations/:id/complete', authenticate, markRecommendationCompleted);
router.delete('/recommendations/:id', authenticate, deleteRecommendation);

// Location routes
router.get('/locations', getLocations);
router.get('/locations/:id', getLocationById);
router.post('/locations', authenticate, createLocation);
router.put('/locations/:id', authenticate, updateLocation);
router.delete('/locations/:id', authenticate, deleteLocation);
router.post('/locations/seed', authenticate, seedLocations);
router.post('/locations/analysis', authenticate, saveLocationAnalysis);

// Analysis routes (PeaceFinder)
router.post('/analysis/analyze', analyzeLocation);
router.post('/analysis/upload', authenticate, upload.single('mapImage'), analyzeLocation);
router.post('/analysis/save', authenticate, saveAnalysis);
router.get('/analysis', authenticate, getUserAnalyses);
router.get('/analysis/nearby', getNearbyAnalyses);
router.get('/analysis/:id', authenticate, getAnalysisById);
router.delete('/analysis/:id', authenticate, deleteAnalysis);

export default router;