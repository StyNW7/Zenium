import AIWorkflowService from "../services/aiWorkflow.service.js";
import Recommendation from "../models/recommendation.model.js";

// Get user's AI recommendations
export const getUserRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, priority, completed, limit = 10, page = 1 } = req.query;

    const result = await AIWorkflowService.getUserRecommendations(userId, {
      type,
      priority,
      completed: completed === 'true',
      limit: parseInt(limit),
      page: parseInt(page)
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Error getting recommendations:", error);
    res.status(500).json({ success: false, message: "Failed to get recommendations" });
  }
};

// Get recommendation by ID
export const getRecommendationById = async (req, res) => {
  try {
    const userId = req.user.id;
    const recommendationId = req.params.id;

    const recommendation = await Recommendation.findOne({ _id: recommendationId, userId })
      .populate('journalId', 'title content mood createdAt');

    if (!recommendation) {
      return res.status(404).json({ success: false, message: "Recommendation not found" });
    }

    res.status(200).json({ success: true, data: recommendation });
  } catch (error) {
    console.error("Error getting recommendation:", error);
    res.status(500).json({ success: false, message: "Failed to get recommendation" });
  }
};

// Mark recommendation as completed
export const markRecommendationCompleted = async (req, res) => {
  try {
    const userId = req.user.id;
    const recommendationId = req.params.id;
    const { helpful, implemented, notes } = req.body;

    const recommendation = await AIWorkflowService.markRecommendationCompleted(
      recommendationId,
      userId,
      { helpful, implemented, notes }
    );

    res.status(200).json({ success: true, data: recommendation });
  } catch (error) {
    console.error("Error marking recommendation completed:", error);
    res.status(500).json({ success: false, message: "Failed to mark recommendation completed" });
  }
};

// Delete recommendation
export const deleteRecommendation = async (req, res) => {
  try {
    const userId = req.user.id;
    const recommendationId = req.params.id;

    const recommendation = await Recommendation.findOneAndDelete({ _id: recommendationId, userId });

    if (!recommendation) {
      return res.status(404).json({ success: false, message: "Recommendation not found" });
    }

    res.status(200).json({ success: true, message: "Recommendation deleted successfully" });
  } catch (error) {
    console.error("Error deleting recommendation:", error);
    res.status(500).json({ success: false, message: "Failed to delete recommendation" });
  }
};

// Get recommendation statistics
export const getRecommendationStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await Recommendation.aggregate([
      { $match: { userId: new Recommendation().constructor.db.base.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: ["$isCompleted", 1, 0] } },
          pending: { $sum: { $cond: ["$isCompleted", 0, 1] } },
          byType: { $push: "$type" },
          byPriority: { $push: "$priority" }
        }
      }
    ]);

    const typeStats = await Recommendation.aggregate([
      { $match: { userId: new Recommendation().constructor.db.base.Types.ObjectId(userId) } },
      { $group: { _id: "$type", count: { $sum: 1 } } }
    ]);

    const priorityStats = await Recommendation.aggregate([
      { $match: { userId: new Recommendation().constructor.db.base.Types.ObjectId(userId) } },
      { $group: { _id: "$priority", count: { $sum: 1 } } }
    ]);

    const result = {
      total: stats[0]?.total || 0,
      completed: stats[0]?.completed || 0,
      pending: stats[0]?.pending || 0,
      completionRate: stats[0]?.total ? ((stats[0].completed / stats[0].total) * 100).toFixed(1) : 0,
      byType: typeStats.reduce((acc, item) => { acc[item._id] = item.count; return acc; }, {}),
      byPriority: priorityStats.reduce((acc, item) => { acc[item._id] = item.count; return acc; }, {})
    };

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Error getting recommendation stats:", error);
    res.status(500).json({ success: false, message: "Failed to get recommendation statistics" });
  }
};

// Trigger AI workflow for a specific journal
export const triggerAIWorkflow = async (req, res) => {
  try {
    const userId = req.user.id;
    const journalId = req.params.id;

    console.log(`🚀 Manual trigger of AI workflow for journal ${journalId}`);

    const result = await AIWorkflowService.processJournalWorkflow(journalId, userId);

    res.status(200).json(result);
  } catch (error) {
    console.error("Error triggering AI workflow:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to trigger AI workflow",
      error: error.message 
    });
  }
};

// Get recommendations by type
export const getRecommendationsByType = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type } = req.params;
    const { limit = 5, page = 1 } = req.query;

    const result = await AIWorkflowService.getUserRecommendations(userId, {
      type,
      limit: parseInt(limit),
      page: parseInt(page)
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Error getting recommendations by type:", error);
    res.status(500).json({ success: false, message: "Failed to get recommendations" });
  }
};

// Get high priority recommendations
export const getHighPriorityRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 5 } = req.query;

    const result = await AIWorkflowService.getUserRecommendations(userId, {
      priority: 'high',
      completed: false,
      limit: parseInt(limit),
      page: 1
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Error getting high priority recommendations:", error);
    res.status(500).json({ success: false, message: "Failed to get high priority recommendations" });
  }
};
