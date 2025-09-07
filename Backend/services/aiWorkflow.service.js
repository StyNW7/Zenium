import QwenService from "../utils/qwen.js";
import DailyQuote from "../models/dailyQuote.model.js";
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

  // Generate personalized quote based on mock data (no Qwen)
  async generatePersonalizedQuote(content, analysis, mood) {
    try {
      // Import and use DailyQuoteService to get mock data quotes
      const dailyQuoteService = (await import('../services/dailyQuoteService.js')).default;

      // Get all available quotes
      const allQuotes = dailyQuoteService.allQuotes || [];

      if (!allQuotes.length) {
        // Fallback: return a basic quote if no mock data is available
        return {
          quote: "Take one step at a time towards your goals.",
          explanation: "Every journey begins with a single step. Progress happens gradually.",
          author: "Ancient Wisdom",
          category: 'personalized',
          moodContext: mood,
          activityContext: 'journaling'
        };
      }

      // Select a quote based on mood and analysis
      let selectedQuote;

      // Priority 1: Try to match by category based on mood
      const moodCategoryMap = {
        'sad': ['motivation', 'positivity', 'gratitude', 'resilience'],
        'happy': ['gratitude', 'positivity', 'mindfulness'],
        'anxious': ['mindfulness', 'peace', 'calm'],
        'angry': ['positivity', 'mindfulness', 'resilience'],
        'stressed': ['mindfulness', 'peace', 'productivity'],
        'excited': ['positivity', 'dreams'],
        'neutral': ['mindfulness', 'motivation'],
        'tired': ['rest', 'balance'],
        'confused': ['wisdom', 'leadership']
      };

      const relevantCategories = moodCategoryMap[mood] || ['motivation', 'positivity'];

      // Filter quotes by relevant categories
      let categoryQuotes = allQuotes.filter(quote =>
        relevantCategories.some(cat => quote.category.toLowerCase().includes(cat))
      );

      // If no category match, use all quotes
      if (categoryQuotes.length === 0) {
        categoryQuotes = allQuotes;
      }

      // Select a random quote from the filtered list
      const randomIndex = Math.floor(Math.random() * categoryQuotes.length);
      selectedQuote = categoryQuotes[randomIndex];

      // Create personalized explanation based on the user's mood
      const personalizedExpl = this.createPersonalizedExplanation(selectedQuote, mood, analysis);

      return {
        quote: selectedQuote.quote,
        explanation: personalizedExpl,
        author: selectedQuote.author,
        category: selectedQuote.category,
        isAiGenerated: false, // Mark as non-AI since it's from mock data
        moodContext: mood,
        activityContext: 'journaling'
      };
    } catch (error) {
      console.error('Error generating personalized quote from mock data:', error);

      // Fallback quote
      return {
        quote: "Every step forward is a victory worth celebrating.",
        explanation: "Each small action contributes to your growth. Be kind to yourself in this process.",
        author: "Mock Wisdom",
        category: 'fallback',
        isAiGenerated: false,
        moodContext: mood,
        activityContext: 'journaling'
      };
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

  // Create personalized explanation based on mood and context
  createPersonalizedExplanation(selectedQuote, mood, analysis) {
    try {
      // Base personalized explanations for different moods
      const moodExplanations = {
        'sad': [
          'Remember that every challenge is temporary and your strength lies within.',
          'Your feelings are valid, and healing begins with gentle self-compassion.',
          'Like a storm that eventually clears, difficult emotions also pass with time.',
          'You are not alone in this emotional journey—reach out when you need support.'
        ],
        'anxious': [
          'Peace comes from grounding yourself in the present moment.',
          'Breathe through the uncertainty—your inner strength will guide you.',
          'Trust that you have faced challenging moments before and emerged stronger.',
          'Take one small, manageable step at a time towards calm.'
        ],
        'happy': [
          'Cherish these moments of joy—they are worth savoring and celebrating.',
          'Happiness grows when shared with others who care about you.',
          'Use this positive energy as a foundation for continued growth.',
          'Celebrate your achievements and the progress you\'ve made.'
        ],
        'angry': [
          'Channel intense emotions into constructive actions that serve your well-being.',
          'Take space to process and understand your feelings before taking action.',
          'Your strength comes from responding thoughtfully rather than reacting impulsively.',
          'Healthy outlets for frustration can help you regain clarity and peace.'
        ],
        'stressed': [
          'Your well-being matters—give yourself permission to pause and breathe.',
          'Break down overwhelming tasks into smaller, manageable steps.',
          'Remember that it\'s okay to ask for help when the load feels too heavy.',
          'Prioritize what truly matters and let go of what you cannot control.'
        ],
        'tired': [
          'Rest is not a luxury—it\'s essential for maintaining your strength and resilience.',
          'Be gentle with yourself during times of physical or emotional fatigue.',
          'Restorative practices help you recharge and face challenges with renewed energy.',
          'Small moments of self-care add up to profound benefits for your well-being.'
        ],
        'neutral': [
          'Every day offers opportunities for growth and positive change.',
          'Use this balanced state as a foundation for meaningful progress.',
          'Acknowledge your ability to navigate various emotions with grace.',
          'Continue building habits that support your overall well-being.'
        ],
        'default': [
          'Every moment is an opportunity for growth and learning.',
          'Trust in your ability to navigate life\'s challenges with strength.',
          'Your experiences are shaping you into who you are meant to be.',
          'Approach each day with curiosity and openness to what it brings.'
        ]
      };

      // Get explanations for the mood or use default
      const explanations = moodExplanations[mood] || moodExplanations['default'];
      const randomExplanation = explanations[Math.floor(Math.random() * explanations.length)];

      // Combine the original explanation with personalized context
      return `${selectedQuote.explanation} ${randomExplanation}`;
    } catch (error) {
      console.error('Error creating personalized explanation:', error);
      return `${selectedQuote.explanation} Remember that growth happens gradually, and every step forward matters.`;
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
        isAiGenerated: false, // Changed to false since we're using mock data
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

  // Save AI recommendations - Select from MentalHealthRecommendation based on analysis
  async saveRecommendations(recommendations, userId, journalId, analysis) {
    try {
      // Get mood-based category mapping
      const categoryMapping = {
        'sad': ['depression', 'loneliness'],
        'happy': ['gratitude'],
        'anxious': ['anxiety'],
        'angry': ['anger'],
        'stressed': ['stress'],
        'tired': ['sleep'],
        'neutral': ['general', 'mindfulness'],
        'excited': ['general']
      };

      // Get relevant categories based on current mood
      const moodFromAnalysis = analysis.moodInsights?.split(':')[1]?.trim() || 'neutral';
      const relevantCategories = categoryMapping[moodFromAnalysis] || ['general'];

      // Find suitable recommendations from the database
      const availableRecommendations = await MentalHealthRecommendation.find({
        category: { $in: relevantCategories },
        isActive: true
      }).limit(5);

      console.log(`✅ Found ${availableRecommendations.length} suitable recommendations from database`);
      return availableRecommendations;
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      throw error;
    }
  }

  // Get mental health recommendations based on criteria
  async getMentalHealthRecommendations(options = {}) {
    try {
      const { type, category, difficulty, limit = 10, page = 1 } = options;
      const skip = (page - 1) * limit;

      let query = { isActive: true };
      if (type) query.type = type;
      if (category) query.category = category;
      if (difficulty) query.difficulty = difficulty;

      const recommendations = await MentalHealthRecommendation.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await MentalHealthRecommendation.countDocuments(query);

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
      console.error('Error getting mental health recommendations:', error);
      throw error;
    }
  }

  // Get recommendations based on user mood and needs
  async getPersonalizedRecommendations(mood, sentiment, options = {}) {
    try {
      const categoryMapping = {
        'sad': ['depression', 'loneliness'],
        'happy': ['gratitude'],
        'anxious': ['anxiety'],
        'angry': ['anger'],
        'stressed': ['stress'],
        'tired': ['sleep'],
        'neutral': ['general', 'mindfulness'],
        'excited': ['general']
      };

      const relevantCategories = categoryMapping[mood] || ['general'];

      const recommendations = await MentalHealthRecommendation.find({
        category: { $in: relevantCategories },
        isActive: true
      }).limit(options.limit || 5);

      return {
        success: true,
        data: recommendations,
        mood,
        categories: relevantCategories
      };
    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      throw error;
    }
  }
}

export default new AIWorkflowService();
