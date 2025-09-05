import mongoose from "mongoose";

const mentalHealthRecommendationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  timeEstimate: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ["breathing_exercise", "grounding_technique", "self_care", "mindfulness", "cognitive_reframing", "social_connection", "physical_activity", "gratitude_practice"]
  },
  category: {
    type: String,
    required: true,
    enum: ["anxiety", "stress", "depression", "bullying", "loneliness", "anger", "general", "sleep", "self_esteem"]
  },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "easy"
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
mentalHealthRecommendationSchema.index({ category: 1, type: 1, isActive: 1 });

const MentalHealthRecommendation = mongoose.model("MentalHealthRecommendation", mentalHealthRecommendationSchema);

export default MentalHealthRecommendation;