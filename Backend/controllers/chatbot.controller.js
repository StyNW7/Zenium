import { AzureOpenAI } from "openai";
import dotenv from "dotenv";

dotenv.config();

// Initialize Azure OpenAI client
let client;
if (process.env.NODE_ENV !== "test") {
  client = new AzureOpenAI({
    apiKey: process.env.AZURE_OPENAI_KEY,
    apiVersion: process.env.AZURE_API_VERSION || "2023-05-15",
    endpoint: process.env.AZURE_OPENAI_ENDPOINT,
  });
}

const DEPLOYMENT_NAME = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-35-turbo";

export const chatWithAI = async (req, res) => {
  if (!client) {
    return res.json({
      reply: "Mock response: Chatbot is disabled in test mode.",
      tokens_used: 0,
    });
  }

  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({
        error: "Message is required",
      });
    }
    const response = await client.chat.completions.create({
      model: DEPLOYMENT_NAME,
      messages: [
        { role: "system", content: "Anda adalah asisten yang membantu." },
        { role: "user", content: message },
      ],
    });
    const botReply = response.choices[0].message.content;
    const tokensUsed = response.usage?.total_tokens || null;
    res.json({
      reply: botReply,
      tokens_used: tokensUsed,
    });
  } catch (error) {
    console.error("Chatbot error:", error);
    res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
};
