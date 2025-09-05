import Journal from "../models/journal.model.js";
import QwenService from "../utils/qwen.js";
import DailyQuote from "../models/dailyQuote.model.js";
import AIWorkflowService from "../services/aiWorkflow.service.js";
import MentalHealthRecommendation from "../models/mentalHealthRecommendation.model.js";

export const getUserJournals = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { sortBy = "createdAt", sortOrder = "desc", limit = 10, page = 1 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortDirection = sortOrder === "desc" ? -1 : 1;
    
    const journals = await Journal.find({ userId })
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Journal.countDocuments({ userId });
    
    res.status(200).json({
      success: true,
      data: journals,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Error fetching journals:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get a specific journal entry
export const getJournalById = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const journalId = req.params.id;
    
    const journal = await Journal.findOne({ _id: journalId, userId });
    
    if (!journal) {
      return res.status(404).json({ success: false, message: "Journal not found" });
    }
    
    res.status(200).json({ success: true, data: journal });
  } catch (error) {
    console.error("Error fetching journal:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Create a new journal entry (supports Smart Journaling fields)
export const createJournal = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { title, content, mood, moodRating, location, privacy, guidedQuestions, voiceTranscript } = req.body;

    const newJournal = new Journal({
      userId,
      title,
      content,
      mood,
      moodRating,
      location,
      privacy,
      guidedQuestions: Array.isArray(guidedQuestions) ? guidedQuestions : [],
      voiceTranscript: voiceTranscript || ""
    });

    const savedJournal = await newJournal.save();

    // Removed auto-triggering of AI workflow - users can now manually generate quotes from the quote page

    res.status(201).json({ success: true, data: savedJournal });
  } catch (error) {
    console.error("Error creating journal:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update a journal entry (Smart Journaling fields included)
export const updateJournal = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const journalId = req.params.id;
    const { title, content, mood, moodRating, location, privacy, guidedQuestions, voiceTranscript } = req.body;

    const journal = await Journal.findOne({ _id: journalId, userId });

    if (!journal) {
      return res.status(404).json({ success: false, message: "Journal not found" });
    }

    journal.title = title ?? journal.title;
    journal.content = content ?? journal.content;
    journal.mood = mood ?? journal.mood;
    journal.moodRating = moodRating ?? journal.moodRating;
    journal.location = location ?? journal.location;
    journal.privacy = privacy ?? journal.privacy;
    if (guidedQuestions !== undefined) journal.guidedQuestions = guidedQuestions;
    if (voiceTranscript !== undefined) journal.voiceTranscript = voiceTranscript;

    const updatedJournal = await journal.save();

    res.status(200).json({ success: true, data: updatedJournal });
  } catch (error) {
    console.error("Error updating journal:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete a journal entry
export const deleteJournal = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const journalId = req.params.id;

    const journal = await Journal.findOneAndDelete({ _id: journalId, userId });

    if (!journal) {
      return res.status(404).json({ success: false, message: "Journal not found" });
    }

    res.status(200).json({ success: true, message: "Journal deleted successfully" });
  } catch (error) {
    console.error("Error deleting journal:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Generate guided journaling questions
export const getGuidedQuestions = async (req, res) => {
  try {
    const { mood = 'neutral', recentActivity = '' } = req.query;
    const prompt = `Generate 5 short, empathetic, culturally neutral guided journaling questions tailored for someone feeling ${mood}. Consider recent activity context: ${recentActivity}. Return JSON array of strings.`;

    const messages = [{
      role: 'user',
      content: [{ type: 'text', text: prompt }]
    }];

    const qwenService = new QwenService();
    const responseText = await qwenService.makeRequest(messages);
    let questions = [];
    try {
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) questions = JSON.parse(jsonMatch[0]);
    } catch {}

    if (!Array.isArray(questions) || questions.length === 0) {
      questions = [
        "What emotions are you noticing right now?",
        "What happened today that affected your mood?",
        "What is one thing you are grateful for today?",
        "What do you need at this moment?",
        "What small step can you take to support yourself?"
      ];
    }

    res.status(200).json({ success: true, data: questions });
  } catch (error) {
    console.error('Error generating guided questions:', error);
    res.status(500).json({ success: false, message: 'Failed to generate guided questions' });
  }
};

// Analyze journaling entry: sentiment + insights + classification
export const analyzeJournal = async (req, res) => {
  try {
    const { content = '', mood = 'neutral', moodRating = 5 } = req.body;

    const qwenService = new QwenService();
    const ai = await qwenService.analyzeJournalSentiment(content);

    // Classification logic (safe, needs_attention, high_risk)
    const negativeSignals = (ai.keywords || []).filter(k => /sad|hopeless|anxious|stress|tired|alone|fear|harm|suicide|self-harm/i.test(k)).length;

    let riskScore = 0.3; // baseline
    if (ai.sentiment === 'negative') riskScore += 0.3;
    riskScore += Math.max(0, (7 - Number(moodRating)) / 10); // lower rating -> higher risk
    riskScore += Math.min(0.4, negativeSignals * 0.1);
    riskScore = Math.min(1, Math.max(0, Number(riskScore.toFixed(2))));

    let classification = 'safe';
    if (riskScore >= 0.75) classification = 'high_risk';
    else if (riskScore >= 0.45) classification = 'needs_attention';

    const summaryPrompt = `Summarize the user's journaling in 2-3 concise sentences focusing on strengths, concerns, and supportive tone. Return plain text.`;
    let summaryText = '';
    try {
      const resp = await QwenService.makeRequest([{ role: 'user', content: [{ type: 'text', text: `${summaryPrompt}\n\nJournal:\n${content.substring(0, 1500)}` }] }]);
      summaryText = resp;
    } catch (err) {
      console.error('Summary generation failed:', err);
      summaryText = '';
    }

    res.status(200).json({
      success: true,
      data: {
        aiInsights: {
          sentiment: ai.sentiment,
          keywords: ai.keywords,
          recommendations: ai.recommendations,
          summary: summaryText?.trim?.() || ''
        },
        mentalHealthClassification: classification,
        riskScore
      }
    });
  } catch (error) {
    console.error('Error analyzing journal:', error);
    res.status(500).json({ success: false, message: 'Failed to analyze journal' });
  }
};

// Analyze and attach insights to a specific journal entry
export const analyzeAndAttachJournal = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const journalId = req.params.id;
    
    console.log(`🚀 Manual analysis request for journal ${journalId}`);
    
    // Use the new AI workflow service
    const result = await AIWorkflowService.processJournalWorkflow(journalId, userId);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error analyzing and attaching journal:', error);
    res.status(500).json({ success: false, message: 'Failed to analyze and attach journal' });
  }
};

// Journaling insights summary for recommendation system
export const getJournalSummary = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;

    const last7 = await Journal.find({ userId }).sort({ createdAt: -1 }).limit(7).lean();
    const total = await Journal.countDocuments({ userId });

    const classificationCounts = await Journal.aggregate([
      { $match: { userId: new Journal().constructor.db.base.Types.ObjectId(userId) } },
      { $group: { _id: "$mentalHealthClassification", count: { $sum: 1 } } }
    ]);

    const byClass = classificationCounts.reduce((acc, it) => {
      acc[it._id || 'unknown'] = it.count; return acc;
    }, {});

    const avgMoodRatingAgg = await Journal.aggregate([
      { $match: { userId: new Journal().constructor.db.base.Types.ObjectId(userId) } },
      { $group: { _id: null, avg: { $avg: "$moodRating" } } }
    ]);

    const latestAnalyzed = await Journal.findOne({ userId, isAIAnalyzed: true }).sort({ updatedAt: -1 }).lean();

    res.status(200).json({
      success: true,
      data: {
        totalEntries: total,
        last7,
        classificationCounts: byClass,
        avgMoodRating: avgMoodRatingAgg[0]?.avg || null,
        latestInsights: latestAnalyzed?.aiInsights || null,
        latestClassification: latestAnalyzed?.mentalHealthClassification || null,
        latestRiskScore: latestAnalyzed?.riskScore || null
      }
    });
  } catch (error) {
    console.error('Error getting journal summary:', error);
    res.status(500).json({ success: false, message: 'Failed to get journal summary' });
  }
};

// Dedicated Journal Analysis - Following new flow: mood check -> rating safety -> journal analysis -> JSON recommendation
export const analyzeMyJournal = async (req, res) => {
  try {
    const { content = '', mood = 'neutral', moodRating = 5, journalId } = req.body;
    const userId = req.user.userId || req.user.id;

    console.log('🔍 Starting new journal analysis flow...');
    console.log('📝 Content length:', content.length);
    console.log('😊 Mood:', mood, 'Rating:', moodRating);

    if (!content || content.trim().length === 0) {
      console.log('❌ No content provided');
      return res.status(400).json({
        success: false,
        message: "Please write something in your journal before analyzing"
      });
    }

    // Step 1: Check the mood
    console.log('📊 Step 1: Analyzing mood...');
    const normalizedMood = mood.toLowerCase().trim();
    console.log('🎭 Detected mood:', normalizedMood);

    // Step 2: Check rating to see if it's safe or not
    console.log('📊 Step 2: Assessing safety based on rating...');
    const rating = parseInt(moodRating) || 5;
    const isSafe = rating >= 4; // Rating 4-5 is considered safe, below that needs attention
    console.log('🔒 Safety assessment - Rating:', rating, 'Safe:', isSafe);

    // Step 3: Check the journal, search the core word and analyze it
    console.log('📊 Step 3: Analyzing journal content for core words...');
    const contentLower = content.toLowerCase();

    // Define emotion keywords for analysis
    const emotionKeywords = {
      bullying: ["bully", "dibully", "diperlakukan", "dihina", "diejek", "digejek", "dilecehkan", "intimidasi", "ancaman", "takut", "terancam"],
      stress: ["stress", "tekanan", "overwhelmed", "kelelahan", "lelah", "capek", "beban", "berat", "sulit", "susah", "kewalahan"],
      anxiety: ["cemas", "anxious", "khawatir", "takut", "panik", "gelisah", "grogi", "nervous", "kegelisahan", "kecemasan"],
      depression: ["sedih", "depresi", "murung", "putus asa", "hopeless", "depressed", "down", "rendah", "kosong", "apatis"],
      loneliness: ["sendiri", "lonely", "sepi", "terisolasi", "isolated", "kesepian", "kangen", "rindu", "miss"],
      anger: ["marah", "angry", "kesal", "emosi", "frustrasi", "frustrated", "jengkel", "geram", "malas", "irritated"]
    };

    // Analyze content for core words
    let detectedCategory = 'general';
    let maxMatches = 0;

    for (const [category, keywords] of Object.entries(emotionKeywords)) {
      const matches = keywords.filter(keyword => contentLower.includes(keyword)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        detectedCategory = category;
      }
    }

    console.log('🔍 Core word analysis - Detected category:', detectedCategory, 'Matches:', maxMatches);

    // Step 4: Give the recommendation action from the json
    console.log('📊 Step 4: Selecting recommendation from JSON...');

    // Import the recommendations JSON
    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const recommendationsPath = path.join(__dirname, '../utils/mentalHealthRecommendations.json');
    const recommendationsData = JSON.parse(fs.readFileSync(recommendationsPath, 'utf8'));

    // Get recommendations for detected category
    const categoryRecommendations = recommendationsData.recommendations[detectedCategory] || recommendationsData.recommendations.general;

    if (!categoryRecommendations || categoryRecommendations.length === 0) {
      throw new Error('No recommendations available for detected category');
    }

    // Select random recommendation from the category
    const randomIndex = Math.floor(Math.random() * categoryRecommendations.length);
    const selectedRecommendation = categoryRecommendations[randomIndex];

    console.log('✅ Recommendation selected:', selectedRecommendation.title);

    // Create empathetic response based on category and safety
    let empatheticResponse = "🌿 Aku mengerti perasaanmu saat ini. Mari kita lakukan sesuatu untuk membantu kamu merasa lebih baik.";

    const categoryResponses = {
      bullying: "🌿 Aku dengar ceritamu tentang bullying. Itu pasti sangat menyakitkan dan membuatmu merasa tidak aman. Kamu nggak pantas diperlakukan seperti itu. ❤️",
      anxiety: "🌿 Aku bisa merasakan kecemasan yang kamu rasakan. Mari kita lakukan sesuatu untuk membantu menenangkan pikiran. 💙",
      stress: "🌿 Terasa overwhelmed ya? Mari kita lakukan sesuatu untuk mengurangi stres dan membuatmu lebih rileks. 🌸",
      depression: "🌿 Aku di sini untuk mendukungmu. Mari kita lakukan sesuatu yang bisa membantu meningkatkan suasana hati. 💛",
      loneliness: "🌿 Perasaan kesepian itu berat ya? Mari kita lakukan sesuatu untuk membantu kamu merasa lebih terhubung. 🤗",
      anger: "🌿 Aku bisa merasakan emosi yang kuat yang kamu rasakan. Mari kita lakukan sesuatu untuk membantu mengelola energi ini. 🔥"
    };

    if (categoryResponses[detectedCategory]) {
      empatheticResponse = categoryResponses[detectedCategory];
    }

    // Add safety concern if rating is low
    if (!isSafe) {
      empatheticResponse += " Mengingat rating suasana hatimu cukup rendah, pertimbangkan untuk berbicara dengan orang terpercaya atau profesional jika perasaan ini berlanjut. 💙";
    }

    const recommendationData = {
      title: selectedRecommendation.title,
      description: selectedRecommendation.description,
      reason: selectedRecommendation.reason,
      timeEstimate: selectedRecommendation.timeEstimate,
      type: selectedRecommendation.type,
      isCompleted: false,
      generatedAt: new Date().toISOString()
    };

    // Save to database if journalId is provided
    if (journalId) {
      try {
        console.log('💾 Saving recommendation to journal entry:', journalId);
        const journal = await Journal.findOne({ _id: journalId, userId });
        if (journal) {
          journal.isAIAnalyzed = true;
          journal.aiRecommendation = {
            title: recommendationData.title,
            description: recommendationData.description,
            reason: recommendationData.reason,
            timeEstimate: recommendationData.timeEstimate,
            type: recommendationData.type,
            isCompleted: false,
            generatedAt: new Date()
          };
          journal.mentalHealthClassification = detectedCategory === 'bullying' || detectedCategory === 'depression' ? 'needs_attention' : 'safe';
          await journal.save();
          console.log('✅ Recommendation saved to journal entry');
        }
      } catch (dbError) {
        console.error('❌ Error saving analysis to database:', dbError);
        // Continue without saving to DB, don't fail the request
      }
    }

    // Return the analysis result
    res.status(200).json({
      success: true,
      message: "Journal analyzed successfully using new flow!",
      data: {
        recommendation: recommendationData,
        empatheticResponse: empatheticResponse,
        sentiment: detectedCategory,
        safety: {
          isSafe,
          rating,
          riskLevel: isSafe ? 'low' : 'needs_attention'
        },
        analysis: {
          detectedCategory,
          coreWordsFound: maxMatches,
          mood: normalizedMood
        },
        metadata: {
          mood: normalizedMood,
          moodRating: rating,
          analyzedAt: new Date().toISOString(),
          analysisType: 'journal_mental_health_new_flow'
        }
      }
    });

  } catch (error) {
    console.error('💥 Error in analyzeMyJournal:', error);
    console.error('🔍 Error details:', {
      message: error.message,
      stack: error.stack?.substring(0, 200)
    });

    // Return a simple fallback response
    res.status(200).json({
      success: true,
      message: "Analysis completed with fallback recommendation",
      data: {
        recommendation: {
          title: "Take a Deep Breath",
          description: "Take 5 slow, deep breaths. Inhale for 4 counts, hold for 4, exhale for 6.",
          reason: "Deep breathing helps activate your body's relaxation response",
          timeEstimate: "2 minutes",
          type: "breathing_exercise",
          isCompleted: false,
          generatedAt: new Date().toISOString()
        },
        empatheticResponse: "🌿 Thank you for sharing your thoughts. Here's a simple breathing exercise to help you feel more calm. Remember, you're not alone in this journey. 💙",
        sentiment: 'general',
        safety: {
          isSafe: true,
          rating: 5,
          riskLevel: 'low'
        },
        analysis: {
          detectedCategory: 'general',
          coreWordsFound: 0,
          mood: 'neutral'
        },
        metadata: {
          mood: 'neutral',
          moodRating: 5,
          analyzedAt: new Date().toISOString(),
          analysisType: 'journal_mental_health_fallback'
        }
      }
    });
  }
};

// Mental Health Assistant - Pick from Database Recommendations
export const getMentalHealthSupport = async (req, res) => {
  try {
    const { content = '', mood = 'neutral', moodRating = 5, journalId } = req.body;
    const userId = req.user.userId || req.user.id;

    // If no content, return empty recommendation
    if (!content || content.trim().length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          recommendation: null,
          empatheticResponse: "🌿 Jurnal kosong belum bisa dianalisis. Tulis sesuatu dulu ya! 💙",
          sentiment: 'neutral',
          metadata: {
            mood,
            moodRating,
            analyzedAt: new Date().toISOString()
          }
        }
      });
    }

    // Determine category based on content analysis
    const contentLower = content.toLowerCase();
    let category = 'general';

    if (contentLower.includes('bully') || contentLower.includes('dibully') || contentLower.includes('intimidasi')) {
      category = 'bullying';
    } else if (contentLower.includes('stress') || contentLower.includes('tekanan') || contentLower.includes('overwhelm')) {
      category = 'stress';
    } else if (contentLower.includes('anxious') || contentLower.includes('cemas') || contentLower.includes('khawatir')) {
      category = 'anxiety';
    } else if (contentLower.includes('sad') || contentLower.includes('sedih') || contentLower.includes('depresi')) {
      category = 'depression';
    } else if (contentLower.includes('lonely') || contentLower.includes('kesepian') || contentLower.includes('sendiri')) {
      category = 'loneliness';
    } else if (contentLower.includes('angry') || contentLower.includes('marah') || contentLower.includes('emosi')) {
      category = 'anger';
    } else if (contentLower.includes('tidur') || contentLower.includes('sleep') || contentLower.includes('insomnia')) {
      category = 'sleep';
    } else if (contentLower.includes('percaya diri') || contentLower.includes('self esteem') || contentLower.includes('confidence')) {
      category = 'self_esteem';
    }

    // Get random recommendation from database based on category
    const recommendations = await MentalHealthRecommendation.find({
      category: category,
      isActive: true
    });

    let selectedRecommendation = null;

    if (recommendations.length > 0) {
      // Pick random recommendation from the category
      const randomIndex = Math.floor(Math.random() * recommendations.length);
      selectedRecommendation = recommendations[randomIndex];
    } else {
      // Fallback to general category if no recommendations found
      const generalRecommendations = await MentalHealthRecommendation.find({
        category: 'general',
        isActive: true
      });

      if (generalRecommendations.length > 0) {
        const randomIndex = Math.floor(Math.random() * generalRecommendations.length);
        selectedRecommendation = generalRecommendations[randomIndex];
      }
    }

    if (!selectedRecommendation) {
      return res.status(500).json({
        success: false,
        message: 'No recommendations available - please try again later'
      });
    }

    // Create empathetic response based on category
    let empatheticResponse = "🌿 Aku mengerti perasaanmu saat ini. Mari kita lakukan sesuatu untuk membantu kamu merasa lebih baik.";

    switch (category) {
      case 'bullying':
        empatheticResponse = "🌿 Aku dengar ceritamu tentang bullying. Itu pasti sangat menyakitkan dan membuatmu merasa tidak aman. Kamu nggak pantas diperlakukan seperti itu. ❤️";
        break;
      case 'anxiety':
        empatheticResponse = "🌿 Aku bisa merasakan kecemasan yang kamu rasakan. Mari kita lakukan sesuatu untuk membantu menenangkan pikiran. 💙";
        break;
      case 'stress':
        empatheticResponse = "🌿 Terasa overwhelmed ya? Mari kita lakukan sesuatu untuk mengurangi stres dan membuatmu lebih rileks. 🌸";
        break;
      case 'depression':
        empatheticResponse = "🌿 Aku di sini untuk mendukungmu. Mari kita lakukan sesuatu yang bisa membantu meningkatkan suasana hati. 💛";
        break;
      case 'loneliness':
        empatheticResponse = "🌿 Perasaan kesepian itu berat ya? Mari kita lakukan sesuatu untuk membantu kamu merasa lebih terhubung. 🤗";
        break;
    }

    const recommendationData = {
      title: selectedRecommendation.title,
      description: selectedRecommendation.description,
      reason: selectedRecommendation.reason,
      timeEstimate: selectedRecommendation.timeEstimate,
      type: selectedRecommendation.type
    };

    // Save to database if journalId is provided
    if (journalId) {
      try {
        const journal = await Journal.findOne({ _id: journalId, userId });
        if (journal) {
          journal.isAIAnalyzed = true;
          journal.aiRecommendation = {
            title: recommendationData.title,
            description: recommendationData.description,
            reason: recommendationData.reason,
            timeEstimate: recommendationData.timeEstimate,
            type: recommendationData.type,
            isCompleted: false,
            generatedAt: new Date()
          };
          journal.mentalHealthClassification = category === 'bullying' || category === 'depression' ? 'needs_attention' : 'safe';
          await journal.save();
        }
      } catch (dbError) {
        console.error('Error saving analysis to database:', dbError);
        // Continue without saving to DB, don't fail the request
      }
    }

    res.status(200).json({
      success: true,
      data: {
        recommendation: recommendationData,
        empatheticResponse: empatheticResponse,
        sentiment: category,
        metadata: {
          mood,
          moodRating,
          analyzedAt: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    console.error('Error getting mental health support:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze journal - please try again'
    });
  }
};

// Mark AI recommendation as completed
export const markRecommendationCompleted = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const journalId = req.params.id;
    const { isCompleted = true } = req.body;

    const journal = await Journal.findOne({ _id: journalId, userId });

    if (!journal) {
      return res.status(404).json({ success: false, message: "Journal not found" });
    }

    if (!journal.aiRecommendation) {
      return res.status(400).json({ success: false, message: "No AI recommendation found for this journal" });
    }

    journal.aiRecommendation.isCompleted = isCompleted;
    if (isCompleted) {
      journal.aiRecommendation.completedAt = new Date();
    } else {
      journal.aiRecommendation.completedAt = null;
    }

    await journal.save();

    res.status(200).json({
      success: true,
      data: {
        journalId: journal._id,
        recommendation: journal.aiRecommendation
      }
    });
  } catch (error) {
    console.error('Error marking recommendation completed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update recommendation status'
    });
  }
};

// Get journal with AI recommendation (for display)
export const getJournalWithRecommendation = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const journalId = req.params.id;

    const journal = await Journal.findOne({ _id: journalId, userId });

    if (!journal) {
      return res.status(404).json({ success: false, message: "Journal not found" });
    }

    res.status(200).json({
      success: true,
      data: {
        journal: {
          _id: journal._id,
          title: journal.title,
          content: journal.content,
          mood: journal.mood,
          moodRating: journal.moodRating,
          createdAt: journal.createdAt,
          isAIAnalyzed: journal.isAIAnalyzed
        },
        aiRecommendation: journal.aiRecommendation || null,
        hasContent: journal.content && journal.content.trim().length > 0
      }
    });
  } catch (error) {
    console.error('Error getting journal with recommendation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get journal'
    });
  }
};

// ---------------- PDF-based Journaling (single model) ----------------

// Upload a journal as PDF (store in Journal model)
// Expect: multipart/form-data with fields: title, file (pdf)
export const uploadJournalPdf = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { title = '', content = '', mood = 'neutral', moodRating = 5 } = req.body || {};
    const file = req.file;

    if (!file) return res.status(400).json({ success: false, message: 'PDF file is required' });
    if (!title) return res.status(400).json({ success: false, message: 'Title is required' });

    const journal = new Journal({
      userId,
      title,
      content: String(content || ''),
      mood: String(mood || 'neutral'),
      moodRating: Number(moodRating || 5),
      privacy: 'private',
      pdf: file.buffer,
      pdfMimeType: file.mimetype || 'application/pdf',
    });

    const saved = await journal.save();
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    console.error('Error uploading journal PDF:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Analyze attached PDF and generate personalized quote
export const analyzePdfAndGenerateQuote = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { id } = req.params;
    const doc = await Journal.findOne({ _id: id, userId });
    if (!doc) return res.status(404).json({ success: false, message: 'Journal not found' });
    if (!doc.pdf) return res.status(400).json({ success: false, message: 'No PDF attached to this journal' });

    const excerpt = String(doc.content || '').slice(0, 4000);

    const qwenService = new QwenService();
    const ai = await qwenService.analyzeJournalSentiment(excerpt);

    const negativeSignals = (ai.keywords || []).filter(k => /sad|hopeless|anxious|stress|tired|alone|fear|harm|suicide|self-harm/i.test(k)).length;
    let riskScore = 0.3;
    if (ai.sentiment === 'negative') riskScore += 0.3;
    riskScore += Math.min(0.4, negativeSignals * 0.1);
    riskScore = Math.min(1, Math.max(0, Number(riskScore.toFixed(2))));

    let classification = 'safe';
    if (riskScore >= 0.75) classification = 'high_risk';
    else if (riskScore >= 0.45) classification = 'needs_attention';

    const summaryPrompt = `Summarize the user's journaling (from PDF) in 2-3 concise sentences focusing on strengths, concerns, and supportive tone. Return plain text.`;
    let summaryText = '';
    try {
      const qwenService = new QwenService();
      const resp = await qwenService.makeRequest([{ role: 'user', content: [{ type: 'text', text: `${summaryPrompt}\n\nJournal (excerpt):\n${excerpt || (doc.content || '')}` }] }]);
      summaryText = resp;
    } catch (err) {
      console.error('Summary generation failed:', err);
      summaryText = '';
    }

    const quotePrompt = `You are a world-class motivator and compassionate psychologist. Create a short motivational quote (1-2 sentences) that is empathetic, empowering, and practical, personalized to the following journal content. Keep it culturally neutral, supportive, and uplifting. Return JSON: {"quote":"string","explanation":"string","author":"Qwen Coach"}.\n\nJournal (excerpt):\n${excerpt || (doc.content || '')}`;
    const quoteText = await qwenService.makeRequest([{ role: 'user', content: [{ type: 'text', text: quotePrompt }] }]);

    let quoteData = {};
    try {
      const jsonMatch = quoteText.match(/\{[\s\S]*\}/);
      if (jsonMatch) quoteData = JSON.parse(jsonMatch[0]);
    } catch {}

    if (!quoteData.quote) {
      quoteData = await QwenService.generateDailyQuote();
      if (!quoteData.author) quoteData.author = 'Qwen Coach';
    }

    doc.isAIAnalyzed = true;
    doc.aiInsights = {
      sentiment: ai.sentiment,
      keywords: ai.keywords,
      recommendations: ai.recommendations,
      summary: summaryText?.trim?.() || ''
    };
    doc.mentalHealthClassification = classification;
    doc.riskScore = riskScore;
    await doc.save();

    const quoteRecord = new DailyQuote({
      userId,
      quote: quoteData.quote,
      explanation: quoteData.explanation || 'Personalized motivation based on your journaling',
      author: quoteData.author || 'Qwen Coach',
      isAiGenerated: true,
      generatedAt: new Date(),
      category: 'journal-based',
      isFavorite: false,
      moodContext: ai.sentiment || 'neutral',
      activityContext: 'journaling'
    });
    await quoteRecord.save();

    res.status(200).json({
      success: true,
      data: {
        journal: { id: doc._id, title: doc.title, analyzed: doc.isAIAnalyzed, aiInsights: doc.aiInsights, riskScore: doc.riskScore, classification: doc.mentalHealthClassification },
        quote: quoteRecord
      }
    });
  } catch (error) {
    console.error('Error analyzing PDF and generating quote:', error);
    res.status(500).json({ success: false, message: 'Failed to analyze and generate quote' });
  }
};

// List journals with PDF attached (history)
export const getPdfHistory = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [items, total] = await Promise.all([
      Journal.find({ userId, pdf: { $exists: true, $ne: null } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('-pdf'),
      Journal.countDocuments({ userId, pdf: { $exists: true, $ne: null } })
    ]);

    res.status(200).json({
      success: true,
      data: items,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error getting PDF history:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
