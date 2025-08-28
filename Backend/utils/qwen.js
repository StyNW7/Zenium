class QwenMentalHealthAnalyzer {
  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || "sk-or-1234567890abcdef1234567890abcdef";
    this.baseUrl = "https://openrouter.ai/api/v1/chat/completions";
    this.model = "qwen/qwen2.5-vl-32b-instruct:free";
    this.siteUrl = "http://localhost:3000";
    this.siteName = "Zenium";
  }

  async makeRequest(messages) {
    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "HTTP-Referer": this.siteUrl,
          "X-Title": this.siteName,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          temperature: 0.3, // Lower temperature for more consistent analysis
          max_tokens: 1500
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error("OpenRouter API request failed:", error);
      throw error;
    }
  }

  /**
   * Analyzes map screenshot for peacefulness using Qwen VL model
   * @param {string} imageBase64OrUrl - Base64 string or image URL
   * @param {Object} imageMetadata - Image dimensions and scale information
   * @returns {Promise<Object>} Peacefulness analysis results
   */
  async analyzePeacefulnessScore(imageBase64OrUrl, imageMetadata = {}) {
    try {
      // Convert base64 to data URL if needed
      let imageUrl = imageBase64OrUrl;
      if (imageBase64OrUrl.startsWith('data:image/')) {
        imageUrl = imageBase64OrUrl;
      } else if (!imageBase64OrUrl.startsWith('http')) {
        // Assume it's base64 without data URL prefix
        imageUrl = `data:image/png;base64,${imageBase64OrUrl}`;
      }

      const prompt = `Analyze this map screenshot to determine the peacefulness and mental health suitability of the location.

IMPORTANT: Look at the visual elements in this map image and categorize them:

PEACEFUL ELEMENTS (contribute to calmness):
- Green areas: Parks, forests, gardens, natural vegetation
- Blue areas: Water bodies like rivers, lakes, ponds  
- Light/White areas: Open spaces, plazas, pedestrian areas
- Sparse residential: Low-density housing areas

STRESSFUL ELEMENTS (reduce peacefulness):
- Dark roads: Major highways, busy streets
- Dense buildings: High-density commercial/residential areas
- Industrial areas: Factories, construction sites
- Heavy traffic zones: Multiple intersecting roads

Analyze the image and provide a detailed assessment in this EXACT JSON format:
{
  "green_nature": [percentage of green/natural areas],
  "blue_water": [percentage of water bodies],  
  "white_open": [percentage of open/pedestrian spaces],
  "light_peaceful": [percentage of low-density residential],
  "yellow_roads": [percentage of regular streets],
  "gray_busy": [percentage of busy roads/highways],
  "brown_buildings": [percentage of dense buildings],
  "red_industrial": [percentage of industrial areas],
  "atmosphere": "[brief description of overall feel]",
  "visual_details": "[specific visual elements you notice]",
  "peacefulness_indicators": ["list of peaceful elements"],
  "stress_indicators": ["list of stressful elements"]
}

All percentages should be numbers (not strings) and add up to approximately 100.

Image dimensions: ${imageMetadata.width || 'unknown'}x${imageMetadata.height || 'unknown'} pixels
Map scale: ${imageMetadata.scale || 'unknown'} meters/pixel`;

      const messages = [
        {
          role: "user",
          content: [
            {
              type: "text", 
              text: prompt
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl
              }
            }
          ]
        }
      ];

      const responseText = await this.makeRequest(messages);
      console.log('Qwen VL Raw Response:', responseText);

      // Parse the response
      const analysis = this.parsePeacefulnessResponse(responseText);
      
      // Calculate peacefulness score
      const peacefulnessScore = this.calculatePeacefulnessScore(analysis.elements);
      
      // Generate recommendations
      const recommendations = this.generateMentalHealthRecommendations(analysis.elements, peacefulnessScore);
      
      // Get mental health rating
      const mentalHealthRating = this.getMentalHealthRating(peacefulnessScore.overall);

      return {
        success: true,
        analysis: {
          elements: analysis.elements,
          peacefulnessScore,
          atmosphere: analysis.atmosphere,
          visualDetails: analysis.visualDetails,
          peacefulnessIndicators: analysis.peacefulnessIndicators,
          stressIndicators: analysis.stressIndicators,
          recommendations,
          mentalHealthRating
        },
        rawResponse: responseText,
        imageMetadata
      };

    } catch (error) {
      console.error('Error analyzing location peacefulness with Qwen:', error);
      throw new Error(`Failed to analyze location peacefulness: ${error.message}`);
    }
  }

  /**
   * Parse Qwen VL response to extract analysis data
   */
  parsePeacefulnessResponse(responseText) {
    const defaultElements = {
      greenNature: 0,
      blueWater: 0,
      whiteOpen: 0,
      lightPeaceful: 0,
      yellowRoads: 0,
      grayBusy: 0,
      brownBuildings: 0,
      redIndustrial: 0
    };

    let atmosphere = '';
    let visualDetails = '';
    let peacefulnessIndicators = [];
    let stressIndicators = [];

    try {
      // Try to extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        const elements = {
          greenNature: parsed.green_nature || 0,
          blueWater: parsed.blue_water || 0,
          whiteOpen: parsed.white_open || 0,
          lightPeaceful: parsed.light_peaceful || 0,
          yellowRoads: parsed.yellow_roads || 0,
          grayBusy: parsed.gray_busy || 0,
          brownBuildings: parsed.brown_buildings || 0,
          redIndustrial: parsed.red_industrial || 0
        };

        atmosphere = parsed.atmosphere || '';
        visualDetails = parsed.visual_details || '';
        peacefulnessIndicators = parsed.peacefulness_indicators || [];
        stressIndicators = parsed.stress_indicators || [];

        // Normalize percentages if they don't add up to 100
        const total = Object.values(elements).reduce((sum, val) => sum + val, 0);
        if (total > 0 && Math.abs(total - 100) > 15) {
          const factor = 100 / total;
          Object.keys(elements).forEach(key => {
            elements[key] = Math.round(elements[key] * factor);
          });
          console.log('Normalized percentages:', elements);
        }

        return {
          elements,
          atmosphere,
          visualDetails,
          peacefulnessIndicators,
          stressIndicators
        };
      }
    } catch (parseError) {
      console.error('Failed to parse JSON from Qwen response:', parseError);
    }

    // Fallback: try to extract percentages using regex
    const patterns = {
      greenNature: /green[_\s]*nature.*?(\d+(?:\.\d+)?)/i,
      blueWater: /blue[_\s]*water.*?(\d+(?:\.\d+)?)/i,
      whiteOpen: /white[_\s]*open.*?(\d+(?:\.\d+)?)/i,
      lightPeaceful: /light[_\s]*peaceful.*?(\d+(?:\.\d+)?)/i,
      yellowRoads: /yellow[_\s]*roads.*?(\d+(?:\.\d+)?)/i,
      grayBusy: /gray[_\s]*busy.*?(\d+(?:\.\d+)?)/i,
      brownBuildings: /brown[_\s]*buildings.*?(\d+(?:\.\d+)?)/i,
      redIndustrial: /red[_\s]*industrial.*?(\d+(?:\.\d+)?)/i
    };

    Object.keys(patterns).forEach(key => {
      const match = responseText.match(patterns[key]);
      if (match) {
        defaultElements[key] = parseFloat(match[1]);
      }
    });

    // Extract atmosphere and details from text
    const atmosphereMatch = responseText.match(/atmosphere["\s:]*([^"]+)/i);
    const detailsMatch = responseText.match(/visual[_\s]*details["\s:]*([^"]+)/i);
    
    if (atmosphereMatch) atmosphere = atmosphereMatch[1].trim();
    if (detailsMatch) visualDetails = detailsMatch[1].trim();

    return {
      elements: defaultElements,
      atmosphere: atmosphere || 'Mixed urban environment',
      visualDetails: visualDetails || 'Various urban elements visible',
      peacefulnessIndicators: peacefulnessIndicators,
      stressIndicators: stressIndicators
    };
  }

  /**
   * Calculate peacefulness score based on area elements
   */
  calculatePeacefulnessScore(elements) {
    const weights = {
      greenNature: 25,     // +25 points per %
      blueWater: 20,       // +20 points per %
      whiteOpen: 15,       // +15 points per %
      lightPeaceful: 10,   // +10 points per %
      yellowRoads: -10,    // -10 points per %
      grayBusy: -20,       // -20 points per %
      brownBuildings: -15, // -15 points per %
      redIndustrial: -25   // -25 points per %
    };

    let totalScore = 0;
    const breakdown = {};

    Object.keys(elements).forEach(key => {
      const contribution = elements[key] * weights[key];
      breakdown[key] = {
        percentage: elements[key],
        weight: weights[key],
        contribution: contribution
      };
      totalScore += contribution;
    });

    // Normalize score to 0-100 range
    const normalizedScore = Math.max(0, Math.min(100, ((totalScore + 2500) / 5000) * 100));

    return {
      overall: Math.round(normalizedScore),
      breakdown,
      rawScore: totalScore,
      maxPossible: 2500,
      minPossible: -2500
    };
  }

  /**
   * Get mental health rating based on peacefulness score
   */
  getMentalHealthRating(score) {
    if (score >= 80) {
      return {
        level: 'EXCELLENT',
        color: '#22c55e',
        description: 'Sangat ideal untuk relaksasi dan menenangkan pikiran',
        emoji: '🌿✨',
        recommendation: 'Perfect untuk meditation, mindfulness, dan self-care activities'
      };
    } else if (score >= 65) {
      return {
        level: 'GOOD',
        color: '#84cc16',
        description: 'Baik untuk mengurangi stress dan meningkatkan mood',
        emoji: '🌱😌',
        recommendation: 'Cocok untuk jalan santai, reading, dan light exercise'
      };
    } else if (score >= 50) {
      return {
        level: 'MODERATE',
        color: '#eab308',
        description: 'Cukup netral, bisa membantu tapi tidak optimal',
        emoji: '⚖️🙂',
        recommendation: 'Okay untuk casual activities, hindari saat stress tinggi'
      };
    } else if (score >= 35) {
      return {
        level: 'POOR',
        color: '#f97316',
        description: 'Kurang cocok untuk relaksasi, mungkin menambah stress',
        emoji: '😰🏙️',
        recommendation: 'Lebih baik cari lokasi yang lebih tenang'
      };
    } else {
      return {
        level: 'VERY_POOR',
        color: '#ef4444',
        description: 'Tidak disarankan untuk mental health, sangat ramai/stressful',
        emoji: '😫🚫',
        recommendation: 'Hindari untuk recovery, cari alternatif yang lebih peaceful'
      };
    }
  }

  /**
   * Generate mental health recommendations based on analysis
   */
  generateMentalHealthRecommendations(elements, peacefulnessScore) {
    const recommendations = {
      activities: [],
      bestTimes: [],
      concerns: [],
      alternatives: [],
      mentalHealthTips: []
    };

    const score = peacefulnessScore.overall;

    // Activity recommendations
    if (elements.greenNature > 20) {
      recommendations.activities.push(
        'Forest bathing atau shinrin-yoku di area hijau',
        'Grounding exercises dengan berjalan barefoot di rumput',
        'Nature meditation dengan fokus pada suara alam'
      );
      recommendations.mentalHealthTips.push('Green spaces terbukti menurunkan cortisol dan meningkatkan serotonin');
    }
    
    if (elements.blueWater > 10) {
      recommendations.activities.push(
        'Water meditation - duduk dekat air untuk efek menenangkan',
        'Blue mind therapy - mengamati pergerakan air',
        'Breathing exercises dengan ritme suara air'
      );
      recommendations.mentalHealthTips.push('Suara air dapat mengaktifkan parasympathetic nervous system');
    }
    
    if (elements.whiteOpen > 15) {
      recommendations.activities.push(
        'Tai chi atau gentle yoga di area terbuka',
        'Progressive muscle relaxation',
        'Mindful walking meditation'
      );
    }

    // Time recommendations
    if (elements.yellowRoads > 30 || elements.grayBusy > 20) {
      recommendations.bestTimes.push(
        'Golden hour (sunrise 6-7 AM) untuk natural mood booster',
        'Late evening (8-9 PM) saat traffic berkurang',
        'Weekend pagi untuk suasana lebih tenang'
      );
    } else {
      recommendations.bestTimes.push(
        'Midday sun exposure (11-1 PM) untuk vitamin D dan mood',
        'Afternoon break (3-4 PM) untuk energy reset'
      );
    }

    // Mental health concerns
    if (elements.grayBusy > 25) {
      recommendations.concerns.push('Noise pollution dapat meningkatkan stress hormones');
      recommendations.mentalHealthTips.push('Gunakan noise-canceling headphones atau earplugs jika perlu');
    }
    
    if (elements.brownBuildings > 40) {
      recommendations.concerns.push('Urban density bisa memicu claustrophobia atau anxiety');
      recommendations.mentalHealthTips.push('Practice grounding techniques: 5-4-3-2-1 sensory method');
    }
    
    if (elements.redIndustrial > 15) {
      recommendations.concerns.push('Industrial areas dapat mengganggu ketenangan mental');
      recommendations.mentalHealthTips.push('Limit exposure time dan focus pada breath awareness');
    }

    // Alternative suggestions
    if (score < 50) {
      recommendations.alternatives.push(
        'Cari taman kota dengan minimal 30% green space',
        'Lokasi waterfront atau riverside untuk calming effect',
        'Residential area dengan tree-lined streets',
        'Rooftop gardens atau sky gardens di building'
      );
    }

    // Specific mental health tips based on score
    if (score >= 70) {
      recommendations.mentalHealthTips.push(
        'Location ini ideal untuk daily mental health routine',
        'Buat ritual harian: 10 menit morning meditation di sini'
      );
    } else if (score >= 50) {
      recommendations.mentalHealthTips.push(
        'Kombinasikan dengan calming music atau nature sounds',
        'Focus pada positive elements yang ada'
      );
    } else {
      recommendations.mentalHealthTips.push(
        'Limit time spent here jika sedang feeling overwhelmed',
        'Gunakan sebagai challenge untuk practicing mindfulness in difficult environments'
      );
    }

    return recommendations;
  }

  /**
   * Analyze location with user preferences for personalized insights
   */
  async analyzeMentalHealthLocation(imageBase64OrUrl, imageMetadata = {}, userPreferences = {}) {
    try {
      // Get basic peacefulness analysis
      const basicAnalysis = await this.analyzePeacefulnessScore(imageBase64OrUrl, imageMetadata);
      
      if (!basicAnalysis.success) {
        throw new Error('Failed to get basic peacefulness analysis');
      }

      // Calculate location area
      const locationArea = this.calculateLocationArea(imageMetadata);
      
      // Generate personalized insights
      const personalizedInsights = this.generatePersonalizedInsights(
        basicAnalysis.analysis, 
        userPreferences
      );

      return {
        success: true,
        locationAnalysis: {
          peacefulnessScore: basicAnalysis.analysis.peacefulnessScore.overall,
          mentalHealthRating: basicAnalysis.analysis.mentalHealthRating,
          atmosphere: basicAnalysis.analysis.atmosphere,
          visualDetails: basicAnalysis.analysis.visualDetails,
          areaBreakdown: basicAnalysis.analysis.elements,
          scoreBreakdown: basicAnalysis.analysis.peacefulnessScore.breakdown,
          recommendations: basicAnalysis.analysis.recommendations,
          personalizedInsights,
          locationArea,
          peacefulnessIndicators: basicAnalysis.analysis.peacefulnessIndicators,
          stressIndicators: basicAnalysis.analysis.stressIndicators
        },
        metadata: {
          analysisDate: new Date().toISOString(),
          imageMetadata,
          userPreferences,
          analyzedBy: 'Qwen 2.5 VL-32B'
        }
      };

    } catch (error) {
      console.error('Error in Qwen mental health location analysis:', error);
      throw new Error(`Mental health analysis failed: ${error.message}`);
    }
  }

  /**
   * Calculate location area from screenshot metadata
   */
  calculateLocationArea(imageMetadata) {
    const { width, height, scale } = imageMetadata;
    
    if (!scale || scale <= 0) {
      return {
        error: 'Invalid scale data',
        estimatedSize: 'Unknown area size'
      };
    }

    const metersPerPixel = scale * 1.305; // Apply error adjustment
    const widthMeters = width * metersPerPixel;
    const heightMeters = height * metersPerPixel;
    const areaSqM = widthMeters * heightMeters;
    const areaSqKm = areaSqM / 1000000;

    return {
      dimensions: {
        widthMeters: Math.round(widthMeters),
        heightMeters: Math.round(heightMeters),
        areaSqM: Math.round(areaSqM),
        areaSqKm: parseFloat(areaSqKm.toFixed(6))
      },
      estimatedSize: this.getAreaDescription(areaSqKm)
    };
  }

  /**
   * Get human-readable description of area size
   */
  getAreaDescription(areaSqKm) {
    if (areaSqKm < 0.01) return 'Area kecil (seperti taman lingkungan)';
    if (areaSqKm < 0.1) return 'Area sedang (seperti kompleks perumahan)';
    if (areaSqKm < 1) return 'Area besar (seperti kawasan kecamatan)';
    return 'Area sangat besar (seperti kawasan kota)';
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
    
    // Mental health condition specific recommendations
    if (userPreferences.anxietyLevel === 'high') {
      if (score < 60) {
        insights.warnings.push('Lokasi ini mungkin terlalu stimulating untuk anxiety level tinggi');
        insights.customRecommendations.push('Cari lokasi dengan peacefulness score > 70');
      } else {
        insights.personalizedTips.push('Lokasi ini cukup supportive untuk anxiety management');
      }
    }

    if (userPreferences.depressionLevel === 'moderate' || userPreferences.depressionLevel === 'high') {
      if (analysis.elements.greenNature > 15) {
        insights.personalizedTips.push('Green elements di sini dapat membantu mood improvement');
      }
      if (analysis.elements.blueWater > 5) {
        insights.personalizedTips.push('Water elements dapat membantu dengan emotional regulation');
      }
    }

    // Preference-based recommendations
    if (userPreferences.prefersNature && analysis.elements.greenNature > 15) {
      insights.suitability = 'high';
      insights.personalizedTips.push('Lokasi ini perfect untuk nature-loving personality Anda');
    }
    
    if (userPreferences.sensitiveToNoise && analysis.elements.grayBusy > 20) {
      insights.suitability = 'low';
      insights.warnings.push('Tingkat kebisingan mungkin terlalu tinggi untuk sensitivitas Anda');
      insights.customRecommendations.push('Visit saat off-peak hours atau gunakan noise protection');
    }
    
    if (userPreferences.needsWater && analysis.elements.blueWater > 5) {
      insights.personalizedTips.push('Water elements di sini sesuai dengan preferensi therapeutic Anda');
    }

    // Activity preferences
    if (userPreferences.preferredActivities) {
      if (userPreferences.preferredActivities.includes('meditation') && score > 60) {
        insights.customRecommendations.push('Ideal untuk meditation practice yang Anda sukai');
      }
      if (userPreferences.preferredActivities.includes('walking') && analysis.elements.whiteOpen > 10) {
        insights.customRecommendations.push('Good walking paths available sesuai preferensi Anda');
      }
    }

    return insights;
  }

  // Legacy methods for compatibility with existing QwenService
  async generateDailyQuote() {
    try {
      const messages = [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Generate an inspirational daily quote for mental wellness and motivation. The quote should be uplifting, positive, and encouraging. Include:
              1. The quote itself (1-2 sentences)
              2. A brief explanation or context (1 sentence)
              3. An author name if applicable
              
              Format the response as JSON: {"quote": "string", "explanation": "string", "author": "string"}`
            }
          ]
        }
      ];

      const responseText = await this.makeRequest(messages);
      
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            quote: parsed.quote || responseText.trim(),
            explanation: parsed.explanation || "Daily inspiration for your mental wellness journey",
            author: parsed.author || "AI Companion"
          };
        }
      } catch (parseError) {
        console.error("Failed to parse JSON from Qwen response:", parseError);
      }

      return {
        quote: responseText.trim(),
        explanation: "Daily inspiration for your mental wellness journey",
        author: "Qwen AI"
      };
    } catch (error) {
      console.error("Qwen API error:", error);
      
      const fallbackQuotes = [
        {
          quote: "The greatest glory in living lies not in never falling, but in rising every time we fall.",
          explanation: "Remember that setbacks are opportunities for growth",
          author: "Nelson Mandela"
        },
        {
          quote: "Mental health is not a destination, but a process. It's about how you drive, not where you're going.",
          explanation: "Focus on the journey of self-care and growth",
          author: "Noam Shpancer"
        }
      ];
      
      return fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
    }
  }

  async analyzeJournalSentiment(content) {
    try {
      const messages = [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze the following journal entry for sentiment and provide insights. Return JSON with:
              - sentiment: "positive", "negative", or "neutral"
              - keywords: array of 3-5 key emotional words
              - recommendations: array of 2-3 actionable suggestions for mental wellbeing
              
              Journal content: "${content.substring(0, 500)}"
              
              Format response as JSON: {"sentiment": "string", "keywords": ["array"], "recommendations": ["array"]}`
            }
          ]
        }
      ];

      const responseText = await this.makeRequest(messages);
      
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            sentiment: parsed.sentiment || "neutral",
            keywords: parsed.keywords || ["reflection", "experience", "emotion"],
            recommendations: parsed.recommendations || ["Consider practicing mindfulness", "Take time for self-care activities"]
          };
        }
      } catch (parseError) {
        console.error("Failed to parse sentiment analysis JSON:", parseError);
      }

      return {
        sentiment: "neutral",
        keywords: ["reflection", "experience", "emotion"],
        recommendations: ["Consider practicing mindfulness", "Take time for self-care activities"]
      };
    } catch (error) {
      console.error("Qwen sentiment analysis error:", error);
      return {
        sentiment: "neutral",
        keywords: ["general", "thoughts"],
        recommendations: ["Take time for self-reflection", "Practice mindfulness exercises"]
      };
    }
  }
}

export default new QwenMentalHealthAnalyzer();