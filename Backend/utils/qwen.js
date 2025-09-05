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

  // Enhanced method using comprehensive recommendations database
  async analyzeMentalHealthJournal(content) {
    try {
      // Load recommendations from JSON file
      const fs = await import('fs');
      const path = await import('path');
      const filePath = path.join(process.cwd(), 'Backend', 'utils', 'mentalHealthRecommendations.json');

      console.log('Looking for recommendations file at:', filePath);
      console.log('Current working directory:', process.cwd());

      if (!fs.existsSync(filePath)) {
        console.log('File not found, trying alternative path...');
        // Try alternative path
        const altFilePath = path.join(process.cwd(), 'utils', 'mentalHealthRecommendations.json');
        console.log('Trying alternative path:', altFilePath);

        if (!fs.existsSync(altFilePath)) {
          console.log('Alternative path also not found, using fallback recommendations');
          // Use fallback recommendations
          return this.getFallbackRecommendation(content);
        }

        const recommendationsData = JSON.parse(fs.readFileSync(altFilePath, 'utf8'));
        return this.processRecommendations(content, recommendationsData);
      }

      const recommendationsData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      return this.processRecommendations(content, recommendationsData);

      // Analyze content to determine emotion category
      const contentLower = content.toLowerCase();
      let detectedCategory = 'general';
      let highestMatchCount = 0;

      // Check each emotion category for keyword matches
      for (const [category, keywords] of Object.entries(recommendationsData.emotion_keywords)) {
        let matchCount = 0;
        for (const keyword of keywords) {
          if (contentLower.includes(keyword.toLowerCase())) {
            matchCount++;
          }
        }

        if (matchCount > highestMatchCount) {
          highestMatchCount = matchCount;
          detectedCategory = category;
        }
      }

      // Get recommendations for detected category
      const categoryRecommendations = recommendationsData.recommendations[detectedCategory] ||
                                     recommendationsData.recommendations['general'];

      if (!categoryRecommendations || categoryRecommendations.length === 0) {
        throw new Error('No recommendations found for category');
      }

      // Randomly select one recommendation from the category
      const randomIndex = Math.floor(Math.random() * categoryRecommendations.length);
      const selectedRecommendation = categoryRecommendations[randomIndex];

      // Create empathetic response based on detected category
      const empatheticResponses = {
        bullying: `🌿 Aku dengar ceritamu tentang situasi bullying. Itu pasti sangat menyakitkan dan membuatmu merasa tidak aman. Kamu nggak pantas diperlakukan seperti itu, dan perasaanmu itu sangat valid.`,
        stress: `🌿 Aku bisa merasakan kalau kamu sedang mengalami banyak tekanan dan stres. Itu wajar merasa overwhelmed, dan kamu sudah berusaha baik dengan menulis ini.`,
        anxiety: `🌿 Kecemasan bisa terasa sangat berat dan menguras energi. Aku mengerti kalau saat ini terasa sulit, tapi kamu nggak sendirian dalam menghadapinya.`,
        depression: `🌿 Perasaan sedih dan murung bisa terasa sangat berat. Kamu sudah berani mengakui perasaanmu, dan itu langkah yang sangat penting.`,
        loneliness: `🌿 Kesepian bisa terasa sangat menyakitkan. Aku mengerti kalau kamu merasa terisolasi, dan perasaan itu valid serta manusiawi.`,
        anger: `🌿 Kemarahan adalah emosi yang normal dan valid. Yang penting adalah bagaimana kita menanganinya dengan cara yang sehat.`,
        general: `🌿 Terima kasih sudah berbagi perasaanmu. Aku mengerti kalau saat ini terasa berat, dan kamu sudah melakukan hal yang baik dengan mengekspresikannya.`
      };

      const empatheticResponse = empatheticResponses[detectedCategory] || empatheticResponses.general;

      const fullResponse = `${empatheticResponse}

**Rekomendasi untuk hari ini:**
**${selectedRecommendation.title}** → ${selectedRecommendation.description}
*${selectedRecommendation.reason}* ⏱️ ${selectedRecommendation.timeEstimate}

Kamu nggak sendirian dalam perjalanan ini. Jika perasaan ini terus berlanjut atau terasa sangat berat, pertimbangkan untuk berbicara dengan orang terpercaya atau profesional. 💙`;

      return {
        success: true,
        recommendation: {
          title: selectedRecommendation.title,
          description: selectedRecommendation.description,
          reason: selectedRecommendation.reason,
          timeEstimate: selectedRecommendation.timeEstimate,
          type: selectedRecommendation.type,
          isCompleted: false,
          generatedAt: new Date().toISOString()
        },
        empatheticResponse: fullResponse,
        sentiment: detectedCategory,
        analyzedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error("Mental health analysis error:", error);
      return this.getFallbackRecommendation(content);
    }
  }

  // Helper method to process recommendations from JSON file
  processRecommendations(content, recommendationsData) {
    // Analyze content to determine emotion category
    const contentLower = content.toLowerCase();
    let detectedCategory = 'general';
    let highestMatchCount = 0;

    // Check each emotion category for keyword matches
    for (const [category, keywords] of Object.entries(recommendationsData.emotion_keywords)) {
      let matchCount = 0;
      for (const keyword of keywords) {
        if (contentLower.includes(keyword.toLowerCase())) {
          matchCount++;
        }
      }

      if (matchCount > highestMatchCount) {
        highestMatchCount = matchCount;
        detectedCategory = category;
      }
    }

    // Get recommendations for detected category
    const categoryRecommendations = recommendationsData.recommendations[detectedCategory] ||
                                  recommendationsData.recommendations['general'];

    if (!categoryRecommendations || categoryRecommendations.length === 0) {
      return this.getFallbackRecommendation(content);
    }

    // Randomly select one recommendation from the category
    const randomIndex = Math.floor(Math.random() * categoryRecommendations.length);
    const selectedRecommendation = categoryRecommendations[randomIndex];

    // Create empathetic response based on detected category
    const empatheticResponses = {
      bullying: `🌿 Aku dengar ceritamu tentang situasi bullying. Itu pasti sangat menyakitkan dan membuatmu merasa tidak aman. Kamu nggak pantas diperlakukan seperti itu, dan perasaanmu itu sangat valid.`,
      stress: `🌿 Aku bisa merasakan kalau kamu sedang mengalami banyak tekanan dan stres. Itu wajar merasa overwhelmed, dan kamu sudah berusaha baik dengan menulis ini.`,
      anxiety: `🌿 Kecemasan bisa terasa sangat berat dan menguras energi. Aku mengerti kalau saat ini terasa sulit, tapi kamu nggak sendirian dalam menghadapinya.`,
      depression: `🌿 Perasaan sedih dan murung bisa terasa sangat berat. Kamu sudah berani mengakui perasaanmu, dan itu langkah yang sangat penting.`,
      loneliness: `🌿 Kesepian bisa terasa sangat menyakitkan. Aku mengerti kalau kamu merasa terisolasi, dan perasaan itu valid serta manusiawi.`,
      anger: `🌿 Kemarahan adalah emosi yang normal dan valid. Yang penting adalah bagaimana kita menanganinya dengan cara yang sehat.`,
      general: `🌿 Terima kasih sudah berbagi perasaanmu. Aku mengerti kalau saat ini terasa berat, dan kamu sudah melakukan hal yang baik dengan mengekspresikannya.`
    };

    const empatheticResponse = empatheticResponses[detectedCategory] || empatheticResponses.general;

    const fullResponse = `${empatheticResponse}

**Rekomendasi untuk hari ini:**
**${selectedRecommendation.title}** → ${selectedRecommendation.description}
*${selectedRecommendation.reason}* ⏱️ ${selectedRecommendation.timeEstimate}

Kamu nggak sendirian dalam perjalanan ini. Jika perasaan ini terus berlanjut atau terasa sangat berat, pertimbangkan untuk berbicara dengan orang terpercaya atau profesional. 💙`;

    return {
      success: true,
      recommendation: {
        title: selectedRecommendation.title,
        description: selectedRecommendation.description,
        reason: selectedRecommendation.reason,
        timeEstimate: selectedRecommendation.timeEstimate,
        type: selectedRecommendation.type,
        isCompleted: false,
        generatedAt: new Date().toISOString()
      },
      empatheticResponse: fullResponse,
      sentiment: detectedCategory,
      analyzedAt: new Date().toISOString()
    };
  }

  // Fallback method when JSON file is not available
  getFallbackRecommendation(content) {
    // Determine basic sentiment from content
    const contentLower = content.toLowerCase();
    let sentiment = 'general';

    if (contentLower.includes('bully') || contentLower.includes('dibully')) {
      sentiment = 'bullying';
    } else if (contentLower.includes('stress') || contentLower.includes('tekanan')) {
      sentiment = 'stress';
    } else if (contentLower.includes('cemas') || contentLower.includes('anxious')) {
      sentiment = 'anxiety';
    } else if (contentLower.includes('sedih') || contentLower.includes('depresi')) {
      sentiment = 'depression';
    } else if (contentLower.includes('sendiri') || contentLower.includes('lonely')) {
      sentiment = 'loneliness';
    } else if (contentLower.includes('marah') || contentLower.includes('angry')) {
      sentiment = 'anger';
    }

    // Provide appropriate fallback recommendation
    const fallbackRecommendations = {
      bullying: {
        title: "Latihan Pernapasan 4-7-8",
        description: "Tarik napas melalui hidung selama 4 detik, tahan 7 detik, hembuskan melalui mulut selama 8 detik. Lakukan 4 kali.",
        reason: "Mengaktifkan sistem saraf parasimpatik untuk mengurangi stres dan kecemasan akibat bullying",
        timeEstimate: "2 menit",
        type: "breathing_exercise"
      },
      stress: {
        title: "Grounding Exercise",
        description: "Sebutkan 5 hal yang bisa kamu lihat, 4 yang bisa kamu sentuh, 3 yang bisa kamu dengar, 2 yang bisa kamu cium, 1 yang bisa kamu rasakan.",
        reason: "Membantu mengembalikan fokus ke masa kini dan mengurangi pikiran negatif",
        timeEstimate: "3 menit",
        type: "grounding_technique"
      },
      anxiety: {
        title: "Deep Breathing Exercise",
        description: "Tarik napas dalam-dalam melalui hidung selama 4 detik, tahan 4 detik, hembuskan perlahan melalui mulut selama 6 detik.",
        reason: "Pernapasan dalam membantu mengaktifkan sistem saraf parasimpatik untuk relaksasi",
        timeEstimate: "3 menit",
        type: "breathing_exercise"
      },
      depression: {
        title: "Gratitude Practice",
        description: "Tuliskan 3 hal yang kamu syukuri hari ini, meskipun terasa sulit.",
        reason: "Praktik rasa syukur membantu menggeser fokus dari negatif ke positif",
        timeEstimate: "5 menit",
        type: "gratitude_practice"
      },
      loneliness: {
        title: "Self-Compassion Statement",
        description: "Katakan pada dirimu: 'Aku layak mendapatkan dukungan dan kasih sayang.'",
        reason: "Self-compassion membantu mengurangi perasaan kesepian dengan memberikan dukungan internal",
        timeEstimate: "3 menit",
        type: "self_compassion"
      },
      anger: {
        title: "Anger Pause Technique",
        description: "Saat merasa marah, hentikan apa yang sedang dilakukan, hitung sampai 10.",
        reason: "Memberikan jeda untuk mencegah reaksi impulsif dan memungkinkan respons yang lebih bijaksana",
        timeEstimate: "1 menit",
        type: "pause_technique"
      },
      general: {
        title: "Mindfulness Moment",
        description: "Fokus pada napas Anda selama 2 menit. Jika pikiran melayang, lembut kembalikan perhatian ke napas.",
        reason: "Mindfulness membantu mengurangi stres dan meningkatkan kesadaran diri",
        timeEstimate: "2 menit",
        type: "mindfulness"
      }
    };

    const recommendation = fallbackRecommendations[sentiment] || fallbackRecommendations.general;

    const empatheticResponses = {
      bullying: `🌿 Aku dengar ceritamu tentang situasi bullying. Itu pasti sangat menyakitkan dan membuatmu merasa tidak aman. Kamu nggak pantas diperlakukan seperti itu.`,
      stress: `🌿 Aku bisa merasakan kalau kamu sedang mengalami banyak tekanan dan stres. Itu wajar merasa overwhelmed.`,
      anxiety: `🌿 Kecemasan bisa terasa sangat berat dan menguras energi. Kamu nggak sendirian dalam menghadapinya.`,
      depression: `🌿 Perasaan sedih dan murung bisa terasa sangat berat. Kamu sudah berani mengakui perasaanmu.`,
      loneliness: `🌿 Kesepian bisa terasa sangat menyakitkan. Aku mengerti kalau kamu merasa terisolasi.`,
      anger: `🌿 Kemarahan adalah emosi yang normal dan valid. Yang penting adalah bagaimana kita menanganinya.`,
      general: `🌿 Terima kasih sudah berbagi perasaanmu. Aku mengerti kalau saat ini terasa berat.`
    };

    const empatheticResponse = empatheticResponses[sentiment] || empatheticResponses.general;

    const fullResponse = `${empatheticResponse}

**Rekomendasi untuk hari ini:**
**${recommendation.title}** → ${recommendation.description}
*${recommendation.reason}* ⏱️ ${recommendation.timeEstimate}

Kamu nggak sendirian dalam perjalanan ini. Jika perasaan ini terus berlanjut atau terasa sangat berat, pertimbangkan untuk berbicara dengan orang terpercaya atau profesional. 💙`;

    return {
      success: false,
      error: "Menggunakan rekomendasi fallback",
      recommendation: {
        title: recommendation.title,
        description: recommendation.description,
        reason: recommendation.reason,
        timeEstimate: recommendation.timeEstimate,
        type: recommendation.type,
        isCompleted: false,
        generatedAt: new Date().toISOString()
      },
      empatheticResponse: fullResponse,
      sentiment: sentiment,
      analyzedAt: new Date().toISOString()
    };
  }
}

export default QwenService;

