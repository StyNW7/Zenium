import mongoose from "mongoose";

const journalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
    maxlength: 100,
  },
  content: {
    type: String,
    required: false, // Remove minimum requirement
    maxlength: 2000,
  },
  mood: {
    type: String,
    enum: ["happy", "sad", "anxious", "stressed", "neutral", "energetic", "tired", "excited"],
    required: true,
  },
  moodRating: {
    type: Number,
    min: 1,
    max: 10,
    required: true,
  },

  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
    },
    address: String,
  },
  privacy: {
    type: String,
    enum: ["public", "private", "friends"],
    default: "private",
  },
  isAIAnalyzed: {
    type: Boolean,
    default: false,
  },
  aiInsights: {
    sentiment: {
      type: String,
      enum: ["positive", "negative", "neutral"],
    },
    keywords: [String],
    recommendations: [String],
    summary: { type: String },
  },
  guidedQuestions: [{
    question: { type: String },
    answer: { type: String }
  }],
  voiceTranscript: {
    type: String,
    default: ""
  },
  mentalHealthClassification: {
    type: String,
    default: null,
    index: true
  },
  riskScore: {
    type: Number,
    min: 0,
    max: 1
  },
  // AI Recommendation (single recommendation per journal)
  aiRecommendation: {
    title: { type: String },
    description: { type: String },
    reason: { type: String },
    timeEstimate: { type: String },
    type: { type: String },
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date },
    generatedAt: { type: Date, default: Date.now }
  },
  // Optional: attached PDF of this journal (generated client-side)
  pdf: {
    type: Buffer,
  },
  pdfMimeType: {
    type: String,
    default: 'application/pdf',
  },
}, {
  timestamps: true,
});

// Create 2dsphere index for geospatial queries
journalSchema.index({ "location.coordinates": "2dsphere" });

// Text index for search functionality
journalSchema.index({
  title: "text",
  content: "text"
});

const Journal = mongoose.model("Journal", journalSchema);

export default Journal;
