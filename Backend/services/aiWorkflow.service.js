import QwenService from "../utils/qwen.js";
import DailyQuote from "../models/dailyQuote.model.js";
import Recommendation from "../models/recommendation.model.js";
import Journal from "../models/journal.model.js";

class AIWorkflowService {
  constructor() {
    this.qwenService = QwenService;
  }

  // Main workflow: Analyze journal → Generate quote → Create recommendations
  async processJournalWorkflow(journalId, userId) {
    try {
      console.log(`🚀 Starting AI workflow for journal ${journalId}`);
      
      // Step 1: Get journal data
      const journal = await Journal.findOne({ _id: journalId, userId });
      if (!journal) {
        throw new Error('Journal not found');
      }

      // Step 2: Analyze journal content
      const analysis = await this.analyzeJournalContent(journal.content, journal.mood, journal.moodRating);
      
      // Step 3: Generate personalized quote
      const quote = await this.generatePersonalizedQuote(journal.content, analysis, journal.mood);
      
      // Step 4: Create AI recommendations
      const recommendations = await this.generateRecommendations(journal.content, analysis, journal.mood, journal.moodRating);
      
      // Step 5: Update journal with analysis
      await this.updateJournalWithAnalysis(journalId, analysis);
      
      // Step 6: Save quote
      const savedQuote = await this.saveQuote(quote, userId, journalId);
      
      // Step 7: Save recommendations
      const savedRecommendations = await this.saveRecommendations(recommendations, userId, journalId, analysis);
      
      console.log(`✅ AI workflow completed for journal ${journalId}`);
      
      return {
        success: true,
        data: {
          journal: { id: journalId, analyzed: true, aiInsights: analysis },
          quote: savedQuote,
          recommendations: savedRecommendations,
          workflow: 'completed'
        }
      };
      
    } catch (error) {
      console.error(`❌ AI workflow failed for journal ${journalId}:`, error);
      throw error;
    }
  }

  // Analyze journal content using AI
  async analyzeJournalContent(content, mood, moodRating) {
    try {
      const ai = await this.qwenService.analyzeJournalSentiment(content);
      
      // Enhanced analysis with mood context
      const enhancedAnalysis = await this.enhanceAnalysisWithMood(ai, mood, moodRating);
      
      return enhancedAnalysis;
    } catch (error) {
      console.error('Error in journal analysis:', error);
      return this.getFallbackAnalysis(mood, moodRating);
    }
  }

  // Enhance analysis with mood context
  async enhanceAnalysisWithMood(aiAnalysis, mood, moodRating) {
    try {
      const moodContext = `User's current mood: ${mood}, rating: ${moodRating}/10. `;
      const enhancedPrompt = `${moodContext}Based on this mood context and the previous analysis, provide enhanced insights. Return JSON with: {"sentiment": "string", "keywords": ["array"], "recommendations": ["array"], "summary": "string", "moodInsights": "string"}`;
      
      const enhancedResponse = await this.qwenService.makeRequest([{
        role: 'user',
        content: [{ type: 'text', text: enhancedPrompt }]
      }]);

      let enhancedData = {};
      try {
        const jsonMatch = enhancedResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) enhancedData = JSON.parse(jsonMatch[0]);
      } catch {}

      return {
        sentiment: enhancedData.sentiment || aiAnalysis.sentiment,
        keywords: enhancedData.keywords || aiAnalysis.keywords,
        recommendations: enhancedData.recommendations || aiAnalysis.recommendations,
        summary: enhancedData.summary || aiAnalysis.summary,
        moodInsights: enhancedData.moodInsights || `Current mood: ${mood} (${moodRating}/10)`,
        riskScore: this.calculateRiskScore(enhancedData.sentiment || aiAnalysis.sentiment, moodRating, enhancedData.keywords || aiAnalysis.keywords)
      };
    } catch (error) {
      console.error('Error enhancing analysis:', error);
      return {
        ...aiAnalysis,
        moodInsights: `Current mood: ${mood} (${moodRating}/10)`,
        riskScore: this.calculateRiskScore(aiAnalysis.sentiment, moodRating, aiAnalysis.keywords)
      };
    }
  }

  // Calculate risk score based on analysis
  calculateRiskScore(sentiment, moodRating, keywords) {
    let riskScore = 0.3; // baseline
    
    if (sentiment === 'negative') riskScore += 0.3;
    riskScore += Math.max(0, (7 - Number(moodRating)) / 10);
    
    const negativeSignals = (keywords || []).filter(k => 
      /sad|hopeless|anxious|stress|tired|alone|fear|harm|suicide|self-harm|depressed|lonely/i.test(k)
    ).length;
    
    riskScore += Math.min(0.4, negativeSignals * 0.1);
    return Math.min(1, Math.max(0, Number(riskScore.toFixed(2))));
  }

  // Generate personalized quote based on journal content
  async generatePersonalizedQuote(content, analysis, mood) {
    try {
      const quotePrompt = `You are a compassionate AI coach. Create a motivational quote (1-2 sentences) that is:
      1. Personalized to this journal content: "${content.substring(0, 500)}"
      2. Appropriate for someone feeling ${mood}
      3. Empathetic and supportive
      4. Actionable and encouraging
      
      Return JSON: {"quote": "string", "explanation": "string", "author": "Qwen Coach", "category": "personalized"}`;

      const response = await this.qwenService.makeRequest([{
        role: 'user',
        content: [{ type: 'text', text: quotePrompt }]
      }]);

      let quoteData = {};
      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) quoteData = JSON.parse(jsonMatch[0]);
      } catch {}

      if (!quoteData.quote) {
        // Fallback to general quote
        const fallback = await this.qwenService.generateDailyQuote();
        quoteData = {
          quote: fallback.quote,
          explanation: fallback.explanation,
          author: fallback.author,
          category: 'fallback'
        };
      }

      return {
        quote: quoteData.quote,
        explanation: quoteData.explanation || 'Personalized motivation based on your journaling',
        author: quoteData.author || 'Qwen Coach',
        category: quoteData.category || 'personalized',
        moodContext: mood,
        activityContext: 'journaling'
      };
    } catch (error) {
      console.error('Error generating personalized quote:', error);
      return await this.qwenService.generateDailyQuote();
    }
  }

  // Generate AI recommendations based on journal analysis
  async generateRecommendations(content, analysis, mood, moodRating) {
    try {
      const recommendationPrompt = `Based on this journal analysis, generate 3-5 personalized recommendations:
      
      Journal Content: "${content.substring(0, 800)}"
      Sentiment: ${analysis.sentiment}
      Mood: ${mood} (${moodRating}/10)
      Keywords: ${(analysis.keywords || []).join(', ')}
      
      Generate recommendations that are:
      1. Specific and actionable
      2. Appropriate for the current mood and sentiment
      3. Varied in type (activity, mindfulness, social, etc.)
      4. Realistic and achievable
      
      Return JSON array: [{"type": "string", "title": "string", "description": "string", "priority": "string", "estimatedTime": number, "tags": ["array"]}]`;

      const response = await this.qwenService.makeRequest([{
        role: 'user',
        content: [{ type: 'text', text: recommendationPrompt }]
      }]);

      let recommendations = [];
      try {
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) recommendations = JSON.parse(jsonMatch[0]);
      } catch {}

      if (!Array.isArray(recommendations) || recommendations.length === 0) {
        recommendations = this.getFallbackRecommendations(mood, moodRating);
      }

      return recommendations.map(rec => ({
        ...rec,
        type: rec.type || 'general',
        priority: rec.priority || 'medium',
        estimatedTime: rec.estimatedTime || 30,
        tags: rec.tags || [],
        actionable: true,
        category: 'short_term'
      }));
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return this.getFallbackRecommendations(mood, moodRating);
    }
  }

  // Get fallback recommendations when AI fails
  getFallbackRecommendations(mood, moodRating) {
    const baseRecommendations = [
      {
        type: 'mindfulness',
        title: 'Practice Deep Breathing',
        description: 'Take 5 deep breaths, focusing on your breath to center yourself',
        priority: 'medium',
        estimatedTime: 5,
        tags: ['mindfulness', 'breathing', 'calm']
      },
      {
        type: 'activity',
        title: 'Go for a Short Walk',
        description: 'Take a 10-minute walk outside to clear your mind and get fresh air',
        priority: 'medium',
        estimatedTime: 10,
        tags: ['exercise', 'outdoor', 'fresh-air']
      },
      {
        type: 'social',
        title: 'Reach Out to a Friend',
        description: 'Send a message to someone you trust and share how you\'re feeling',
        priority: 'high',
        estimatedTime: 15,
        tags: ['social', 'support', 'connection']
      }
    ];

    // Adjust based on mood
    if (mood === 'sad' || mood === 'anxious') {
      baseRecommendations.unshift({
        type: 'mindfulness',
        title: 'Self-Compassion Practice',
        description: 'Place your hand on your heart and say kind words to yourself',
        priority: 'high',
        estimatedTime: 3,
        tags: ['self-compassion', 'kindness', 'emotional-support']
      });
    }

    return baseRecommendations;
  }

  // Get fallback analysis when AI fails
  getFallbackAnalysis(mood, moodRating) {
    return {
      sentiment: moodRating >= 7 ? 'positive' : moodRating <= 4 ? 'negative' : 'neutral',
      keywords: [mood, 'reflection', 'experience'],
      recommendations: ['Take time for self-care', 'Practice mindfulness', 'Consider talking to someone'],
      summary: `You're currently feeling ${mood} with a rating of ${moodRating}/10. Remember to be kind to yourself.`,
      riskScore: this.calculateRiskScore(
        moodRating >= 7 ? 'positive' : moodRating <= 4 ? 'negative' : 'neutral',
        moodRating,
        [mood]
      )
    };
  }

  // Update journal with AI analysis
  async updateJournalWithAnalysis(journalId, analysis) {
    try {
      const classification = analysis.riskScore >= 0.75 ? 'high_risk' : 
                           analysis.riskScore >= 0.45 ? 'needs_attention' : 'safe';

      await Journal.findByIdAndUpdate(journalId, {
        aiInsights: {
          sentiment: analysis.sentiment,
          keywords: analysis.keywords,
          recommendations: analysis.recommendations,
          summary: analysis.summary
        },
        isAIAnalyzed: true,
        mentalHealthClassification: classification,
        riskScore: analysis.riskScore
      });

      console.log(`✅ Journal ${journalId} updated with AI analysis`);
    } catch (error) {
      console.error('Error updating journal with analysis:', error);
      throw error;
    }
  }

  // Save generated quote
  async saveQuote(quoteData, userId, journalId) {
    try {
      const quote = new DailyQuote({
        userId,
        quote: quoteData.quote,
        explanation: quoteData.explanation,
        author: quoteData.author,
        category: quoteData.category,
        isAiGenerated: true,
        generatedAt: new Date(),
        moodContext: quoteData.moodContext,
        activityContext: quoteData.activityContext
      });

      const savedQuote = await quote.save();
      console.log(`✅ Quote saved: ${savedQuote._id}`);
      return savedQuote;
    } catch (error) {
      console.error('Error saving quote:', error);
      throw error;
    }
  }

  // Save AI recommendations
  async saveRecommendations(recommendations, userId, journalId, analysis) {
    try {
      const recommendationDocs = recommendations.map(rec => ({
        userId,
        journalId,
        type: rec.type,
        title: rec.title,
        description: rec.description,
        priority: rec.priority,
        category: rec.category,
        actionable: rec.actionable,
        estimatedTime: rec.estimatedTime,
        tags: rec.tags,
        aiGenerated: true,
        context: {
          mood: analysis.moodInsights?.split(':')[1]?.trim() || 'unknown',
          sentiment: analysis.sentiment,
          keywords: analysis.keywords,
          riskScore: analysis.riskScore
        }
      }));

      const savedRecommendations = await Recommendation.insertMany(recommendationDocs);
      console.log(`✅ ${savedRecommendations.length} recommendations saved`);
      return savedRecommendations;
    } catch (error) {
      console.error('Error saving recommendations:', error);
      throw error;
    }
  }

  // Get user's recommendations
  async getUserRecommendations(userId, options = {}) {
    try {
      const { type, priority, completed, limit = 10, page = 1 } = options;
      const skip = (page - 1) * limit;

      let query = { userId };
      if (type) query.type = type;
      if (priority) query.priority = priority;
      if (completed !== undefined) query.isCompleted = completed;

      const recommendations = await Recommendation.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('journalId', 'title content mood');

      const total = await Recommendation.countDocuments(query);

      return {
        success: true,
        data: recommendations,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting user recommendations:', error);
      throw error;
    }
  }

  // Mark recommendation as completed
  async markRecommendationCompleted(recommendationId, userId, feedback = {}) {
    try {
      const update = {
        isCompleted: true,
        completedAt: new Date(),
        userFeedback: feedback
      };

      const recommendation = await Recommendation.findOneAndUpdate(
        { _id: recommendationId, userId },
        update,
        { new: true }
      );

      if (!recommendation) {
        throw new Error('Recommendation not found');
      }

      console.log(`✅ Recommendation ${recommendationId} marked as completed`);
      return recommendation;
    } catch (error) {
      console.error('Error marking recommendation completed:', error);
      throw error;
    }
  }
}

export default new AIWorkflowService();
