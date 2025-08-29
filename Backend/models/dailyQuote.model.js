import mongoose from "mongoose";

const dailyQuoteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
    index: true
  },
  quote: {
    type: String,
    required: true,
    maxlength: 500,
  },
  explanation: {
    type: String,
    required: true,
    maxlength: 300,
  },
  author: {
    type: String,
    default: "AI Companion",
    maxlength: 100,
  },
  category: {
    type: String,
    default: "motivation",
    index: true
  },
  isAiGenerated: {
    type: Boolean,
    default: true
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  moodContext: {
    type: String,
    default: ""
  },
  activityContext: {
    type: String,
    default: ""
  },
  generatedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  likes: {
    type: Number,
    default: 0,
  },
  shares: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Indices
dailyQuoteSchema.index({ generatedAt: -1 });
dailyQuoteSchema.index({ userId: 1, generatedAt: -1 });

const DailyQuote = mongoose.model("DailyQuote", dailyQuoteSchema);

export default DailyQuote;