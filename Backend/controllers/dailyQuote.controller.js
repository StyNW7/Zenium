import DailyQuote from "../models/dailyQuote.model.js";
import QwenService from "../utils/qwen.js";

export const getCurrentDailyQuote = async (req, res) => {
  try {
    const latestQuote = await DailyQuote.findOne()
      .sort({ generatedAt: -1 })
      .limit(1);

    if (!latestQuote) {
      return res.status(404).json({ message: "No daily quote found" });
    }

    res.status(200).json(latestQuote);
  } catch (error) {
    console.error("Error fetching daily quote:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getDailyQuote = async (req, res) => {
  try {
    const { forceNew = false } = req.query;
    const userId = req.user?.userId; // From auth middleware
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Check if quote already exists for today
    let existingQuote = null;
    
    if (userId) {
      // For authenticated users, check personal quote
      existingQuote = await DailyQuote.findOne({
        userId: userId,
        generatedAt: {
          $gte: startOfDay,
          $lt: endOfDay
        }
      }).sort({ generatedAt: -1 });
    } else {
      // For anonymous users, get global daily quote
      existingQuote = await DailyQuote.findOne({
        userId: null, // Global quote
        generatedAt: {
          $gte: startOfDay,
          $lt: endOfDay
        }
      }).sort({ generatedAt: -1 });
    }

    // Return existing quote if found and not forcing new
    if (existingQuote && !forceNew) {
      return res.status(200).json({
        success: true,
        data: existingQuote,
        message: "Today's quote retrieved successfully"
      });
    }

    // Generate new quote using Qwen service
    const newQuoteData = await QwenService.generateDailyQuote();
    
    // Save to database
    const quoteRecord = new DailyQuote({
      userId: userId || null, // null for anonymous users (global quote)
      quote: newQuoteData.quote,
      explanation: newQuoteData.explanation,
      author: newQuoteData.author,
      isAiGenerated: true,
      generatedAt: new Date(),
      category: "motivation", // default category
      isFavorite: false
    });

    await quoteRecord.save();

    res.status(201).json({
      success: true,
      data: quoteRecord,
      message: "New daily quote generated successfully"
    });

  } catch (error) {
    console.error('Daily quote generation error:', error);
    
    // Return fallback quote on error
    const fallbackQuote = {
      quote: "Every day is a new beginning. Take a deep breath, smile, and start again.",
      explanation: "A gentle reminder that each day offers fresh opportunities for growth and positivity",
      author: "Unknown",
      isAiGenerated: false,
      generatedAt: new Date(),
      category: "motivation"
    };

    res.status(500).json({
      success: false,
      data: fallbackQuote,
      message: "Failed to generate quote, returning fallback quote",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getUserDailyQuotes = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const [quotes, totalCount] = await Promise.all([
      DailyQuote.find({ userId: userId })
        .sort({ generatedAt: -1 })
        .limit(parseInt(limit))
        .skip(skip),
      DailyQuote.countDocuments({ userId: userId })
    ]);

    res.status(200).json({
      success: true,
      data: {
        quotes: quotes,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalItems: totalCount,
          itemsPerPage: parseInt(limit)
        }
      },
      message: "User quotes retrieved successfully"
    });

  } catch (error) {
    console.error('Error fetching user quotes:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user quotes",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getQuoteByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const userId = req.user?.userId;

    const quote = await DailyQuote.findOne({
      ...(userId ? { userId: userId } : { userId: null }),
      category: category
    }).sort({ generatedAt: -1 });

    if (!quote) {
      // Generate new quote for this category
      const newQuoteData = await QwenService.generateDailyQuote(category);
      
      const quoteRecord = new DailyQuote({
        userId: userId || null,
        quote: newQuoteData.quote,
        explanation: newQuoteData.explanation,
        author: newQuoteData.author,
        isAiGenerated: true,
        generatedAt: new Date(),
        category: category,
        isFavorite: false
      });

      await quoteRecord.save();

      return res.status(201).json({
        success: true,
        data: quoteRecord,
        message: `New ${category} quote generated successfully`
      });
    }

    res.status(200).json({
      success: true,
      data: quote,
      message: `${category} quote retrieved successfully`
    });

  } catch (error) {
    console.error(`Error fetching ${req.params.category} quote:`, error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch category quote",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const markQuoteAsFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const quote = await DailyQuote.findOne({
      _id: id,
      userId: userId
    });

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: "Quote not found or not accessible"
      });
    }

    quote.isFavorite = !quote.isFavorite; // Toggle favorite status
    await quote.save();

    res.status(200).json({
      success: true,
      data: quote,
      message: `Quote ${quote.isFavorite ? 'added to' : 'removed from'} favorites`
    });

  } catch (error) {
    console.error('Error updating favorite status:', error);
    res.status(500).json({
      success: false,
      message: "Failed to update favorite status",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getFavoriteQuotes = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const [favoriteQuotes, totalCount] = await Promise.all([
      DailyQuote.find({
        userId: userId,
        isFavorite: true
      })
        .sort({ generatedAt: -1 })
        .limit(parseInt(limit))
        .skip(skip),
      DailyQuote.countDocuments({
        userId: userId,
        isFavorite: true
      })
    ]);

    res.status(200).json({
      success: true,
      data: {
        quotes: favoriteQuotes,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalItems: totalCount,
          itemsPerPage: parseInt(limit)
        }
      },
      message: "Favorite quotes retrieved successfully"
    });

  } catch (error) {
    console.error('Error fetching favorite quotes:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch favorite quotes",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const deleteQuote = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const quote = await DailyQuote.findOne({
      _id: id,
      userId: userId
    });

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: "Quote not found or not accessible"
      });
    }

    await DailyQuote.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Quote deleted successfully"
    });

  } catch (error) {
    console.error('Error deleting quote:', error);
    res.status(500).json({
      success: false,
      message: "Failed to delete quote",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getQuoteStats = async (req, res) => {
  try {
    const userId = req.user.userId;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get overall stats using aggregation
    const overallStats = await DailyQuote.aggregate([
      {
        $match: {
          userId: userId,
          generatedAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: null,
          totalQuotes: { $sum: 1 },
          favoriteCount: {
            $sum: { $cond: [{ $eq: ['$isFavorite', true] }, 1, 0] }
          },
          aiGeneratedCount: {
            $sum: { $cond: [{ $eq: ['$isAiGenerated', true] }, 1, 0] }
          }
        }
      }
    ]);

    // Get category stats using aggregation
    const categoryStats = await DailyQuote.aggregate([
      {
        $match: {
          userId: userId,
          generatedAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          count: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overall: overallStats[0] || { totalQuotes: 0, favoriteCount: 0, aiGeneratedCount: 0 },
        byCategory: categoryStats
      },
      message: "Quote statistics retrieved successfully"
    });

  } catch (error) {
    console.error('Error fetching quote stats:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch quote statistics",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};