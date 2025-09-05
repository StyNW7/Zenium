import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import DailyQuote from "../models/dailyQuote.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DailyQuoteService {
  constructor() {
    this.allQuotes = [];
    this.currentQuote = null;
    this.initializeService(); // Keep sync for immediate use
    this.initializeDbAsync(); // Handle DB initialization asynchronously
  }

  // Synchronous initialization for immediate access
  initializeService() {
    try {
      // Load quotes from JSON file synchronously for immediate use
      const quotesPath = path.join(__dirname, "../seeders/Quotes.json");
      const quotesData = fs.readFileSync(quotesPath, "utf8");
      this.allQuotes = JSON.parse(quotesData);
      console.log(`Loaded ${this.allQuotes.length} quotes from JSON data`);

      // Set initial current quote from loaded data (immediate, without DB)
      if (this.allQuotes.length > 0) {
        const randomIndex = Math.floor(Math.random() * this.allQuotes.length);
        this.currentQuote = {
          _id: `temp-${Date.now()}`,
          quote: this.allQuotes[randomIndex].quote,
          explanation: this.allQuotes[randomIndex].explanation,
          author: this.allQuotes[randomIndex].author,
          category: this.allQuotes[randomIndex].category,
          isAiGenerated: this.allQuotes[randomIndex].isAiGenerated || false,
          generatedAt: new Date()
        };
        console.log("✅ Initial quote set for immediate use");
      } else {
        this.currentQuote = {
          _id: `temp-fallback-${Date.now()}`,
          quote: "Every step forward is a victory worth celebrating.",
          explanation: "Each small action contributes to your growth and demonstrates your courage.",
          author: "Ancient Wisdom",
          category: "motivation",
          isAiGenerated: false,
          generatedAt: new Date()
        };
      }
    } catch (error) {
      console.error("Error loading quotes from JSON:", error);

      // Emergency fallback
      this.allQuotes = [];
      this.currentQuote = {
        _id: `temp-error-${Date.now()}`,
        quote: "Progress is possible through consistent effort.",
        explanation: "Small, steady actions create meaningful change over time.",
        author: "Universal Truth",
        category: "motivation",
        isAiGenerated: false,
        generatedAt: new Date()
      };
    }
  }

  // Async database initialization (runs in background)
  async initializeDbAsync() {
    try {
      // Load quotes from database if available
      await this.ensureDatabaseHasQuotes();

      // Replace initial temp quote with DB quote if possible
      await this.loadRandomQuote(true); // Avoid recent quotes during init

      // But don't replace if DB fails - keep the JSON quote as backup
    } catch (error) {
      console.error("Background DB initialization failed, using JSON quotes:", error);
      // Keep the JSON quotes as fallback
    }
  }

  async loadQuotesFromJSON() {
    // No longer used - moved to synchronous initializeService()
    return null;
  }

  async ensureDatabaseHasQuotes() {
    try {
      const quoteCount = await DailyQuote.countDocuments();
      if (quoteCount === 0) {
        console.log("No quotes found in database, seeding with JSON data...");
        await this.seedDatabaseWithQuotes();
      }
    } catch (error) {
      console.error("Error checking database quotes:", error);
    }
  }

  async seedDatabaseWithQuotes(limit = 50) {
    try {
      const quotesToSeed = this.allQuotes.slice(0, limit);

      for (const quoteData of quotesToSeed) {
        const quote = new DailyQuote({
          quote: quoteData.quote,
          explanation: quoteData.explanation,
          author: quoteData.author,
          category: quoteData.category,
          isAiGenerated: quoteData.isAiGenerated,
          generatedAt: new Date()
        });
        await quote.save();
      }

      console.log(`Seeded database with ${quotesToSeed.length} quotes`);
    } catch (error) {
      console.error("Error seeding database:", error);
    }
  }

  // Ensure truly random quotes by avoiding recent ones and ensuring variety
  // NO LONGER SAVES TO DATABASE - ONLY RETURNS QUOTE DATA
  async loadRandomQuote(avoidRecent = false, excludedQuotes = []) {
    try {
      if (this.allQuotes.length === 0) {
        console.warn("No quotes loaded from JSON data");
        return null;
      }

      console.log(`🔍 Starting quote selection... Total quotes available: ${this.allQuotes.length}`);

      let availableQuotes = [...this.allQuotes]; // Create a copy to avoid modifying original

      // First, ensure we exclude the CURRENTLY DISPLAYED quote to guarantee a new one
      if (this.currentQuote) {
        console.log(`🎯 Excluding currently displayed quote from selection`);
        availableQuotes = availableQuotes.filter(quote => quote.quote.trim() !== this.currentQuote.quote.trim());
        console.log(`📄 After excluding current quote: ${availableQuotes.length} remaining`);
      }

      // Remove additional excluded quotes
      if (excludedQuotes.length > 0) {
        availableQuotes = availableQuotes.filter(quote => !excludedQuotes.includes(quote.quote));
        console.log(`📄 After removing additional excluded quotes: ${availableQuotes.length} remaining`);
      }

      // Avoid recent quotes to ensure variety
      if (avoidRecent && availableQuotes.length > 0) {
        try {
          // Get the most recent user-saved quotes from database to avoid repeats
          const recentQuotes = await DailyQuote.find({ userId: { $exists: true, $ne: null } })
            .sort({ generatedAt: -1 })
            .limit(10) // Check last 10 quotes to avoid immediate repeats
            .select('quote author');

          if (recentQuotes.length > 0) {
            const recentQuoteTexts = recentQuotes.map(q => q.quote.trim());
            const availableBeforeFilter = availableQuotes.length;

            availableQuotes = availableQuotes.filter(quote =>
              !recentQuoteTexts.includes(quote.quote.trim())
            );

            console.log(`🔄 Filtered out ${availableBeforeFilter - availableQuotes.length} recent database quotes`);
            console.log(`📄 Available unique quotes: ${availableQuotes.length}`);
          }
        } catch (dbError) {
          console.warn('⚠️ Database query for recent quotes failed, using all quotes:', dbError.message);
          // Continue with all quotes if DB query fails
        }
      }

      // If we somehow filtered out all quotes, reset but EXCLUDE current quote at minimum
      if (availableQuotes.length === 0) {
        console.log("🔄 No unique quotes available, resetting to full collection excluding current");
        availableQuotes = this.allQuotes.filter(quote => quote.quote.trim() !== (this.currentQuote?.quote?.trim() || ''));

        // If that still leaves nothing (only one quote in collection), fallback to all
        if (availableQuotes.length === 0) {
          console.log("⚠️ Only one quote in collection, allowing repeat as fallback");
          availableQuotes = [...this.allQuotes];
        }
      }

      // Select a truly random quote using better randomization
      const randomIndex = Math.floor(Math.random() * availableQuotes.length);
      const selectedQuoteData = availableQuotes[randomIndex];

      console.log(`🎲 Selected quote #${randomIndex + 1} of ${availableQuotes.length} available quotes`);
      console.log(`📖 Quote author: ${selectedQuoteData.author}`);
      console.log(`🏷️ Quote category: ${selectedQuoteData.category}`);

      // CREATE QUOTE OBJECT WITHOUT SAVING TO DATABASE
      const quoteWithoutSaving = {
        _id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        quote: selectedQuoteData.quote,
        explanation: selectedQuoteData.explanation,
        author: selectedQuoteData.author,
        category: selectedQuoteData.category,
        isAiGenerated: selectedQuoteData.isAiGenerated,
        generatedAt: new Date(),
        moodContext: 'generated',
        activityContext: 'random-selection'
      };

      this.currentQuote = quoteWithoutSaving;

      console.log(`✅ Successfully loaded new random quote (NOT saved to database)`);
      console.log(`💬 Quote preview: "${quoteWithoutSaving.quote.substring(0, 40)}${quoteWithoutSaving.quote.length > 40 ? '...' : ''}"`);

      return quoteWithoutSaving;

    } catch (error) {
      console.error("❌ Error loading random quote:", error.message);

      // Detailed error logging
      console.error("🔍 Error details:", {
        message: error.message,
        stack: error.stack?.split('\n')[0], // First line of stack trace
        availableQuotesCount: this.allQuotes?.length || 0
      });

      // Try fallback: get a quote from the JSON directly without database
      try {
        if (this.allQuotes.length > 0) {
          const fallbackIndex = Math.floor(Math.random() * this.allQuotes.length);
          const fallbackQuote = this.allQuotes[fallbackIndex];

          console.log("⚠️ Using JSON fallback quote");

          const fallbackQuoteWithoutSaving = {
            _id: `temp-fallback-${Date.now()}`,
            quote: fallbackQuote.quote,
            explanation: fallbackQuote.explanation,
            author: fallbackQuote.author,
            category: fallbackQuote.category,
            isAiGenerated: fallbackQuote.isAiGenerated,
            generatedAt: new Date(),
            moodContext: 'fallback',
            activityContext: 'emergency-random-selection'
          };

          this.currentQuote = fallbackQuoteWithoutSaving;
          return fallbackQuoteWithoutSaving;
        }
      } catch (fallbackError) {
        console.error("❌ Fallback quote generation also failed:", fallbackError.message);
      }

      console.error("🚨 No quotes available at all!");
      return null;
    }
  }

  getCurrentQuote() {
    return this.currentQuote;
  }

  getRandomQuote(excludeCategories = []) {
    try {
      if (this.allQuotes.length === 0) {
        return null;
      }

      // Filter out excluded categories
      let availableQuotes = this.allQuotes;
      if (excludeCategories.length > 0) {
        availableQuotes = this.allQuotes.filter(quote =>
          !excludeCategories.includes(quote.category)
        );
      }

      if (availableQuotes.length === 0) {
        availableQuotes = this.allQuotes; // Fall back to all quotes
      }

      const randomIndex = Math.floor(Math.random() * availableQuotes.length);
      return availableQuotes[randomIndex];
    } catch (error) {
      console.error("Error getting random quote:", error);
      return null;
    }
  }

  getQuotesByCategory(category) {
    try {
      return this.allQuotes.filter(quote =>
        quote.category.toLowerCase().includes(category.toLowerCase())
      );
    } catch (error) {
      console.error("Error filtering quotes by category:", error);
      return [];
    }
  }

  getAllCategories() {
    try {
      const categories = [...new Set(this.allQuotes.map(quote => quote.category))];
      return categories;
    } catch (error) {
      console.error("Error getting categories:", error);
      return [];
    }
  }

  async getQuoteHistory(days = 7) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      return await DailyQuote.find({
        generatedAt: { $gte: cutoffDate }
      }).sort({ generatedAt: -1 });
    } catch (error) {
      console.error("Error getting quote history:", error);
      return [];
    }
  }

  // Method to manually refresh the daily quote
  async refreshDailyQuote() {
    console.log('🔄 FORCE REFRESH: Generating completely new quote...');

    // Store current quote to ensure it's excluded
    const originalCurrentQuote = this.currentQuote;

    console.log(`🔄 Original current quote: "${originalCurrentQuote?.quote?.substring(0, 50)}${originalCurrentQuote?.quote?.length > 50 ? '...' : ''}"`);

    // Force a completely new quote selection by temporarily clearing current quote
    // This ensures loadRandomQuote will definitely pick something different
    this.currentQuote = null;

    try {
      // Load new quote with fresh start (avoidRecent=true)
      await this.loadRandomQuote(true);

      // Verify we got a different quote
      if (this.currentQuote?.quote === originalCurrentQuote?.quote) {
        console.log('❌ Same quote returned, forcing another random selection...');

        // Force another attempt, but ensure different result
        this.currentQuote = null;
        await this.loadRandomQuote(true, [originalCurrentQuote?.quote]);

        console.log(`✅ Second attempt result: "${this.currentQuote?.quote?.substring(0, 50)}${this.currentQuote?.quote?.length > 50 ? '...' : ''}"`);
      } else {
        console.log('✅ Refresh successful - different quote loaded');
      }

      console.log(`🔄 REFRESH COMPLETE: New quote loaded successfully`);

    } catch (error) {
      console.error('❌ Error during refresh:', error);
      // Restore original if something went wrong
      if (!this.currentQuote && originalCurrentQuote) {
        this.currentQuote = originalCurrentQuote;
      }
    }

    return this.currentQuote;
  }
}

export default new DailyQuoteService();
