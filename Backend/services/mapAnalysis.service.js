import axios from 'axios';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Enhanced peacefulness calculation with more sophisticated algorithm
export const calculateAdvancedPeacefulnessScore = (areaDistribution, coordinates) => {
  const { greenBlueSpaces, buildings, roads, neutral } = areaDistribution;
  
  // Base weights for different area types
  const weights = {
    greenBlue: 0.45,    // Higher weight for nature
    neutral: 0.15,      // Moderate positive for open spaces
    buildings: -0.25,   // Negative for urban density
    roads: -0.35        // Higher negative for traffic/noise
  };
  
  // Calculate base score
  let baseScore = 50 + // Starting point
    (greenBlueSpaces * weights.greenBlue) +
    (neutral * weights.neutral) +
    (buildings * weights.buildings) +
    (roads * weights.roads);
  
  // Apply location-based modifiers (if coordinates suggest specific areas)
  // This could be enhanced with real geographic data
  const locationModifier = getLocationModifier(coordinates);
  baseScore += locationModifier;
  
  // Apply distribution balance bonus
  const balanceBonus = getBalanceBonus(areaDistribution);
  baseScore += balanceBonus;
  
  // Ensure score is within 0-100 range
  return Math.max(0, Math.min(100, Math.round(baseScore)));
};

// Get location-based modifier (can be enhanced with real data)
const getLocationModifier = (coordinates) => {
  // This is a simplified version - in production, you'd use real geographic data
  // For now, we'll use random modifiers based on coordinate patterns
  const [lng, lat] = coordinates;
  
  // Example: Areas near water bodies or known parks get bonus
  // This would be replaced with actual geographic database queries
  let modifier = 0;
  
  // Simulate coastal or riverside areas (higher peacefulness)
  if (Math.abs(lng % 1) < 0.1 || Math.abs(lat % 1) < 0.1) {
    modifier += 5;
  }
  
  // Simulate urban center penalty
  if (Math.abs(lng) > 100 && Math.abs(lat) < 10) {
    modifier -= 3;
  }
  
  return modifier;
};

// Calculate balance bonus for diverse but harmonious area distribution
const getBalanceBonus = (areaDistribution) => {
  const { greenBlueSpaces, buildings, roads, neutral } = areaDistribution;
  
  // Ideal distribution: high green/blue, moderate neutral, low buildings/roads
  const idealRatios = {
    greenBlueSpaces: 40,
    neutral: 30,
    buildings: 20,
    roads: 10
  };
  
  // Calculate deviation from ideal
  let totalDeviation = 0;
  Object.keys(idealRatios).forEach(key => {
    const deviation = Math.abs(areaDistribution[key] - idealRatios[key]);
    totalDeviation += deviation;
  });
  
  // Convert deviation to bonus (lower deviation = higher bonus)
  const maxDeviation = 200; // Maximum possible total deviation
  const balanceScore = ((maxDeviation - totalDeviation) / maxDeviation) * 10;
  
  return Math.max(0, balanceScore);
};

// Generate detailed recommendations based on analysis
export const generateRecommendations = (areaDistribution, peacefulnessScore, coordinates) => {
  const recommendations = [];
  const { greenBlueSpaces, buildings, roads, neutral } = areaDistribution;
  
  // Base recommendations based on peacefulness score
  if (peacefulnessScore >= 75) {
    recommendations.push("This area is excellent for meditation and mindfulness practices");
    recommendations.push("Perfect for outdoor yoga or tai chi sessions");
    recommendations.push("Ideal for nature photography and peaceful walks");
  } else if (peacefulnessScore >= 50) {
    recommendations.push("Good for short relaxation breaks and light exercise");
    recommendations.push("Consider visiting during off-peak hours for better tranquility");
    recommendations.push("Look for quieter spots within the area for meditation");
  } else {
    recommendations.push("Use noise-canceling headphones for better focus");
    recommendations.push("Visit early morning or late evening for reduced activity");
    recommendations.push("Consider this area for brief visits rather than extended stays");
  }
  
  // Specific recommendations based on area composition
  if (greenBlueSpaces > 30) {
    recommendations.push("Take advantage of the abundant green spaces for stress relief");
    recommendations.push("Practice forest bathing or nature immersion techniques");
  }
  
  if (roads > 25) {
    recommendations.push("Stay away from main roads to minimize noise exposure");
    recommendations.push("Use breathing exercises to cope with urban stress");
  }
  
  if (buildings > 40) {
    recommendations.push("Look for rooftop gardens or elevated peaceful spots");
    recommendations.push("Find indoor spaces with good natural lighting");
  }
  
  if (neutral > 25) {
    recommendations.push("Utilize open spaces for group activities or social wellness");
    recommendations.push("These areas are good for walking meditation");
  }
  
  return recommendations;
};

// Generate healing spots based on area analysis
export const generateHealingSpots = (coordinates, areaDistribution) => {
  const [baseLng, baseLat] = coordinates;
  const healingSpots = [];
  const { greenBlueSpaces, buildings, roads, neutral } = areaDistribution;
  
  // Generate spots based on area composition
  if (greenBlueSpaces > 20) {
    healingSpots.push({
      name: "Natural Sanctuary",
      coordinates: [
        baseLng + (Math.random() - 0.5) * 0.005,
        baseLat + (Math.random() - 0.5) * 0.005
      ],
      reason: "High concentration of green spaces promotes natural stress relief and mental restoration"
    });
  }
  
  if (neutral > 20) {
    healingSpots.push({
      name: "Open Space Haven",
      coordinates: [
        baseLng + (Math.random() - 0.5) * 0.008,
        baseLat + (Math.random() - 0.5) * 0.008
      ],
      reason: "Open areas provide mental space and freedom from urban constraints"
    });
  }
  
  // Always include at least one spot for quiet contemplation
  healingSpots.push({
    name: "Quiet Contemplation Zone",
    coordinates: [
      baseLng + (Math.random() - 0.5) * 0.006,
      baseLat + (Math.random() - 0.5) * 0.006
    ],
    reason: "Identified as a relatively peaceful area suitable for reflection and mindfulness"
  });
  
  // If area has low peacefulness, suggest coping spots
  const peacefulnessScore = calculateAdvancedPeacefulnessScore(areaDistribution, coordinates);
  if (peacefulnessScore < 50) {
    healingSpots.push({
      name: "Urban Resilience Point",
      coordinates: [
        baseLng + (Math.random() - 0.5) * 0.004,
        baseLat + (Math.random() - 0.5) * 0.004
      ],
      reason: "Strategic location for practicing urban mindfulness and stress management techniques"
    });
  }
  
  return healingSpots.slice(0, 4); // Limit to 4 spots
};

// Process uploaded map image
export const processMapImage = async (imagePath) => {
  try {
    // Process image with Sharp for optimization
    const processedImagePath = path.join(path.dirname(imagePath), 'processed_' + path.basename(imagePath));
    
    await sharp(imagePath)
      .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toFile(processedImagePath);
    
    // Convert to base64 for API transmission
    const imageBuffer = fs.readFileSync(processedImagePath);
    const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
    
    // Clean up processed file
    fs.unlinkSync(processedImagePath);
    
    return base64Image;
  } catch (error) {
    console.error('Error processing map image:', error);
    throw new Error('Failed to process map image');
  }
};

// Mock color analysis for demonstration (would be replaced with actual image analysis)
export const analyzeMapColors = (imageData) => {
  // This is a simplified mock - in production, you'd use computer vision
  // to actually analyze the image colors and classify areas
  
  const mockAnalysis = {
    greenBlueSpaces: Math.floor(Math.random() * 40) + 15, // 15-55%
    buildings: Math.floor(Math.random() * 35) + 20,       // 20-55%
    roads: Math.floor(Math.random() * 25) + 10,           // 10-35%
    neutral: 0 // Will be calculated to make total 100%
  };
  
  // Ensure total adds up to 100%
  const currentTotal = mockAnalysis.greenBlueSpaces + mockAnalysis.buildings + mockAnalysis.roads;
  mockAnalysis.neutral = Math.max(0, 100 - currentTotal);
  
  // Adjust if total exceeds 100%
  if (currentTotal > 100) {
    const excess = currentTotal - 100;
    const reduction = excess / 3;
    mockAnalysis.greenBlueSpaces = Math.max(0, mockAnalysis.greenBlueSpaces - reduction);
    mockAnalysis.buildings = Math.max(0, mockAnalysis.buildings - reduction);
    mockAnalysis.roads = Math.max(0, mockAnalysis.roads - reduction);
    mockAnalysis.neutral = 100 - (mockAnalysis.greenBlueSpaces + mockAnalysis.buildings + mockAnalysis.roads);
  }
  
  return mockAnalysis;
};