import Location, { UserAnalysisLog } from "../models/location.model.js";
import QwenMentalHealthAnalyzer from "../services/QwenMentalHealthAnalyzer.js";
import mongoose from "mongoose";

// Get all locations with enhanced filtering and mental health data
export const getLocations = async (req, res) => {
  try {
    const { 
      type, 
      lat, 
      lng, 
      radius = 5000, 
      limit = 20,
      minRating,
      minPeacefulnessScore,
      verified,
      sortBy = 'rating' 
    } = req.query;
    
    // Validate coordinates if provided
    let coordinates = null;
    if (lat && lng) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      
      if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid coordinates provided" 
        });
      }
      
      if (latitude < -90 || latitude > 90) {
        return res.status(400).json({ 
          success: false, 
          message: "Latitude must be between -90 and 90" 
        });
      }
      
      if (longitude < -180 || longitude > 180) {
        return res.status(400).json({ 
          success: false, 
          message: "Longitude must be between -180 and 180" 
        });
      }
      
      coordinates = [longitude, latitude]; // MongoDB expects [lng, lat]
    }
    
    const options = {
      type,
      verified: verified ? JSON.parse(verified) : undefined,
      minRating: minRating ? parseFloat(minRating) : undefined,
      minPeacefulnessScore: minPeacefulnessScore ? parseInt(minPeacefulnessScore) : undefined,
      limit: parseInt(limit),
      sort: getSortOptions(sortBy)
    };
    
    let locations;
    
    if (coordinates) {
      try {
        locations = await Location.findNearby(coordinates, parseInt(radius), options);
      } catch (geoError) {
        console.error("Geospatial query error:", geoError);
        if (geoError.code === 16755) { // MongoDB geospatial index error
          return res.status(500).json({ 
            success: false, 
            message: "Geospatial search not available. Please ensure 2dsphere index is created." 
          });
        }
        throw geoError;
      }
    } else {
      const query = {};
      if (options.type) query.type = options.type;
      if (options.verified !== undefined) query.verified = options.verified;
      if (options.minRating) query.rating = { $gte: options.minRating };
      if (options.minPeacefulnessScore) {
        query["stats.averagePeacefulnessScore"] = { $gte: options.minPeacefulnessScore };
      }
      
      locations = await Location.find(query)
        .sort(options.sort)
        .limit(parseInt(limit));
    }
    
    // Add distance calculation if coordinates provided
    if (coordinates) {
      locations = locations.map(location => {
        const distance = calculateDistance(
          parseFloat(lat), parseFloat(lng),
          location.location.coordinates[1], location.location.coordinates[0]
        );
        return {
          ...location.toObject(),
          distance: distance
        };
      });
    }
    
    res.status(200).json({
      success: true,
      count: locations.length,
      data: locations,
      filters: {
        coordinates,
        radius: parseInt(radius),
        ...options
      }
    });
  } catch (error) {
    console.error("Error fetching locations:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get top peaceful locations
export const getTopPeacefulLocations = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const locations = await Location.getTopPeacefulLocations(parseInt(limit));
    
    res.status(200).json({
      success: true,
      count: locations.length,
      data: locations
    });
  } catch (error) {
    console.error("Error fetching top peaceful locations:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get location by ID with full analysis data
export const getLocationById = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id)
      .populate('userFeedback.userId', 'name profilePicture');
    
    if (!location) {
      return res.status(404).json({ success: false, message: "Location not found" });
    }
    
    // Get user's analysis history for this location if logged in
    let userAnalysisHistory = [];
    if (req.user) {
      userAnalysisHistory = await UserAnalysisLog.find({
        userId: req.user.id,
        locationId: req.params.id
      }).sort({ createdAt: -1 }).limit(5);
    }
    
    res.status(200).json({
      success: true,
      data: {
        ...location.toObject(),
        userAnalysisHistory
      }
    });
  } catch (error) {
    console.error("Error fetching location:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Analyze location mental health score using Qwen
export const analyzeLocationMentalHealth = async (req, res) => {
  try {
    const { imageBase64, imageMetadata, coordinates, userPreferences } = req.body;
    
    // Validate required fields
    if (!imageBase64) {
      return res.status(400).json({ 
        success: false, 
        message: "Image data is required for analysis" 
      });
    }
    
    if (!coordinates || coordinates.length !== 2) {
      return res.status(400).json({ 
        success: false, 
        message: "Valid coordinates [lng, lat] are required" 
      });
    }
    
    // Perform analysis using Qwen Mental Health Analyzer
    const analysisResult = await QwenMentalHealthAnalyzer.analyzeMentalHealthLocation(
      imageBase64,
      imageMetadata || {},
      userPreferences || {}
    );
    
    if (!analysisResult.success) {
      throw new Error(analysisResult.error || "Analysis failed");
    }
    
    const analysis = analysisResult.locationAnalysis;
    
    // Save analysis log if user is logged in
    if (req.user) {
      const analysisLog = new UserAnalysisLog({
        userId: req.user.id,
        coordinates: coordinates,
        analysisResults: {
          peacefulnessScore: analysis.peacefulnessScore,
          mentalHealthRating: analysis.mentalHealthRating,
          areaBreakdown: analysis.areaBreakdown,
          atmosphere: analysis.atmosphere,
          visualDetails: analysis.visualDetails,
          peacefulnessIndicators: analysis.peacefulnessIndicators,
          stressIndicators: analysis.stressIndicators,
          recommendations: analysis.recommendations,
          imageMetadata: analysis.imageMetadata
        },
        userPreferences,
        personalizedInsights: analysis.personalizedInsights,
        sessionId: req.sessionID,
        deviceInfo: req.get('User-Agent')
      });
      
      await analysisLog.save();
    }
    
    // Check if this analysis is near an existing location
    const nearbyLocation = await Location.findOne({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: coordinates
          },
          $maxDistance: 100 // Within 100 meters
        }
      }
    });
    
    // Update location analysis if found
    if (nearbyLocation) {
      await nearbyLocation.addAnalysis({
        peacefulnessScore: analysis.peacefulnessScore,
        mentalHealthRating: analysis.mentalHealthRating,
        areaBreakdown: analysis.areaBreakdown,
        atmosphere: analysis.atmosphere,
        visualDetails: analysis.visualDetails,
        peacefulnessIndicators: analysis.peacefulnessIndicators,
        stressIndicators: analysis.stressIndicators,
        recommendations: analysis.recommendations,
        imageMetadata: analysis.imageMetadata
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        analysis: analysis,
        nearbyLocation: nearbyLocation ? {
          id: nearbyLocation._id,
          name: nearbyLocation.name,
          type: nearbyLocation.type
        } : null,
        savedToHistory: !!req.user
      }
    });
    
  } catch (error) {
    console.error("Error analyzing location mental health:", error);
    res.status(500).json({ 
      success: false, 
      message: `Analysis failed: ${error.message}` 
    });
  }
};

// Get user's analysis history
export const getUserAnalysisHistory = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    
    const { page = 1, limit = 20, sortBy = 'createdAt' } = req.query;
    
    const analyses = await UserAnalysisLog.find({ userId: req.user.id })
      .sort({ [sortBy]: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('locationId', 'name type address');
    
    const total = await UserAnalysisLog.countDocuments({ userId: req.user.id });
    
    res.status(200).json({
      success: true,
      data: analyses,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        count: analyses.length,
        totalRecords: total
      }
    });
    
  } catch (error) {
    console.error("Error fetching user analysis history:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get mental health insights and statistics for user
export const getUserMentalHealthInsights = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    
    const userId = req.user.id;
    
    // Get user's analysis history
    const analysisHistory = await UserAnalysisLog.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    
    // Get analysis statistics using the service
    const analysisStats = await QwenMentalHealthAnalyzer.getUserAnalysisStats(
      userId, 
      analysisHistory
    );
    
    // Aggregate user's analysis data for additional insights
    const insights = await UserAnalysisLog.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalAnalyses: { $sum: 1 },
          averagePeacefulnessScore: { $avg: "$analysisResults.peacefulnessScore" },
          highestScore: { $max: "$analysisResults.peacefulnessScore" },
          lowestScore: { $min: "$analysisResults.peacefulnessScore" },
          mostCommonRating: { $first: "$analysisResults.mentalHealthRating.level" },
          recentAnalyses: { $push: "$$ROOT" }
        }
      },
      {
        $project: {
          totalAnalyses: 1,
          averagePeacefulnessScore: { $round: ["$averagePeacefulnessScore", 1] },
          highestScore: 1,
          lowestScore: 1,
          mostCommonRating: 1,
          recentAnalyses: { $slice: ["$recentAnalyses", -5] }
        }
      }
    ]);
    
    // Get preferred location types
    const preferredTypes = await UserAnalysisLog.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      { $lookup: {
        from: 'locations',
        localField: 'locationId',
        foreignField: '_id',
        as: 'location'
      }},
      { $unwind: { path: "$location", preserveNullAndEmptyArrays: true } },
      { $group: {
        _id: "$location.type",
        count: { $sum: 1 },
        avgScore: { $avg: "$analysisResults.peacefulnessScore" }
      }},
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    // Generate personalized recommendations
    const recommendations = generatePersonalizedRecommendations(insights[0], preferredTypes);
    
    // Get recent analysis trends
    const recentAnalyses = analysisHistory.slice(0, 10).map(analysis => ({
      id: analysis._id,
      date: analysis.createdAt,
      score: analysis.analysisResults.peacefulnessScore,
      rating: analysis.analysisResults.mentalHealthRating.level,
      coordinates: analysis.coordinates,
      atmosphere: analysis.analysisResults.atmosphere
    }));
    
    res.status(200).json({
      success: true,
      data: {
        summary: insights[0] || {
          totalAnalyses: 0,
          averagePeacefulnessScore: 0,
          highestScore: 0,
          lowestScore: 0,
          mostCommonRating: 'NEUTRAL'
        },
        analysisStats,
        preferredLocationTypes: preferredTypes,
        recentAnalyses,
        recommendations
      }
    });
    
  } catch (error) {
    console.error("Error generating user mental health insights:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Batch analyze multiple locations
export const batchAnalyzeLocations = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    
    const { locations, userPreferences } = req.body;
    
    if (!locations || !Array.isArray(locations) || locations.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Locations array is required" 
      });
    }
    
    if (locations.length > 10) {
      return res.status(400).json({ 
        success: false, 
        message: "Maximum 10 locations can be analyzed at once" 
      });
    }
    
    // Perform batch analysis
    const results = await QwenMentalHealthAnalyzer.batchAnalyzeLocations(
      locations,
      userPreferences || {}
    );
    
    // Save successful analyses to user history
    const successfulAnalyses = results.filter(r => r.success);
    for (const result of successfulAnalyses) {
      const analysisLog = new UserAnalysisLog({
        userId: req.user.id,
        coordinates: result.analysis.coordinates || [0, 0],
        analysisResults: {
          peacefulnessScore: result.analysis.peacefulnessScore,
          mentalHealthRating: result.analysis.mentalHealthRating,
          areaBreakdown: result.analysis.areaBreakdown,
          atmosphere: result.analysis.atmosphere,
          visualDetails: result.analysis.visualDetails,
          peacefulnessIndicators: result.analysis.peacefulnessIndicators,
          stressIndicators: result.analysis.stressIndicators,
          recommendations: result.analysis.recommendations,
          imageMetadata: result.analysis.imageMetadata
        },
        userPreferences,
        personalizedInsights: result.analysis.personalizedInsights,
        sessionId: req.sessionID,
        deviceInfo: req.get('User-Agent')
      });
      
      await analysisLog.save();
    }
    
    res.status(200).json({
      success: true,
      data: {
        results,
        totalAnalyzed: results.length,
        successful: successfulAnalyses.length,
        failed: results.length - successfulAnalyses.length
      }
    });
    
  } catch (error) {
    console.error("Error in batch analysis:", error);
    res.status(500).json({ 
      success: false, 
      message: `Batch analysis failed: ${error.message}` 
    });
  }
};

// Add user feedback to location
export const addLocationFeedback = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    
    const { rating, review, mentalHealthHelpfulness } = req.body;
    const locationId = req.params.id;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false, 
        message: "Rating must be between 1 and 5" 
      });
    }
    
    const location = await Location.findById(locationId);
    if (!location) {
      return res.status(404).json({ success: false, message: "Location not found" });
    }
    
    // Check if user already left feedback
    const existingFeedback = location.userFeedback.find(
      feedback => feedback.userId.toString() === req.user.id
    );
    
    if (existingFeedback) {
      return res.status(400).json({ 
        success: false, 
        message: "You have already provided feedback for this location" 
      });
    }
    
    await location.addUserFeedback(req.user.id, rating, review, mentalHealthHelpfulness);
    
    res.status(200).json({
      success: true,
      message: "Feedback added successfully",
      data: {
        newRating: location.rating,
        totalFeedbacks: location.userFeedback.length
      }
    });
    
  } catch (error) {
    console.error("Error adding location feedback:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Create new location (admin only)
export const createLocation = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: "Not authorized to add locations" });
    }
    
    const {
      name,
      type,
      coordinates,
      address,
      description,
      contactNumber,
      website,
      operatingHours,
      services,
      amenities,
      accessibility
    } = req.body;
    
    if (!name || !type || !coordinates || !address) {
      return res.status(400).json({ success: false, message: "Please provide all required fields" });
    }
    
    const newLocation = new Location({
      name,
      type,
      location: {
        type: "Point",
        coordinates
      },
      address,
      description,
      contactNumber,
      website,
      operatingHours,
      services,
      amenities,
      accessibility,
      verified: true // Admin-created locations are auto-verified
    });
    
    const savedLocation = await newLocation.save();
    
    res.status(201).json({
      success: true,
      data: savedLocation
    });
  } catch (error) {
    console.error("Error creating location:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update location (admin only)
export const updateLocation = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: "Not authorized to update locations" });
    }
    
    const location = await Location.findById(req.params.id);
    
    if (!location) {
      return res.status(404).json({ success: false, message: "Location not found" });
    }
    
    const updatedLocation = await Location.findByIdAndUpdate(
      req.params.id,
      { $set: req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: updatedLocation
    });
  } catch (error) {
    console.error("Error updating location:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete location (admin only)
export const deleteLocation = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: "Not authorized to delete locations" });
    }
    
    const location = await Location.findById(req.params.id);
    
    if (!location) {
      return res.status(404).json({ success: false, message: "Location not found" });
    }
    
    await Location.findByIdAndDelete(req.params.id);
    
    // Also delete related analysis logs
    await UserAnalysisLog.deleteMany({ locationId: req.params.id });
    
    res.status(200).json({
      success: true,
      message: "Location deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting location:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Seed locations with sample data
export const seedLocations = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: "Not authorized to seed locations" });
    }

    const sampleLocations = [
      {
        name: "Taman Sari Water Castle",
        type: "park",
        location: {
          type: "Point",
          coordinates: [110.3594, -7.8097] // [longitude, latitude]
        },
        address: "Jl. Taman, Kraton, Yogyakarta",
        description: "Historic water castle and garden complex",
        rating: 4.5,
        verified: true,
        moodScore: 85,
        services: ["Historical Tours", "Garden Walks", "Photography"],
        accessibility: {
          wheelchairAccessible: true,
          publicTransport: true,
          parking: true
        },
        amenities: ["Restrooms", "Café", "Gift Shop", "Guided Tours"]
      },
      {
        name: "Malioboro Street",
        type: "cafe",
        location: {
          type: "Point",
          coordinates: [110.3694, -7.7971]
        },
        address: "Jl. Malioboro, Yogyakarta",
        description: "Famous shopping and dining street",
        rating: 4.2,
        verified: true,
        moodScore: 70,
        services: ["Shopping", "Dining", "Street Food"],
        accessibility: {
          wheelchairAccessible: true,
          publicTransport: true,
          parking: false
        },
        amenities: ["Street Vendors", "Restaurants", "Shopping Centers"]
      },
      {
        name: "Borobudur Temple",
        type: "meditation_center",
        location: {
          type: "Point",
          coordinates: [110.2044, -7.6079]
        },
        address: "Borobudur, Magelang, Central Java",
        description: "Ancient Buddhist temple and meditation site",
        rating: 4.8,
        verified: true,
        moodScore: 95,
        services: ["Meditation", "Spiritual Tours", "Sunrise Viewing"],
        accessibility: {
          wheelchairAccessible: false,
          publicTransport: true,
          parking: true
        },
        amenities: ["Visitor Center", "Restaurants", "Gift Shop", "Guided Tours"]
      }
    ];

    // Clear existing locations
    await Location.deleteMany({});

    // Insert sample locations
    const createdLocations = await Location.insertMany(sampleLocations);

    res.status(200).json({
      success: true,
      message: "Sample locations seeded successfully",
      count: createdLocations.length,
      data: createdLocations
    });

  } catch (error) {
    console.error("Error seeding locations:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Save user geospatial analysis (PeaceFinder custom pin)
export const saveUserGeospatialAnalysis = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    const { coordinates, analysisResults, userPreferences, personalizedInsights, imageMetadata } = req.body;
    if (!coordinates || coordinates.length !== 2 || !analysisResults) {
      return res.status(400).json({ success: false, message: "Coordinates and analysisResults are required" });
    }
    // Cari lokasi terdekat dalam 100m
    const nearbyLocation = await Location.findOne({
      location: {
        $near: {
          $geometry: { type: "Point", coordinates },
          $maxDistance: 100
        }
      }
    });
    // Simpan ke log user
    const analysisLog = new UserAnalysisLog({
      userId: req.user.id,
      locationId: nearbyLocation ? nearbyLocation._id : undefined,
      coordinates,
      analysisResults,
      userPreferences,
      personalizedInsights,
      sessionId: req.sessionID,
      deviceInfo: req.get('User-Agent'),
      'analysisResults.imageMetadata': imageMetadata
    });
    await analysisLog.save();
    return res.status(201).json({
      success: true,
      data: {
        analysisLog,
        nearbyLocation: nearbyLocation ? {
          id: nearbyLocation._id,
          name: nearbyLocation.name,
          type: nearbyLocation.type
        } : null
      }
    });
  } catch (error) {
    console.error("Error saving user geospatial analysis:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Utility functions
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c;
  return parseFloat(distance.toFixed(1));
};

const getSortOptions = (sortBy) => {
  switch (sortBy) {
    case 'rating':
      return { rating: -1 };
    case 'peacefulness':
      return { "stats.averagePeacefulnessScore": -1 };
    case 'distance':
      return {}; // Distance sorting handled by $near
    case 'newest':
      return { createdAt: -1 };
    default:
      return { rating: -1 };
  }
};

const generatePersonalizedRecommendations = (summary, preferredTypes) => {
  const recommendations = [];
  
  if (summary.averagePeacefulnessScore < 60) {
    recommendations.push("Consider exploring locations with higher peacefulness scores to improve your mental wellbeing");
    recommendations.push("Look for parks and natural areas which tend to have better mental health benefits");
  }
  
  if (summary.totalAnalyses > 10) {
    recommendations.push("You're actively monitoring your environment - keep tracking to identify patterns");
  }
  
  const topType = preferredTypes[0];
  if (topType && topType._id) {
    recommendations.push(`You seem to prefer ${topType._id} locations. We can suggest more similar places`);
  }
  
  if (summary.highestScore - summary.lowestScore > 40) {
    recommendations.push("You've experienced varied environments. Consider what made the high-scoring locations special");
  }
  
  return recommendations;
};

// Export statements are already defined above with individual export keywords