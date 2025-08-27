import mongoose from "mongoose";

const dailyQuoteSchema = new mongoose.Schema({
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

// Index for efficient querying by date
dailyQuoteSchema.index({ generatedAt: -1 });

const DailyQuote = mongoose.model("DailyQuote", dailyQuoteSchema);

export default DailyQuote;