import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import DailyQuote from "../models/dailyQuote.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seedDatabaseFromJSON() {
  try {
    console.log("Starting database seeding from JSON file...");

    // Check if database already has quotes
    const existingCount = await DailyQuote.countDocuments();
    if (existingCount > 0) {
      console.log(`Database already contains ${existingCount} quotes. Skipping seeding.`);
      return;
    }

    // Read quotes from JSON file
    const quotesPath = path.join(__dirname, "Quotes.json");
    const quotesData = fs.readFileSync(quotesPath, "utf8");
    const quotes = JSON.parse(quotesData);

    console.log(`Found ${quotes.length} quotes in JSON file`);

    // Seed the database
    const seededQuotes = [];
    for (const quoteData of quotes.slice(0, 100)) { // Limit to 100 quotes for initial seeding
      const quote = new DailyQuote({
        quote: quoteData.quote,
        explanation: quoteData.explanation,
        author: quoteData.author,
        category: quoteData.category,
        isAiGenerated: quoteData.isAiGenerated,
        generatedAt: new Date()
      });

      await quote.save();
      seededQuotes.push(quote);
    }

    console.log(`Successfully seeded database with ${seededQuotes.length} quotes`);

    // Get categories summary
    const categories = [...new Set(seededQuotes.map(q => q.category))];
    console.log(`Categories seeded: ${categories.join(", ")}`);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

// Run seeder if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabaseFromJSON().catch(console.error);
}

export default seedDatabaseFromJSON;
