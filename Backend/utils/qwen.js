class QwenService {
  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || "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";
    this.baseUrl = "https://openrouter.ai/api/v1/chat/completions";
    this.model = "qwen/qwen2.5-vl-72b-instruct:free";
    this.siteUrl = "http://localhost:3000";
    this.siteName = "Zenium";

    // 🔍 DEBUGGING: Verify OpenRouter API configuration
    console.log('🔧 QwenService Constructor - Configuration Check:');
    console.log(`   📡 API Base URL: ${this.baseUrl}`);
    console.log(`   🤖 Model: ${this.model}`);
    console.log(`   🔑 API Key Configured: ${this.apiKey ? '✅ YES' : '❌ NO - MISSING OPENROUTER_API_KEY'}`);
    console.log(`   🌐 Site URL: ${this.siteUrl}`);
    console.log(`   🏷️  Site Name: ${this.siteName}`);

    if (!this.apiKey) {
      console.error('🚨 CRITICAL ERROR: OPENROUTER_API_KEY environment variable is not set!');
      console.error('   Please check your .env file in Backend directory.');
      console.error('   Expected: OPENROUTER_API_KEY=sk-or-v1-your-key-here');
    } else {
      console.log('✅ QwenService configuration looks good!');
    }
  }

  async makeRequest(messages) {
    try {
      if (!this.apiKey) {
        throw new Error("OPENROUTER_API_KEY is not configured");
      }

      // 🔍 DEBUGGING: Log API request details
      console.log(`\n📡 MAKING REQUEST TO OPENROUTER API:`);
      console.log(`   🔗 URL: ${this.baseUrl}`);
      console.log(`   🤖 Model: ${this.model}`);
      console.log(`   📝 Message count: ${messages.length}`);
      console.log(`   📏 Message length: ${messages[0].content[0].text.length} characters`);
      console.log(`   ⏰ Timestamp: ${new Date().toISOString()}`);

      console.log(`   🔑 Using API Key: ${this.apiKey.substring(0, 10)}...${this.apiKey.substring(this.apiKey.length - 4)}`);

      const requestBody = {
        model: this.model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000
      };

      console.log(`   🌡️ Temperature: ${requestBody.temperature}`);
      console.log(`   📊 Max tokens: ${requestBody.max_tokens}`);

      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "HTTP-Referer": this.siteUrl,
          "X-Title": this.siteName,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });

      console.log(`   📨 Response status: ${response.status} ${response.statusText}`);
      console.log(`   📨 Response headers:`, Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`\n❌ OPENROUTER API ERROR:`);
        console.error(`   🔴 Status: ${response.status} ${response.statusText}`);
        console.error(`   📄 Error details: ${errorText}`);
        throw new Error(`OpenRouter API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();

      console.log(`\n✅ OPENROUTER API SUCCESS:`);
      console.log(`   🟢 Response received successfully`);
      console.log(`   📦 Data structure:`, Object.keys(data));
      console.log(`   🤖 Has choices: ${data.choices ? 'YES' : 'NO'}`);
      console.log(`   📊 Choice count: ${data.choices?.length || 0}`);

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error(`❌ INVALID RESPONSE FORMAT:`);
        console.error(`   Expected: data.choices[0].message.content`);
        console.error(`   Received:`, JSON.stringify(data, null, 2));
        throw new Error("Invalid response format from OpenRouter API");
      }

      const content = data.choices[0].message.content;
      console.log(`📝 Content preview: ${content.substring(0, 100)}...`);
      console.log(`📏 Content length: ${content.length} characters`);

      return content;
    } catch (error) {
      console.error(`\n💥 CRITICAL ERROR IN makeRequest:`);
      console.error(`   🔥 Error type: ${error.constructor.name}`);
      console.error(`   💬 Error message: ${error.message}`);
      console.error(`   📍 Stack trace:`, error.stack);
      throw new Error(`Qwen API request failed: ${error.message}`);
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
