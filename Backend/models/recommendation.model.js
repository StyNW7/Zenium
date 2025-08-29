import mongoose from "mongoose";

const recommendationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  journalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Journal",
    required: true
  },
  type: {
    type: String,
    enum: ["activity", "mindfulness", "social", "professional", "health", "general"],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium"
  },
  category: {
    type: String,
    enum: ["immediate", "short_term", "long_term"],
    default: "short_term"
  },
  actionable: {
    type: Boolean,
    default: true
  },
  estimatedTime: {
    type: Number, // in minutes
    default: 30
  },
  tags: [{
    type: String,
    maxlength: 50
  }],
  aiGenerated: {
    type: Boolean,
    default: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: Date,
  userFeedback: {
    helpful: Boolean,
    implemented: Boolean,
    notes: String
  },
  context: {
    mood: String,
    sentiment: String,
    keywords: [String],
    riskScore: Number
  }
}, {
  timestamps: true
});

// Indices for efficient querying
recommendationSchema.index({ userId: 1, createdAt: -1 });
recommendationSchema.index({ userId: 1, type: 1 });
recommendationSchema.index({ userId: 1, priority: 1 });
recommendationSchema.index({ userId: 1, isCompleted: 1 });

const Recommendation = mongoose.model("Recommendation", recommendationSchema);

export default Recommendation;
