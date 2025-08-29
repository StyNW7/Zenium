import Journal from "../models/journal.model.js";
import QwenService from "../utils/qwen.js";

export const getUserJournals = async (req, res) => {
  try {
    const userId = req.user.id;
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
    const userId = req.user.id;
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
    const userId = req.user.id;
    const { title, content, mood, moodRating, tags, location, privacy, guidedQuestions, voiceTranscript } = req.body;

    const newJournal = new Journal({
      userId,
      title,
      content,
      mood,
      moodRating,
      tags,
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
    const userId = req.user.id;
    const journalId = req.params.id;
    const { title, content, mood, moodRating, tags, location, privacy, guidedQuestions, voiceTranscript } = req.body;

    const journal = await Journal.findOne({ _id: journalId, userId });

    if (!journal) {
      return res.status(404).json({ success: false, message: "Journal not found" });
    }

    journal.title = title ?? journal.title;
    journal.content = content ?? journal.content;
    journal.mood = mood ?? journal.mood;
    journal.moodRating = moodRating ?? journal.moodRating;
    journal.tags = tags ?? journal.tags;
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
    const userId = req.user.id;
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

    const responseText = await QwenService.makeRequest(messages);
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

    const ai = await QwenService.analyzeJournalSentiment(content);

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
    const summaryText = await QwenService.makeRequest([{ role: 'user', content: [{ type: 'text', text: `${summaryPrompt}\n\nJournal:\n${content.substring(0, 1500)}` }] }]);

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
    const userId = req.user.id;
    const journalId = req.params.id;
    const journal = await Journal.findOne({ _id: journalId, userId });
    if (!journal) return res.status(404).json({ success: false, message: 'Journal not found' });

    const content = journal.content || '';
    const mood = journal.mood || 'neutral';
    const moodRating = journal.moodRating || 5;

    const ai = await QwenService.analyzeJournalSentiment(content);

    const negativeSignals = (ai.keywords || []).filter(k => /sad|hopeless|anxious|stress|tired|alone|fear|harm|suicide|self-harm/i.test(k)).length;

    let riskScore = 0.3; // baseline
    if (ai.sentiment === 'negative') riskScore += 0.3;
    riskScore += Math.max(0, (7 - Number(moodRating)) / 10);
    riskScore += Math.min(0.4, negativeSignals * 0.1);
    riskScore = Math.min(1, Math.max(0, Number(riskScore.toFixed(2))));

    let classification = 'safe';
    if (riskScore >= 0.75) classification = 'high_risk';
    else if (riskScore >= 0.45) classification = 'needs_attention';

    const summaryPrompt = `Summarize the user's journaling in 2-3 concise sentences focusing on strengths, concerns, and supportive tone. Return plain text.`;
    const summaryText = await QwenService.makeRequest([{ role: 'user', content: [{ type: 'text', text: `${summaryPrompt}\n\nJournal:\n${content.substring(0, 1500)}` }] }]);

    journal.aiInsights = {
      sentiment: ai.sentiment,
      keywords: ai.keywords,
      recommendations: ai.recommendations,
      summary: summaryText?.trim?.() || ''
    };
    journal.isAIAnalyzed = true;
    journal.mentalHealthClassification = classification;
    journal.riskScore = riskScore;

    const updated = await journal.save();

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error('Error analyzing and attaching journal:', error);
    res.status(500).json({ success: false, message: 'Failed to analyze and attach journal' });
  }
};

// Journaling insights summary for recommendation system
export const getJournalSummary = async (req, res) => {
  try {
    const userId = req.user.id;

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