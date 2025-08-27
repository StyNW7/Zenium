import cron from "node-cron";
import DailyQuote from "../models/dailyQuote.model.js";
import geminiService from "../utils/gemini.js";

class DailyQuoteService {
  constructor() {
    this.currentQuote = null;
    this.initializeService();
  }

  async initializeService() {
    // Load latest quote on startup
    await this.loadLatestQuote();
    
    // Schedule daily quote generation at 00:00 UTC (07:00 WIB)
    cron.schedule("0 0 * * *", async () => {
      console.log("Generating daily quote...");
      await this.generateAndStoreDailyQuote();
    });

    console.log("Daily quote service initialized");
  }

  async generateAndStoreDailyQuote() {
    try {
      const quoteData = await geminiService.generateDailyQuote();
      
      const newQuote = new DailyQuote({
        quote: quoteData.quote,
        explanation: quoteData.explanation,
        author: quoteData.author || "AI Companion",
        generatedAt: new Date()
      });

      await newQuote.save();
      this.currentQuote = newQuote;
      
      console.log("Daily quote generated and stored:", quoteData.quote.substring(0, 50) + "...");
    } catch (error) {
      console.error("Error generating daily quote:", error);
    }
  }

  async loadLatestQuote() {
    try {
      const latestQuote = await DailyQuote.findOne()
        .sort({ generatedAt: -1 })
        .limit(1);
      
      if (latestQuote) {
        this.currentQuote = latestQuote;
        console.log("Loaded latest quote:", latestQuote.quote.substring(0, 50) + "...");
      } else {
        // If no quotes exist, generate one
        await this.generateAndStoreDailyQuote();
      }
    } catch (error) {
      console.error("Error loading latest quote:", error);
    }
  }

  getCurrentQuote() {
    return this.currentQuote;
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
}

export default new DailyQuoteService();