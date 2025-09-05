import DailyQuote from "../models/dailyQuote.model.js";
import dailyQuoteService from "../services/dailyQuoteService.js";

export const getCurrentDailyQuote = async (req, res) => {
  try {
    const currentQuote = dailyQuoteService.getCurrentQuote();

    if (!currentQuote) {
      return res.status(404).json({ message: "No daily quote found" });
    }

    res.status(200).json({
      success: true,
      data: currentQuote,
      message: "Current daily quote retrieved successfully"
    });
  } catch (error) {
    console.error("Error fetching daily quote:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getDailyQuote = async (req, res) => {
  try {
    console.log('\n🍀 QUOTE PAGE REQUEST RECEIVED:');
    console.log(`   📊 Request method: ${req.method}`);
    console.log(`   👤 User authenticated: ${req.user ? 'YES' : 'NO'}`);
    console.log(`   🔑 User ID:`, req.user?.userId || 'ANONYMOUS');

    const { forceNew = false } = req.query;
    const userId = req.user?.userId || null;

    console.log(`   ⚙️ Force new quote: ${forceNew}`);

    // If forceNew is requested, refresh the daily quote (WITHOUT saving to DB)
    if (forceNew) {
      console.log('🔄 Refreshing to new quote (not saving to database)');
      await dailyQuoteService.refreshDailyQuote();

      // For authenticated users, only check history but don't auto-save
      if (userId) {
        console.log('👤 User authenticated - will load their saved quotes history separately');
      }
    }

    // Get the current daily quote from the service (no longer from DB)
    const currentQuote = dailyQuoteService.getCurrentQuote();

    if (!currentQuote) {
      return res.status(404).json({
        success: false,
        message: "No daily quote available"
      });
    }

    console.log(`\n✅ QUOTE RETRIEVED:`);
    console.log(`   💬 Quote: "${currentQuote.quote.substring(0, 80)}${currentQuote.quote.length > 80 ? '...' : ''}"`);
    console.log(`   ✍️  Author: ${currentQuote.author}`);
    console.log(`   🏷️  Category: ${currentQuote.category}`);
    console.log(`   🤖 From JSON: ${!currentQuote.isAiGenerated}`);

    // For authenticated users, check if this quote is already in their saved history
    // But note: This quote itself hasn't been saved yet - only if they click "Save Quote"
    let isInUserHistory = false;
    if (userId) {
      const existingUserQuote = await DailyQuote.findOne({
        userId: userId,
        quote: currentQuote.quote,
        generatedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
      });
      isInUserHistory = !!existingUserQuote;
    }

    console.log(`   📚 Is quote in user history: ${isInUserHistory}`);

    // Return quote data directly from memory (not from DB)
    const responseData = {
      ...currentQuote,
      isInUserHistory: isInUserHistory
    };

    res.status(200).json({
      success: true,
      data: responseData,
      message: forceNew ? "New daily quote generated!" : "Current daily quote retrieved successfully"
    });

  } catch (error) {
    console.error('Error fetching daily quote:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch daily quote",
      error: process.env.NODE_ENV === 'development' ? error.message : "Service temporarily unavailable"
    });
  }
};

// Helper function to save quote to user history
const createUserQuoteRecord = async (userId, quoteData, source) => {
  try {
    // Check if user already has this exact quote in the last 24 hours
    const existingQuote = await DailyQuote.findOne({
      userId: userId,
      quote: quoteData.quote,
      generatedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    if (existingQuote) {
      console.log('Quote already exists in user history, skipping duplicate');
      return existingQuote;
    }

    // Create new user quote record
    const savedQuote = new DailyQuote({
      userId: userId,
      quote: quoteData.quote,
      explanation: quoteData.explanation,
      author: quoteData.author,
      category: quoteData.category,
      isAiGenerated: quoteData.isAiGenerated || false,
      generatedAt: new Date(),
      isFavorite: false,
      moodContext: 'generated',
      activityContext: source
    });

    await savedQuote.save();
    console.log('✅ New quote saved to user history');
    return savedQuote;
  } catch (error) {
    console.error('Error saving quote to user history:', error);
    return null;
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

    console.log(`🔍 Getting quotes for category: ${category}`);

    // Get random quote from the requested category (from JSON, no DB save)
    const quotesInCategory = dailyQuoteService.getQuotesByCategory(category);

    if (quotesInCategory.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No quotes found for category "${category}"`
      });
    }

    // Pick a random quote from the category
    const randomIndex = Math.floor(Math.random() * quotesInCategory.length);
    const selectedQuote = quotesInCategory[randomIndex];

    // Create quote object in memory WITHOUT saving to database
    const quoteFromMemory = {
      _id: `temp-category-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      quote: selectedQuote.quote,
      explanation: selectedQuote.explanation,
      author: selectedQuote.author,
      category: selectedQuote.category,
      isAiGenerated: selectedQuote.isAiGenerated,
      generatedAt: new Date(),
      moodContext: 'category-request',
      activityContext: `category-${category}`
    };

    console.log(`✅ Generated quote from category "${category}": ${selectedQuote.author}`);
    console.log(`📝 Note: Quote NOT saved to database (temp ID: ${quoteFromMemory._id})`);

    res.status(200).json({
      success: true,
      data: quoteFromMemory,
      message: `Quote from ${category} category retrieved successfully`
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

export const createUserQuote = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { quote, author, explanation, source = 'Manual Save' } = req.body;

    // Validate required fields
    if (!quote || !quote.trim()) {
      return res.status(400).json({
        success: false,
        message: "Quote content is required"
      });
    }

    // Check if user already has this exact quote in their collection
    const existingQuote = await DailyQuote.findOne({
      userId: userId,
      quote: quote.trim()
    });

    if (existingQuote) {
      return res.status(409).json({
        success: false,
        message: "You already have this quote in your collection",
        data: existingQuote
      });
    }

    // Create new user quote record - no more one-quote limit for manual saves
    const savedQuote = new DailyQuote({
      userId: userId,
      quote: quote.trim(),
      author: author?.trim() || 'Unknown',
      explanation: explanation?.trim() || '',
      isAiGenerated: false,
      generatedAt: new Date(),
      category: 'user-collection',
      isFavorite: false,
      moodContext: '',
      activityContext: source
    });

    await savedQuote.save();

    res.status(201).json({
      success: true,
      data: savedQuote,
      message: "Quote saved to your collection successfully"
    });

  } catch (error) {
    console.error('Error saving user quote:', error);
    res.status(500).json({
      success: false,
      message: "Failed to save quote to collection",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getQuoteCategories = async (req, res) => {
  try {
    const categories = dailyQuoteService.getAllCategories();

    res.status(200).json({
      success: true,
      data: categories,
      message: "Quote categories retrieved successfully"
    });
  } catch (error) {
    console.error('Error fetching quote categories:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch quote categories",
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
