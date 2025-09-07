import Journal from "../models/journal.model.js";

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

// Dedicated Journal Analysis - Following new flow: mood check -> rating safety -> journal analysis -> JSON recommendation
export const analyzeMyJournal = async (req, res) => {
  try {
    const { content = '', mood = 'neutral', moodRating = 5, journalId } = req.body;
    const userId = req.user.userId || req.user.id;

    console.log('🔍 Starting new journal analysis flow...');
    console.log('📝 Content length:', content.length);
    console.log('😊 Mood:', mood, 'Rating:', moodRating);
    console.log('🆔 Journal ID:', journalId);

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
      bullying: ["bully", "bullied", "treated badly", "mocked", "teased", "humiliated", "intimidated", "threatened", "scared", "threatened"],
      stress: ["stress", "pressure", "overwhelmed", "exhausted", "tired", "burden", "heavy", "difficult", "hard", "overwhelmed"],
      anxiety: ["anxious", "worried", "scared", "panic", "restless", "nervous", "nervousness", "anxiety"],
      depression: ["sad", "depression", "gloomy", "hopeless", "depressed", "down", "low", "empty", "apathetic"],
      loneliness: ["alone", "lonely", "quiet", "isolated", "loneliness", "miss", "longing", "miss"],
      anger: ["angry", "upset", "emotional", "frustrated", "annoyed", "furious", "lazy", "irritated"]
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

    let recommendationsData = fallbackRecommendations;

    try {
      // Import the recommendations JSON - using correct path
      const fs = await import('fs');
      const path = await import('path');
      const { fileURLToPath } = await import('url');

      // Correct path to recommendations JSON - updated for ES modules
      const currentDir = path.dirname(fileURLToPath(import.meta.url));
      const recommendationsPath = path.join(currentDir, '..', 'seeders', 'mentalHealthRecommendations.json');

      console.log('📂 Looking for recommendations file at:', recommendationsPath);

      if (fs.existsSync(recommendationsPath)) {
        console.log('✅ Recommendations file found');
        recommendationsData = JSON.parse(fs.readFileSync(recommendationsPath, 'utf8'));
      } else {
        console.warn('⚠️ Recommendations file not found, using fallback');
        console.log('📂 File path:', recommendationsPath);
        try {
          const seedersDir = path.join(currentDir, '..', 'seeders');
          console.log('📂 Available files in seeders:', fs.readdirSync(seedersDir));
        } catch (e) {
          console.error('Error reading seeders directory:', e.message);
        }
      }
    } catch (error) {
      console.error('❌ Error loading recommendations file:', error.message);
      console.log('⚠️ Using fallback recommendations');
    }

    // Filter recommendations for detected category
    let categoryRecommendations = recommendationsData.filter(rec =>
      rec.category === detectedCategory
    );

    console.log('📊 Filtered recommendations for category:', detectedCategory, 'Count:', categoryRecommendations.length);

    // If no specific category recommendations found, use general
    if (!categoryRecommendations || categoryRecommendations.length === 0) {
      console.log('⚠️ No recommendations found for category, using general...');
      categoryRecommendations = recommendationsData.filter(rec => rec.category === 'general');
      console.log('✅ Using general recommendations, Count:', categoryRecommendations.length);

      // Final fallback check
      if (!categoryRecommendations || categoryRecommendations.length === 0) {
        console.log('⚠️ No general recommendations either, using super fallback');
        categoryRecommendations = [fallbackRecommendations[0]]; // Use first fallback
      }
    }

    // Select random recommendation from the category
    const randomIndex = Math.floor(Math.random() * categoryRecommendations.length);
    const selectedRecommendation = categoryRecommendations[randomIndex];

    console.log('✅ Recommendation selected:', selectedRecommendation.title);

    // Create empathetic response based on category and safety
    let empatheticResponse = "🌿 I understand how you're feeling right now. Let's do something to help you feel better.";

    const categoryResponses = {
      bullying: "🌿 I hear your story about bullying. It must be very painful and make you feel unsafe. You don't deserve to be treated like that. ❤️",
      anxiety: "🌿 I can feel the anxiety you're experiencing. Let's do something to help calm your mind. 💙",
      stress: "🌿 Feeling overwhelmed? Let's do something to reduce stress and help you relax more. 🌸",
      depression: "🌿 I'm here to support you. Let's do something that can help improve your mood. 💛",
      loneliness: "🌿 Loneliness is heavy, isn't it? Let's do something to help you feel more connected. 🤗",
      anger: "🌿 I can feel the strong emotions you're experiencing. Let's do something to help manage this energy. 🔥"
    };

    if (categoryResponses[detectedCategory]) {
      empatheticResponse = categoryResponses[detectedCategory];
    }

    // Add safety concern if rating is low
    if (!isSafe) {
      empatheticResponse += " Given your mood rating is quite low, consider talking to someone you trust or a professional if these feelings continue. 💙";
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
    console.error('Error in analyzeMyJournal:', error);
    res.status(500).json({
      success: false,
      message: "Failed to analyze journal"
    });
  }
};