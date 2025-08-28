import mongoose from "mongoose";

// Schema for storing mental health analysis results
const mentalHealthAnalysisSchema = new mongoose.Schema({
  peacefulnessScore: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  mentalHealthRating: {
    level: {
      type: String,
      enum: ['EXCELLENT', 'GOOD', 'MODERATE', 'POOR', 'VERY_POOR'],
      required: true
    },
    color: String,
    description: String,
    recommendation: String
  },
  areaBreakdown: {
    greenNature: { type: Number, default: 0 },
    blueWater: { type: Number, default: 0 },
    whiteOpen: { type: Number, default: 0 },
    lightPeaceful: { type: Number, default: 0 },
    yellowRoads: { type: Number, default: 0 },
    grayBusy: { type: Number, default: 0 },
    brownBuildings: { type: Number, default: 0 },
    redIndustrial: { type: Number, default: 0 }
  },
  atmosphere: String,
  visualDetails: String,
  peacefulnessIndicators: [String],
  stressIndicators: [String],
  recommendations: {
    activities: [String],
    bestTimes: [String],
    concerns: [String],
    alternatives: [String],
    mentalHealthTips: [String]
  },
  analyzedBy: {
    type: String,
    default: 'Qwen 2.5 VL-32B'
  },
  analysisDate: {
    type: Date,
    default: Date.now
  },
  imageMetadata: {
    width: Number,
    height: Number,
    scale: Number
  }
});

// Schema for user analysis logs
const userAnalysisLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  locationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location'
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true
  },
  analysisResults: mentalHealthAnalysisSchema,
  userPreferences: {
    anxietyLevel: {
      type: String,
      enum: ['low', 'moderate', 'high']
    },
    depressionLevel: {
      type: String,
      enum: ['low', 'moderate', 'high']
    },
    prefersNature: Boolean,
    sensitiveToNoise: Boolean,
    needsWater: Boolean,
    preferredActivities: [String]
  },
  personalizedInsights: {
    suitability: {
      type: String,
      enum: ['high', 'moderate', 'low', 'neutral'],
      default: 'neutral'
    },
    personalizedTips: [String],
    warnings: [String],
    customRecommendations: [String]
  },
  sessionId: String,
  deviceInfo: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Enhanced location schema
const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ["clinic", "counseling", "park", "cafe", "hospital", "therapy_center", "meditation_center", "gym", "spa", "library"],
    index: true
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
      index: '2dsphere'
    }
  },
  address: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ""
  },
  contactNumber: {
    type: String,
    default: ""
  },
  website: {
    type: String,
    default: ""
  },
  operatingHours: {
    type: String,
    default: ""
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  verified: {
    type: Boolean,
    default: false
  },
  // Mental health specific fields
  moodScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 75
  },
  services: [String],
  accessibility: {
    wheelchairAccessible: Boolean,
    publicTransport: Boolean,
    parking: Boolean
  },
  amenities: [String],
  // Latest mental health analysis for this location
  latestAnalysis: mentalHealthAnalysisSchema,
  // Analysis history
  analysisHistory: [mentalHealthAnalysisSchema],
  // User feedback and ratings
  userFeedback: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String,
    mentalHealthHelpfulness: {
      type: Number,
      min: 1,
      max: 5
    },
    visitDate: Date,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Statistics
  stats: {
    totalAnalyses: {
      type: Number,
      default: 0
    },
    averagePeacefulnessScore: {
      type: Number,
      default: 0
    },
    lastAnalyzed: Date,
    popularTimes: [{
      day: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      },
      hours: [Number] // Hours when this place is most visited
    }]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better performance
locationSchema.index({ location: "2dsphere" });
locationSchema.index({ type: 1, verified: 1 });
locationSchema.index({ rating: -1 });
locationSchema.index({ "stats.averagePeacefulnessScore": -1 });
locationSchema.index({ createdAt: -1 });

userAnalysisLogSchema.index({ userId: 1, createdAt: -1 });
userAnalysisLogSchema.index({ coordinates: "2dsphere" });
userAnalysisLogSchema.index({ "analysisResults.peacefulnessScore": -1 });

// Pre-save middleware to update stats
locationSchema.pre('save', function(next) {
  if (this.analysisHistory && this.analysisHistory.length > 0) {
    this.stats.totalAnalyses = this.analysisHistory.length;
    const avgScore = this.analysisHistory.reduce((sum, analysis) => sum + analysis.peacefulnessScore, 0) / this.analysisHistory.length;
    this.stats.averagePeacefulnessScore = Math.round(avgScore);
    this.stats.lastAnalyzed = this.analysisHistory[this.analysisHistory.length - 1].analysisDate;
  }
  next();
});

// Virtual for getting distance (to be used with aggregation)
locationSchema.virtual('distance');

// Methods
locationSchema.methods.addAnalysis = function(analysisData) {
  this.latestAnalysis = analysisData;
  this.analysisHistory.push(analysisData);
  this.moodScore = analysisData.peacefulnessScore;
  return this.save();
};

locationSchema.methods.addUserFeedback = function(userId, rating, review, mentalHealthHelpfulness) {
  this.userFeedback.push({
    userId,
    rating,
    review,
    mentalHealthHelpfulness,
    visitDate: new Date()
  });
  
  // Update average rating
  const totalRatings = this.userFeedback.length;
  const avgRating = this.userFeedback.reduce((sum, feedback) => sum + feedback.rating, 0) / totalRatings;
  this.rating = Math.round(avgRating * 10) / 10;
  
  return this.save();
};

// Static methods
locationSchema.statics.findNearby = function(coordinates, maxDistance = 5000, options = {}) {
  const query = {
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: coordinates
        },
        $maxDistance: maxDistance
      }
    }
  };
  
  if (options.type) {
    query.type = options.type;
  }
  
  if (options.verified !== undefined) {
    query.verified = options.verified;
  }
  
  if (options.minRating) {
    query.rating = { $gte: options.minRating };
  }
  
  if (options.minPeacefulnessScore) {
    query["stats.averagePeacefulnessScore"] = { $gte: options.minPeacefulnessScore };
  }
  
  return this.find(query)
    .limit(options.limit || 20)
    .sort(options.sort || { rating: -1 });
};

locationSchema.statics.getTopPeacefulLocations = function(limit = 10) {
  return this.find({ 
    verified: true,
    "stats.totalAnalyses": { $gte: 1 }
  })
  .sort({ "stats.averagePeacefulnessScore": -1, rating: -1 })
  .limit(limit);
};

const Location = mongoose.model("Location", locationSchema);
const UserAnalysisLog = mongoose.model("UserAnalysisLog", userAnalysisLogSchema);

export { Location as default, UserAnalysisLog };