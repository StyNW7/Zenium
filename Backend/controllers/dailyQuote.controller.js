import DailyQuote from "../models/dailyQuote.model.js";

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