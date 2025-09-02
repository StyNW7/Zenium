class QwenService {
  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY;
    this.baseUrl = "https://openrouter.ai/api/v1/chat/completions";
    this.model = "qwen/qwen2.5-vl-72b-instruct:free";
    this.siteUrl = "http://localhost:3000";
    this.siteName = "Zenium";
  }

  async makeRequest(messages) {
    try {
      if (!this.apiKey) {
        throw new Error("OPENROUTER_API_KEY is not configured");
      }

      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "HTTP-Referer": this.siteUrl,
          "X-Title": this.siteName,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenRouter API error response:", errorText);
        throw new Error(`OpenRouter API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error("Invalid response format from OpenRouter API");
      }

      return data.choices[0].message.content;
    } catch (error) {
      console.error("OpenRouter API request failed:", error);
      throw new Error(`Qwen API request failed: ${error.message}`);
    }
  }

  async generateDailyQuote() {
    try {
      const messages = [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Generate an inspirational daily quote for mental wellness and motivation. The quote should be uplifting, positive, and encouraging. Include:
              1. The quote itself (1-2 sentences)
              2. A brief explanation or context (1 sentence)
              3. An author name if applicable
              
              Format the response as JSON: {"quote": "string", "explanation": "string", "author": "string"}`
            }
          ]
        }
      ];

      const responseText = await this.makeRequest(messages);
      
      // Try to parse JSON from response
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            quote: parsed.quote || responseText.trim(),
            explanation: parsed.explanation || "Daily inspiration for your mental wellness journey",
            author: parsed.author || "AI Companion"
          };
        }
      } catch (parseError) {
        console.error("Failed to parse JSON from OpenRouter response:", parseError);
      }

      // Fallback: return the raw text as quote
      return {
        quote: responseText.trim(),
        explanation: "Daily inspiration for your mental wellness journey",
        author: "AI Companion"
      };
    } catch (error) {
      console.error("OpenRouter API error:", error);
      
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
        },
        {
          quote: "Taking care of your mental health is not a luxury, it's a necessity.",
          explanation: "Prioritizing mental wellness is essential for overall wellbeing",
          author: "Anonymous"
        },
        {
          quote: "Progress, not perfection, is what we should strive for.",
          explanation: "Small steps forward matter more than being perfect",
          author: "Anonymous"
        }
      ];
      
      return fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
    }
  }

  async analyzeJournalSentiment(content) {
    try {
      const messages = [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze the following journal entry for sentiment and provide insights. Return JSON with:
              - sentiment: "positive", "negative", or "neutral"
              - keywords: array of 3-5 key emotional words
              - recommendations: array of 2-3 actionable suggestions for mental wellbeing
              
              Journal content: "${content.substring(0, 500)}"
              
              Format response as JSON: {"sentiment": "string", "keywords": ["array"], "recommendations": ["array"]}`
            }
          ]
        }
      ];

      const responseText = await this.makeRequest(messages);
      
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            sentiment: parsed.sentiment || "neutral",
            keywords: parsed.keywords || ["reflection", "experience", "emotion"],
            recommendations: parsed.recommendations || ["Consider practicing mindfulness", "Take time for self-care activities"]
          };
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
      console.error("OpenRouter sentiment analysis error:", error);
      return {
        sentiment: "neutral",
        keywords: ["general", "thoughts"],
        recommendations: ["Take time for self-reflection", "Practice mindfulness exercises"]
      };
    }
  }

  async analyzeLocationMood(locationData) {
    try {
      const messages = [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this location for mental wellness factors. Return JSON with:
              - overallMood: "calming", "stressful", "neutral", or "energizing"
              - factors: array of objects with "factor" and "score" (0-1) properties
              - recommendations: array of suggestions for this location
              
              Location data: ${JSON.stringify(locationData)}
              
              Format response as JSON: {"overallMood": "string", "factors": [{"factor": "string", "score": number}], "recommendations": ["array"]}`
            }
          ]
        }
      ];

      const responseText = await this.makeRequest(messages);
      
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            overallMood: parsed.overallMood || "neutral",
            factors: parsed.factors || [{ factor: "general area", score: 0.5 }],
            recommendations: parsed.recommendations || ["This is a standard urban area"]
          };
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
      console.error("OpenRouter location analysis error:", error);
      return {
        overallMood: "neutral",
        factors: [{ factor: "unknown area", score: 0.5 }],
        recommendations: ["Unable to analyze location at this time"]
      };
    }
  }

  // New method to analyze images (utilizing Qwen VL's vision capabilities)
  async analyzeImageMood(imageUrl, additionalContext = "") {
    try {
      const messages = [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this image for mental wellness and mood factors. Consider colors, lighting, environment, and overall atmosphere. Return JSON with:
              - overallMood: "calming", "stressful", "neutral", or "energizing"
              - visualFactors: array of visual elements that affect mood
              - moodScore: number between 1-10 (1=very negative, 10=very positive)
              - recommendations: suggestions based on the image content
              
              ${additionalContext ? `Additional context: ${additionalContext}` : ''}
              
              Format response as JSON: {"overallMood": "string", "visualFactors": ["array"], "moodScore": number, "recommendations": ["array"]}`
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl
              }
            }
          ]
        }
      ];

      const responseText = await this.makeRequest(messages);
      
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            overallMood: parsed.overallMood || "neutral",
            visualFactors: parsed.visualFactors || ["general visual elements"],
            moodScore: parsed.moodScore || 5,
            recommendations: parsed.recommendations || ["Consider the visual environment's impact on your mood"]
          };
        }
      } catch (parseError) {
        console.error("Failed to parse image analysis JSON:", parseError);
      }

      return {
        overallMood: "neutral",
        visualFactors: ["image content"],
        moodScore: 5,
        recommendations: ["Image analyzed but unable to provide specific insights"]
      };
    } catch (error) {
      console.error("OpenRouter image analysis error:", error);
      return {
        overallMood: "neutral",
        visualFactors: ["unable to analyze"],
        moodScore: 5,
        recommendations: ["Unable to analyze image at this time"]
      };
    }
  }

  // Method to describe what's in an image (general vision task)
  async describeImage(imageUrl, question = "What is in this image?") {
    try {
      const messages = [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: question
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl
              }
            }
          ]
        }
      ];

      const responseText = await this.makeRequest(messages);
      return responseText.trim();
    } catch (error) {
      console.error("OpenRouter image description error:", error);
      return "Unable to analyze the image at this time.";
    }
  }
}

export default new QwenService();