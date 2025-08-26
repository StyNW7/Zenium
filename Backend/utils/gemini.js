import { GoogleGenerativeAI } from "@google/generative-ai";

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  async generateDailyQuote() {
    try {
      const prompt = `Generate an inspirational daily quote for mental wellness and motivation. The quote should be uplifting, positive, and encouraging. Include:
      1. The quote itself (1-2 sentences)
      2. A brief explanation or context (1 sentence)
      3. An author name if applicable
      
      Format the response as JSON: {quote: string, explanation: string, author: string}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Try to parse JSON from response
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error("Failed to parse JSON from Gemini response:", parseError);
      }

      // Fallback: return the raw text as quote
      return {
        quote: text.trim(),
        explanation: "Daily inspiration for your mental wellness journey",
        author: "AI Companion"
      };
    } catch (error) {
      console.error("Gemini API error:", error);
      // Fallback quotes
      const fallbackQuotes = [
        {
          quote: "The greatest glory in living lies not in never falling, but in rising every time we fall.",
          explanation: "Remember that setbacks are opportunities for growth",
          author: "Nelson Mandela"
        },
        {
          quote: "Mental health is not a destination, but a process. It's about how you drive, not where you're going.",
          explanation: "Focus on the journey of self-care and growth",
          author: "Noam Shpancer"
        },
        {
          quote: "You yourself, as much as anybody in the entire universe, deserve your love and affection.",
          explanation: "Practice self-compassion and kindness",
          author: "Buddha"
        }
      ];
      return fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
    }
  }

  async analyzeJournalSentiment(content) {
    try {
      const prompt = `Analyze the following journal entry for sentiment and provide insights. Return JSON with:
      - sentiment: "positive", "negative", or "neutral"
      - keywords: array of 3-5 key emotional words
      - recommendations: array of 2-3 actionable suggestions for mental wellbeing
      
      Journal content: "${content.substring(0, 500)}"`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error("Failed to parse sentiment analysis JSON:", parseError);
      }

      return {
        sentiment: "neutral",
        keywords: ["reflection", "experience", "emotion"],
        recommendations: ["Consider practicing mindfulness", "Take time for self-care activities"]
      };
    } catch (error) {
      console.error("Gemini sentiment analysis error:", error);
      return {
        sentiment: "neutral",
        keywords: [],
        recommendations: []
      };
    }
  }

  async analyzeLocationMood(locationData) {
    try {
      const prompt = `Analyze this location for mental wellness factors. Return JSON with:
      - overallMood: "calming", "stressful", "neutral", or "energizing"
      - factors: array of positive and negative factors with scores
      - recommendations: suggestions for this location
      
      Location data: ${JSON.stringify(locationData)}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error("Failed to parse location analysis JSON:", parseError);
      }

      return {
        overallMood: "neutral",
        factors: [{ factor: "general area", score: 0.5 }],
        recommendations: ["This is a standard urban area"]
      };
    } catch (error) {
      console.error("Gemini location analysis error:", error);
      return {
        overallMood: "neutral",
        factors: [],
        recommendations: []
      };
    }
  }
}

export default new GeminiService();