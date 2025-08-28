import QwenAnalyzer from '../utils/qwen.js';

class MentalHealthAnalysisService {
  constructor() {
    this.qwenAnalyzer = QwenAnalyzer;
  }

  /**
   * Analyze mental health suitability of a location based on map screenshot
   * @param {string} imageBase64 - Base64 encoded image data
   * @param {Object} imageMetadata - Image dimensions and scale information
   * @param {Object} userPreferences - User's mental health preferences
   * @returns {Promise<Object>} Complete mental health analysis
   */
  async analyzeMentalHealthLocation(imageBase64, imageMetadata = {}, userPreferences = {}) {
    try {
      // Analyze peacefulness using Qwen VL
      const peacefulnessAnalysis = await this.qwenAnalyzer.analyzePeacefulnessScore(
        imageBase64, 
        imageMetadata
      );

      if (!peacefulnessAnalysis.success) {
        throw new Error('Peacefulness analysis failed');
      }

      const analysis = peacefulnessAnalysis.analysis;
      
      // Generate personalized insights based on user preferences
      const personalizedInsights = this.generatePersonalizedInsights(
        analysis, 
        userPreferences
      );

      // Create comprehensive mental health analysis
      const mentalHealthAnalysis = {
        peacefulnessScore: analysis.peacefulnessScore.overall,
        mentalHealthRating: analysis.mentalHealthRating,
        areaBreakdown: analysis.elements,
        atmosphere: analysis.atmosphere,
        visualDetails: analysis.visualDetails,
        peacefulnessIndicators: analysis.peacefulnessIndicators,
        stressIndicators: analysis.stressIndicators,
        recommendations: {
          activities: analysis.recommendations.activities || [],
          bestTimes: analysis.recommendations.bestTimes || [],
          concerns: analysis.recommendations.concerns || [],
          mentalHealthTips: analysis.recommendations.mentalHealthTips || []
        },
        personalizedInsights,
        analyzedBy: 'Qwen 2.5 VL-32B',
        analysisDate: new Date(),
        imageMetadata
      };

      return {
        success: true,
        locationAnalysis: mentalHealthAnalysis,
        rawAnalysis: peacefulnessAnalysis
      };

    } catch (error) {
      console.error('Error in mental health analysis service:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate personalized insights based on user preferences
   */
  generatePersonalizedInsights(analysis, userPreferences) {
    const insights = {
      suitability: 'neutral',
      personalizedTips: [],
      warnings: [],
      customRecommendations: []
    };

    const score = analysis.peacefulnessScore.overall;
    const elements = analysis.elements;

    // Determine suitability based on score and preferences
    if (score >= 80) {
      insights.suitability = 'high';
    } else if (score >= 60) {
      insights.suitability = 'moderate';
    } else {
      insights.suitability = 'low';
    }

    // Generate personalized tips based on user preferences
    if (userPreferences.anxietyLevel === 'high') {
      if (elements.grayBusy > 20) {
        insights.warnings.push('High traffic areas may increase anxiety levels');
        insights.personalizedTips.push('Consider visiting during off-peak hours');
      }
      if (elements.greenNature < 30) {
        insights.personalizedTips.push('Look for areas with more green spaces for anxiety relief');
      }
    }

    if (userPreferences.prefersNature) {
      if (elements.greenNature >= 40) {
        insights.personalizedTips.push('This location has excellent natural elements for your preferences');
      } else {
        insights.warnings.push('Limited natural elements may not meet your nature preferences');
      }
    }

    if (userPreferences.sensitiveToNoise) {
      if (elements.grayBusy > 15 || elements.yellowRoads > 25) {
        insights.warnings.push('This area may have noise levels that could affect your sensitivity');
        insights.personalizedTips.push('Bring noise-canceling headphones or visit during quieter hours');
      }
    }

    if (userPreferences.needsWater) {
      if (elements.blueWater >= 10) {
        insights.personalizedTips.push('Water features present - great for your water preference');
      } else {
        insights.warnings.push('No significant water features found in this area');
      }
    }

    // Generate custom recommendations
    if (score >= 70) {
      insights.customRecommendations.push('This location is well-suited for meditation and mindfulness activities');
    }
    
    if (elements.greenNature >= 30) {
      insights.customRecommendations.push('Natural elements support stress reduction and mental clarity');
    }

    if (elements.whiteOpen >= 20) {
      insights.customRecommendations.push('Open spaces provide room for movement and breathing exercises');
    }

    return insights;
  }

  /**
   * Batch analyze multiple locations
   */
  async batchAnalyzeLocations(locations, userPreferences = {}) {
    const results = [];
    
    for (const location of locations) {
      try {
        const analysis = await this.analyzeMentalHealthLocation(
          location.imageBase64,
          location.imageMetadata,
          userPreferences
        );
        
        results.push({
          locationId: location.id,
          success: analysis.success,
          analysis: analysis.locationAnalysis,
          error: analysis.error
        });
      } catch (error) {
        results.push({
          locationId: location.id,
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  }

  /**
   * Get analysis statistics for a user
   */
  async getUserAnalysisStats(userId, analysisHistory) {
    if (!analysisHistory || analysisHistory.length === 0) {
      return {
        totalAnalyses: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        preferredEnvironments: [],
        improvementTrend: 'neutral'
      };
    }

    const scores = analysisHistory.map(a => a.analysisResults.peacefulnessScore);
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);

    // Analyze preferred environments
    const environmentStats = {};
    analysisHistory.forEach(analysis => {
      const breakdown = analysis.analysisResults.areaBreakdown;
      Object.keys(breakdown).forEach(key => {
        if (!environmentStats[key]) environmentStats[key] = [];
        environmentStats[key].push(breakdown[key]);
      });
    });

    const preferredEnvironments = Object.entries(environmentStats)
      .map(([key, values]) => ({
        type: key,
        averagePercentage: values.reduce((sum, val) => sum + val, 0) / values.length
      }))
      .sort((a, b) => b.averagePercentage - a.averagePercentage)
      .slice(0, 3);

    // Calculate improvement trend
    const recentScores = scores.slice(-5);
    const olderScores = scores.slice(0, 5);
    const recentAvg = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
    const olderAvg = olderScores.reduce((sum, score) => sum + score, 0) / olderScores.length;
    
    let improvementTrend = 'neutral';
    if (recentAvg > olderAvg + 5) improvementTrend = 'improving';
    else if (recentAvg < olderAvg - 5) improvementTrend = 'declining';

    return {
      totalAnalyses: analysisHistory.length,
      averageScore: Math.round(averageScore),
      highestScore,
      lowestScore,
      preferredEnvironments,
      improvementTrend
    };
  }
}

export default new MentalHealthAnalysisService();
