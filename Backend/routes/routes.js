import express from "express";
import {
  registerUser,
  loginUser,
  changePassword,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";
import { getUserProfile, updateUserProfile, updateUserPassword, uploadProfilePhoto } from "../controllers/user.controller.js";
import { getDailyQuote, getUserDailyQuotes, deleteQuote, createUserQuote } from "../controllers/dailyQuote.controller.js";
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
import { chatWithAI } from "../controllers/chatbot.controller.js";
import { verifyToken } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/auth/register", registerUser);
router.post("/auth/login", loginUser);
router.put("/auth/change-password/:id", changePassword);
router.post("/auth/forgot-password", forgotPassword);
router.post("/auth/reset-password", resetPassword);
router.get("/auth/verify", authenticate, verifyToken);

router.get("/user/profile", authenticate, getUserProfile);
router.put("/user/profile", authenticate, updateUserProfile);
router.put("/change-password", authenticate, updateUserPassword);
router.post("/user/upload-profile-photo", authenticate, upload.single('profilePhoto'), uploadProfilePhoto);

// Daily quote routes - allow guest access for basic quote
router.get('/daily-quote', getDailyQuote);
router.get('/quotes', authenticate, getUserDailyQuotes);
router.post('/user-quotes', authenticate, createUserQuote);
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

// Analysis routes (PeaceFinder)
router.post('/analysis/analyze', analyzeLocation);
router.post('/analysis/upload', authenticate, upload.single('mapImage'), analyzeLocation);
router.post('/analysis/save', authenticate, saveAnalysis);
router.get('/analysis', authenticate, getUserAnalyses);
router.get('/analysis/nearby', getNearbyAnalyses);
router.get('/analysis/:id', authenticate, getAnalysisById);
router.delete('/analysis/:id', authenticate, deleteAnalysis);

// Chatbot

router.post("/chat", chatWithAI);

export default router;
