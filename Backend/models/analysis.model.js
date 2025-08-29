import mongoose from "mongoose";

const analysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point"
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    }
  },
  address: {
    type: String,
    required: true
  },
  mapImageUrl: {
    type: String,
    required: false
  },
  peacefulnessScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  peacefulnessLabel: {
    type: String,
    enum: ["Very Peaceful", "Moderately Peaceful", "Less Peaceful"],
    required: true
  },
  areaDistribution: {
    greenBlueSpaces: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    buildings: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    roads: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    neutral: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    }
  },
  aiAnalysis: {
    description: {
      type: String,
      required: true
    },
    recommendations: [{
      type: String
    }],
    healingSpots: [{
      name: String,
      coordinates: [Number],
      reason: String
    }]
  },
  metadata: {
    analysisDate: {
      type: Date,
      default: Date.now
    },
    modelVersion: {
      type: String,
      default: "qwen2.5-vl"
    },
    processingTime: {
      type: Number // in milliseconds
    }
  }
}, {
  timestamps: true
});

// Create a geospatial index on the location field
analysisSchema.index({ location: "2dsphere" });
analysisSchema.index({ userId: 1, createdAt: -1 });

const Analysis = mongoose.model("Analysis", analysisSchema);

export default Analysis;