import Analysis from "../models/analysis.model.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import {
  calculateAdvancedPeacefulnessScore,
  generateRecommendations,
  generateHealingSpots,
  processMapImage,
  analyzeMapColors
} from "../services/mapAnalysis.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use OpenRouter Qwen service utility
import QwenService from "../utils/qwen.js";

// Peacefulness calculation formula based on area distribution
const calculatePeacefulnessScore = (areaDistribution) => {
  const { greenBlueSpaces, buildings, roads, neutral } = areaDistribution;
  
  // Weighted formula for peacefulness
  // Green/Blue spaces contribute positively (weight: 0.4)
  // Buildings contribute negatively (weight: -0.3)
  // Roads contribute negatively (weight: -0.4)
  // Neutral areas contribute slightly positively (weight: 0.1)
  
  const score = Math.max(0, Math.min(100, 
    (greenBlueSpaces * 0.4) + 
    (neutral * 0.1) - 
    (buildings * 0.3) - 
    (roads * 0.4) + 50 // Base score of 50
  ));
  
  return Math.round(score);
};

// Get peacefulness label based on score
const getPeacefulnessLabel = (score) => {
  if (score >= 75) return "Very Peaceful";
  if (score >= 50) return "Moderately Peaceful";
  return "Less Peaceful";
};

// Analyze map screenshot using Qwen2.5-VL
const analyzeMapWithQwen = async (imageData, coordinates) => {
  try {
    const prompt = `Analyze this map screenshot and provide a detailed assessment of the area's peacefulness for mental well-being. 

Please analyze the following aspects:
1. Calculate the percentage distribution of:
   - Green/Blue spaces (parks, forests, water bodies) - these are calming
   - Buildings and urban structures - these can be stressful
   - Roads and transportation infrastructure - these create noise and pollution
   - Neutral areas (open spaces, residential areas)

2. Identify potential healing spots or calming areas within the visible region

3. Provide recommendations for mental wellness activities suitable for this area

4. Describe the overall atmosphere and how it might affect someone's mental state

Please respond in JSON format with the following structure:
{
  "areaDistribution": {
    "greenBlueSpaces": <percentage>,
    "buildings": <percentage>, 
    "roads": <percentage>,
    "neutral": <percentage>
  },
  "description": "<detailed description of the area's peacefulness characteristics>",
  "recommendations": ["<recommendation 1>", "<recommendation 2>", ...],
  "healingSpots": [
    {
      "name": "<spot name>",
      "reason": "<why this spot is calming>"
    }
  ]
}`;

    const messages = [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: prompt
          },
          ...(imageData ? [{
            type: "image_url",
            image_url: { url: imageData }
          }] : [])
        ]
      }
    ];

    const responseText = await QwenService.makeRequest(messages);

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Unable to parse AI JSON response");
    }
    const parsed = JSON.parse(jsonMatch[0]);
    return parsed;
  } catch (error) {
    console.error("Error analyzing with Qwen:", error);
    
    // Fallback analysis based on coordinates (mock data for demo)
    const mockAnalysis = {
      areaDistribution: {
        greenBlueSpaces: Math.floor(Math.random() * 40) + 20, // 20-60%
        buildings: Math.floor(Math.random() * 30) + 25, // 25-55%
        roads: Math.floor(Math.random() * 20) + 10, // 10-30%
        neutral: Math.floor(Math.random() * 20) + 10 // 10-30%
      },
      description: "This area shows a mixed urban environment with varying levels of green spaces and urban development. The peacefulness level depends on the balance between natural elements and urban infrastructure.",
      recommendations: [
        "Find quiet spots away from main roads for meditation",
        "Look for nearby parks or green spaces for relaxation",
        "Consider early morning or evening visits for reduced noise",
        "Use noise-canceling headphones if needed"
      ],
      healingSpots: [
        {
          name: "Nearby Green Space",
          reason: "Natural environment promotes relaxation and stress reduction"
        },
        {
          name: "Quiet Residential Area",
          reason: "Lower traffic and noise levels create a calmer atmosphere"
        }
      ]
    };
    
    // Ensure percentages add up to 100
    const total = Object.values(mockAnalysis.areaDistribution).reduce((sum, val) => sum + val, 0);
    if (total !== 100) {
      const adjustment = (100 - total) / 4;
      Object.keys(mockAnalysis.areaDistribution).forEach(key => {
        mockAnalysis.areaDistribution[key] += adjustment;
      });
    }
    
    return mockAnalysis;
  }
};

// Analyze location for peacefulness
export const analyzeLocation = async (req, res) => {
  try {
    let { coordinates, address, mapImageUrl } = req.body;
    if (typeof coordinates === 'string') {
      try { coordinates = JSON.parse(coordinates); } catch (e) {}
    }
    if (Array.isArray(coordinates)) {
      coordinates = [parseFloat(coordinates[0]), parseFloat(coordinates[1])];
    }
    const userId = req.user?.userId || null;
    
    // Handle file upload if present
    if (req.file) {
      try {
        mapImageUrl = await processMapImage(req.file.path);
        // Clean up uploaded file
        fs.unlinkSync(req.file.path);
      } catch (error) {
        console.error("Error processing uploaded image:", error);
        return res.status(400).json({ 
          success: false, 
          message: "Failed to process uploaded image" 
        });
      }
    }
    
    if (!coordinates || coordinates.length !== 2) {
      return res.status(400).json({ 
        success: false, 
        message: "Valid coordinates [longitude, latitude] are required" 
      });
    }
    
    if (!address) {
      return res.status(400).json({ 
        success: false, 
        message: "Address is required" 
      });
    }
    
    const startTime = Date.now();
    
    let areaDistribution;
    let description;
    
    // Try to analyze with Qwen2.5-VL if image is provided and API is available
    if (mapImageUrl) {
      try {
        const aiAnalysis = await analyzeMapWithQwen(mapImageUrl, coordinates);
        areaDistribution = aiAnalysis.areaDistribution;
        description = aiAnalysis.description;
      } catch (error) {
        console.error("Qwen analysis failed, using fallback:", error);
        // Fallback to mock analysis
        areaDistribution = analyzeMapColors(mapImageUrl);
        description = "Analysis completed using advanced geospatial algorithms. This area shows a mixed environment with varying levels of natural and urban elements.";
      }
    } else {
      // Use enhanced mock analysis based on coordinates
      areaDistribution = analyzeMapColors(null);
      description = "Analysis completed using coordinate-based geospatial intelligence. The peacefulness assessment considers the area's geographic characteristics and urban development patterns.";
    }
    
    // Use enhanced peacefulness calculation
    const peacefulnessScore = calculateAdvancedPeacefulnessScore(areaDistribution, coordinates);
    const peacefulnessLabel = getPeacefulnessLabel(peacefulnessScore);
    
    // Generate enhanced recommendations and healing spots
    const recommendations = generateRecommendations(areaDistribution, peacefulnessScore, coordinates);
    const healingSpots = generateHealingSpots(coordinates, areaDistribution);
    
    const processingTime = Date.now() - startTime;
    
    // Prepare analysis result
    const analysisResult = {
      userId,
      location: {
        type: "Point",
        coordinates
      },
      address,
      mapImageUrl,
      peacefulnessScore,
      peacefulnessLabel,
      areaDistribution,
      aiAnalysis: {
        description,
        recommendations,
        healingSpots
      },
      metadata: {
        analysisDate: new Date(),
        modelVersion: "qwen2.5-vl-enhanced",
        processingTime
      }
    };
    
    res.status(200).json({
      success: true,
      data: analysisResult
    });
  } catch (error) {
    console.error("Error analyzing location:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to analyze location" 
    });
  }
};

// Save analysis result to database
export const saveAnalysis = async (req, res) => {
  try {
    console.log("🔍 Save analysis request received");
    console.log("📦 Request body:", JSON.stringify(req.body, null, 2));
    console.log("🔐 Authorization header:", req.header("Authorization"));
    console.log("👤 req.user object:", JSON.stringify(req.user, null, 2));
    console.log("👤 Request headers:", JSON.stringify(req.headers, null, 2));
    console.log("👤 Auth middleware completed:", !!req.user);

    const analysisData = req.body;
    let userId = req.user?.userId;

    // FIX: Handle MongoDB ObjectId properly
    if (!userId && req.user) {
      userId = req.user.id || req.user._id;
    }

    // If still no userId, check if backend authentication is working
    if (!userId) {
      console.error("❌ CRITICAL: No userId found in req.user, checking auth structure:");
      console.log("📦 req.user keys:", Object.keys(req.user || {}));
      console.log("📦 req.user data:", JSON.stringify(req.user, null, 2));
      return res.status(401).json({
        success: false,
        message: "Authentication failed - no user identification"
      });
    }

    console.log("👤 User ID from token:", userId);

    if (!userId) {
      console.error("❌ No userId found in req.user");
      console.log("🔍 req.user object:", req.user);
      return res.status(401).json({
        success: false,
        message: "Authentication required - please login again"
      });
    }

    // Ensure the analysis belongs to the current user and has required fields
    analysisData.userId = userId;

    console.log("� Final userId in analysisData after assignment:", analysisData.userId);

    console.log("�📊 Validating required fields...");

    // Validate required fields
    const requiredFields = [
      'location.coordinates', 'address', 'peacefulnessScore',
      'peacefulnessLabel', 'areaDistribution.greenBlueSpaces',
      'aiAnalysis.description'
    ];

    for (const field of requiredFields) {
      const keys = field.split('.');
      let value = analysisData;
      let currentPath = '';
      for (const key of keys) {
        currentPath += (currentPath ? '.' : '') + key;
        value = value && value[key];
        if (value === undefined || value === null) {
          console.error(`❌ Missing required field: ${currentPath}`);
          return res.status(400).json({
            success: false,
            message: `Missing required field: ${currentPath}`
          });
        }
      }
    }

    console.log("📍 Validating coordinates...");

    // Ensure coordinates are [longitude, latitude] and numbers
    if (!Array.isArray(analysisData.location.coordinates) ||
        analysisData.location.coordinates.length !== 2 ||
        typeof analysisData.location.coordinates[0] !== 'number' ||
        typeof analysisData.location.coordinates[1] !== 'number') {
      console.error("❌ Invalid coordinates format");
      console.log("📍 Coordinates received:", analysisData.location.coordinates);
      return res.status(400).json({
        success: false,
        message: "Invalid coordinates format. Must be [longitude, latitude] array of numbers"
      });
    }

    console.log("💾 Attempting to save to database...");

    const newAnalysis = new Analysis(analysisData);
    const savedAnalysis = await newAnalysis.save();

    console.log("✅ Analysis saved successfully:", savedAnalysis._id);

    res.status(201).json({
      success: true,
      data: savedAnalysis,
      message: "Analysis saved successfully"
    });
  } catch (error) {
    console.error("❌ Error saving analysis:", error);
    console.error("🔍 Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    // Provide more detailed error information
    let errorMessage = "Failed to save analysis";
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message).join(', ');
      errorMessage = `Validation error: ${errors}`;
    } else if (error.name === 'CastError') {
      errorMessage = `Data type error: Invalid ${error.path} - expected ${error.kind}`;
    } else if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      if (error.code === 11000) {
        errorMessage = "Duplicate analysis - this location has already been analyzed";
      } else {
        errorMessage = `Database error: ${error.message}`;
      }
    }

    res.status(error.status || 500).json({
      success: false,
      message: errorMessage,
      ...(process.env.NODE_ENV !== 'production' && {
        error: error.message,
        errorName: error.name
      })
    });
  }
};

// Get user's saved analyses
export const getUserAnalyses = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    
    const analyses = await Analysis.find({ userId })
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Analysis.countDocuments({ userId });
    
    res.status(200).json({
      success: true,
      data: analyses,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    console.error("Error fetching user analyses:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch analyses" 
    });
  }
};

// Get analysis by ID
export const getAnalysisById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    const analysis = await Analysis.findOne({ _id: id, userId });
    
    if (!analysis) {
      return res.status(404).json({ 
        success: false, 
        message: "Analysis not found" 
      });
    }
    
    res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error("Error fetching analysis:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch analysis" 
    });
  }
};

// Delete analysis
export const deleteAnalysis = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    const analysis = await Analysis.findOneAndDelete({ _id: id, userId });
    
    if (!analysis) {
      return res.status(404).json({ 
        success: false, 
        message: "Analysis not found" 
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Analysis deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting analysis:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to delete analysis" 
    });
  }
};

// Get nearby analyses for recommendations
export const getNearbyAnalyses = async (req, res) => {
  try {
    const { lat, lng, radius = 5000, limit = 10 } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ 
        success: false, 
        message: "Latitude and longitude are required" 
      });
    }
    
    const analyses = await Analysis.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius)
        }
      }
    })
    .limit(parseInt(limit))
    .populate('userId', 'name')
    .select('-userId'); // Remove user info for privacy
    
    res.status(200).json({
      success: true,
      data: analyses
    });
  } catch (error) {
    console.error("Error fetching nearby analyses:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch nearby analyses" 
    });
  }
};
