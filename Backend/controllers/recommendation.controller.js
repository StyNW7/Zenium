import Journal from "../models/journal.model.js";
import AIWorkflowService from "../services/aiWorkflow.service.js";
import MentalHealthRecommendation from "../models/mentalHealthRecommendation.model.js";

// Get all recommendations for a user (from their journals)
export const getUserRecommendations = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { page = 1, limit = 10, type } = req.query;

    let query = { userId };
    if (type) {
      query["aiRecommendation.type"] = type;
    }

    const journals = await Journal.find(query)
      .sort({ "aiRecommendation.generatedAt": -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .select("title aiRecommendation");

    const recommendations = journals
      .filter(journal => journal.aiRecommendation)
      .map(journal => ({
        id: journal.aiRecommendation.generatedAt ? journal.aiRecommendation.generatedAt.toISOString() : journal._id.toString(),
        journalId: journal._id,
        title: journal.aiRecommendation.title,
        description: journal.aiRecommendation.description,
        reason: journal.aiRecommendation.reason,
        timeEstimate: journal.aiRecommendation.timeEstimate,
        type: journal.aiRecommendation.type,
        isCompleted: journal.aiRecommendation.isCompleted,
        completedAt: journal.aiRecommendation.completedAt,
        generatedAt: journal.aiRecommendation.generatedAt,
        journalTitle: journal.title
      }));

    const total = await Journal.countDocuments(query);

    res.status(200).json({
      success: true,
      data: recommendations,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Error fetching user recommendations:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get a specific recommendation by ID
export const getRecommendationById = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { id } = req.params;

    const journal = await Journal.findOne({
      userId,
      "aiRecommendation.generatedAt": new Date(id)
    }).select("title aiRecommendation");

    if (!journal || !journal.aiRecommendation) {
      return res.status(404).json({ success: false, message: "Recommendation not found" });
    }

    res.status(200).json({
      success: true,
      data: {
        id: journal.aiRecommendation.generatedAt.toISOString(),
        journalId: journal._id,
        title: journal.aiRecommendation.title,
        description: journal.aiRecommendation.description,
        reason: journal.aiRecommendation.reason,
        timeEstimate: journal.aiRecommendation.timeEstimate,
        type: journal.aiRecommendation.type,
        isCompleted: journal.aiRecommendation.isCompleted,
        completedAt: journal.aiRecommendation.completedAt,
        generatedAt: journal.aiRecommendation.generatedAt,
        journalTitle: journal.title
      }
    });
  } catch (error) {
    console.error("Error fetching recommendation:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete a recommendation (actually marks it as completed or removes from journal)
export const deleteRecommendation = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { id } = req.params;

    const journal = await Journal.findOne({
      userId,
      "aiRecommendation.generatedAt": new Date(id)
    });

    if (!journal || !journal.aiRecommendation) {
      return res.status(404).json({ success: false, message: "Recommendation not found" });
    }

    journal.aiRecommendation = null;
    await journal.save();

    res.status(200).json({ success: true, message: "Recommendation deleted successfully" });
  } catch (error) {
    console.error("Error deleting recommendation:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get recommendation statistics for user
export const getRecommendationStats = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;

    const journals = await Journal.find({ userId })
      .select("aiRecommendation isAIAnalyzed")
      .lean();

    const totalRecommendations = journals.filter(j => j.aiRecommendation).length;
    const completedRecommendations = journals.filter(j => j.aiRecommendation && j.aiRecommendation.isCompleted).length;
    const journalsAnalyzed = journals.filter(j => j.isAIAnalyzed).length;

    const typeCounts = {};
    journals.forEach(journal => {
      if (journal.aiRecommendation && journal.aiRecommendation.type) {
        typeCounts[journal.aiRecommendation.type] = (typeCounts[journal.aiRecommendation.type] || 0) + 1;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        totalRecommendations,
        completedRecommendations,
        completionRate: totalRecommendations > 0 ? (completedRecommendations / totalRecommendations * 100).toFixed(1) : 0,
        journalsAnalyzed,
        typeBreakdown: typeCounts
      }
    });
  } catch (error) {
    console.error("Error fetching recommendation stats:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Trigger AI workflow for journal recommendation
export const triggerAIWorkflow = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const journalId = req.params.id;

    const result = await AIWorkflowService.processJournalWorkflow(journalId, userId);

    res.status(200).json(result);
  } catch (error) {
    console.error("Error triggering AI workflow:", error);
    res.status(500).json({ success: false, message: "Failed to trigger AI workflow" });
  }
};

// Get recommendations by type
export const getRecommendationsByType = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { type } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const journals = await Journal.find({
      userId,
      "aiRecommendation.type": type
    })
      .sort({ "aiRecommendation.generatedAt": -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .select("title aiRecommendation");

    const recommendations = journals.map(journal => ({
      id: journal.aiRecommendation.generatedAt ? journal.aiRecommendation.generatedAt.toISOString() : journal._id.toString(),
      journalId: journal._id,
      title: journal.aiRecommendation.title,
      description: journal.aiRecommendation.description,
      reason: journal.aiRecommendation.reason,
      timeEstimate: journal.aiRecommendation.timeEstimate,
      type: journal.aiRecommendation.type,
      isCompleted: journal.aiRecommendation.isCompleted,
      completedAt: journal.aiRecommendation.completedAt,
      generatedAt: journal.aiRecommendation.generatedAt,
      journalTitle: journal.title
    }));

    const total = await Journal.countDocuments({
      userId,
      "aiRecommendation.type": type
    });

    res.status(200).json({
      success: true,
      data: recommendations,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Error fetching recommendations by type:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get high priority recommendations (not completed and recent)
export const getHighPriorityRecommendations = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { limit = 5 } = req.query;

    // Find recommendations that are not completed, sorted by generation date (most recent first)
    const journals = await Journal.find({
      userId,
      "aiRecommendation.isCompleted": { $ne: true },
      aiRecommendation: { $exists: true }
    })
      .sort({ "aiRecommendation.generatedAt": -1 })
      .limit(parseInt(limit))
      .select("title aiRecommendation");

    const recommendations = journals.map(journal => ({
      id: journal.aiRecommendation.generatedAt ? journal.aiRecommendation.generatedAt.toISOString() : journal._id.toString(),
      journalId: journal._id,
      title: journal.aiRecommendation.title,
      description: journal.aiRecommendation.description,
      reason: journal.aiRecommendation.reason,
      timeEstimate: journal.aiRecommendation.timeEstimate,
      type: journal.aiRecommendation.type,
      isCompleted: journal.aiRecommendation.isCompleted,
      completedAt: journal.aiRecommendation.completedAt,
      generatedAt: journal.aiRecommendation.generatedAt,
      journalTitle: journal.title
    }));

    res.status(200).json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    console.error("Error fetching high priority recommendations:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Mark recommendation as completed
export const markRecommendationCompleted = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { id } = req.params;
    const { isCompleted = true } = req.body;

    const journal = await Journal.findOne({
      userId,
      "aiRecommendation.generatedAt": new Date(id)
    });

    if (!journal || !journal.aiRecommendation) {
      return res.status(404).json({ success: false, message: "Recommendation not found" });
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
        recommendationId: journal.aiRecommendation.generatedAt.toISOString(),
        journalId: journal._id,
        isCompleted,
        completedAt: journal.aiRecommendation.completedAt
      }
    });
  } catch (error) {
    console.error("Error updating recommendation status:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all available recommendations from library
export const getLibraryRecommendations = async (req, res) => {
  try {
    const { category, type, difficulty, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };
    if (category) query.category = category;
    if (type) query.type = type;
    if (difficulty) query.difficulty = difficulty;

    const [recommendations, total] = await Promise.all([
      MentalHealthRecommendation.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      MentalHealthRecommendation.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: recommendations,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching library recommendations:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get recommendation by category (standardized library approach)
export const getRecommendationsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 10 } = req.query;

    const recommendations = await MentalHealthRecommendation.find({
      category,
      isActive: true
    })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: recommendations,
      category
    });
  } catch (error) {
    console.error("Error fetching recommendations by category:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get personalized recommendations based on mood (from library)
export const getPersonalizedLibraryRecommendations = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { mood = 'general', limit = 5 } = req.query;

    // Map mood to categories
    const moodCategoryMap = {
      'sad': ['depression', 'loneliness'],
      'anxious': ['anxiety'],
      'stressed': ['stress'],
      'angry': ['anger'],
      'lonely': ['loneliness'],
      'general': ['general', 'mindfulness']
    };

    const categories = moodCategoryMap[mood] || ['general'];

    const recommendations = await MentalHealthRecommendation.find({
      category: { $in: categories },
      isActive: true
    })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: recommendations,
      mood,
      categories: categories
    });
  } catch (error) {
    console.error("Error fetching personalized recommendations:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
