import mongoose from "mongoose";

const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ["clinic", "counseling", "park", "cafe"],
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

// Create a geospatial index on the location field
locationSchema.index({ location: "2dsphere" });

const Location = mongoose.model("Location", locationSchema);

export default Location;