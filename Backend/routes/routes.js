import express from "express";
import {
  registerUser,
  loginUser,
  changePassword,
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
  seedLocations
} from "../controllers/location.controller.js";
import {
  getAllPsychologists,
  getPsychologistById,
  createPsychologist,
  updatePsychologist,
  deletePsychologist,
  seedPsychologists
} from "../controllers/psychologist.controller.js";
import { protect } from "../middleware/protect.js";

const router = express.Router();

router.post("/auth/register", registerUser);
router.post("/auth/login", loginUser);
router.put("/auth/change-password/:id", changePassword);

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

// Psychologist routes
router.get('/psychologists', getAllPsychologists);
router.get('/psychologists/:id', getPsychologistById);
router.post('/psychologists', protect, createPsychologist);
router.put('/psychologists/:id', protect, updatePsychologist);
router.delete('/psychologists/:id', protect, deletePsychologist);
router.post('/psychologists/seed', protect, seedPsychologists);

export default router;