import DailyQuote from "../models/dailyQuote.model.js";
import QwenService from "../services/qwen.js";
import { Op } from "sequelize";

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
    const userId = req.user?.id; // From auth middleware
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Cek jika sudah ada quote hari ini untuk user
    let existingQuote = null;
    
    if (userId) {
      // For authenticated users, check personal quote
      existingQuote = await DailyQuote.findOne({
        where: {
          userId: userId,
          generatedAt: {
            [Op.gte]: startOfDay,
            [Op.lt]: endOfDay
          }
        },
        order: [['generatedAt', 'DESC']]
      });
    } else {
      // For anonymous users, get global daily quote
      existingQuote = await DailyQuote.findOne({
        where: {
          userId: null, // Global quote
          generatedAt: {
            [Op.gte]: startOfDay,
            [Op.lt]: endOfDay
          }
        },
        order: [['generatedAt', 'DESC']]
      });
    }

    // Return existing quote if found and not forcing new
    if (existingQuote && !forceNew) {
      return res.status(200).json({
        success: true,
        data: existingQuote,
        message: "Today's quote retrieved successfully"
      });
    }

    // Generate new quote using OpenRouter service
    const newQuoteData = await QwenService.generateDailyQuote();
    
    // Save to database
    const quoteRecord = await DailyQuote.create({
      userId: userId || null, // null for anonymous users (global quote)
      quote: newQuoteData.quote,
      explanation: newQuoteData.explanation,
      author: newQuoteData.author,
      isAiGenerated: true,
      generatedAt: new Date(),
      category: "motivation" // default category
    });

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
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const quotes = await DailyQuote.findAndCountAll({
      where: { userId: userId },
      order: [['generatedAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.status(200).json({
      success: true,
      data: {
        quotes: quotes.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(quotes.count / limit),
          totalItems: quotes.count,
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
    const userId = req.user?.id;

    const quote = await DailyQuote.findOne({
      where: {
        ...(userId ? { userId: userId } : { userId: null }),
        category: category
      },
      order: [['generatedAt', 'DESC']]
    });

    if (!quote) {
      // Generate new quote for this category
      const prompt = `Generate an inspirational quote specifically for ${category} category. Focus on themes related to ${category} and mental wellness.`;
      
      const newQuoteData = await QwenService.generateDailyQuote();
      
      const quoteRecord = await DailyQuote.create({
        userId: userId || null,
        quote: newQuoteData.quote,
        explanation: newQuoteData.explanation,
        author: newQuoteData.author,
        isAiGenerated: true,
        generatedAt: new Date(),
        category: category
      });

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
    const userId = req.user.id;

    const quote = await DailyQuote.findOne({
      where: {
        id: id,
        userId: userId
      }
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
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const favoriteQuotes = await DailyQuote.findAndCountAll({
      where: {
        userId: userId,
        isFavorite: true
      },
      order: [['generatedAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.status(200).json({
      success: true,
      data: {
        quotes: favoriteQuotes.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(favoriteQuotes.count / limit),
          totalItems: favoriteQuotes.count,
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
    const userId = req.user.id;

    const quote = await DailyQuote.findOne({
      where: {
        id: id,
        userId: userId
      }
    });

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: "Quote not found or not accessible"
      });
    }

    await quote.destroy();

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
    const userId = req.user.id;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const stats = await DailyQuote.findAll({
      where: {
        userId: userId,
        generatedAt: {
          [Op.gte]: thirtyDaysAgo
        }
      },
      attributes: [
        [DailyQuote.sequelize.fn('COUNT', DailyQuote.sequelize.col('id')), 'totalQuotes'],
        [DailyQuote.sequelize.fn('COUNT', DailyQuote.sequelize.literal('CASE WHEN isFavorite = true THEN 1 END')), 'favoriteCount'],
        [DailyQuote.sequelize.fn('COUNT', DailyQuote.sequelize.literal('CASE WHEN isAiGenerated = true THEN 1 END')), 'aiGeneratedCount']
      ],
      group: ['userId']
    });

    const categoryStats = await DailyQuote.findAll({
      where: {
        userId: userId,
        generatedAt: {
          [Op.gte]: thirtyDaysAgo
        }
      },
      attributes: [
        'category',
        [DailyQuote.sequelize.fn('COUNT', DailyQuote.sequelize.col('id')), 'count']
      ],
      group: ['category']
    });

    res.status(200).json({
      success: true,
      data: {
        overall: stats[0] || { totalQuotes: 0, favoriteCount: 0, aiGeneratedCount: 0 },
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