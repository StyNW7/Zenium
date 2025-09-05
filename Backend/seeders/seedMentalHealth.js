import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import MentalHealthRecommendation from "../models/mentalHealthRecommendation.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seedMentalHealthRecommendations() {
  try {
    console.log("Starting mental health recommendations seeding...");

    // Check if database already has recommendations
    const existingCount = await MentalHealthRecommendation.countDocuments();
    if (existingCount > 0) {
      console.log(`Database already contains ${existingCount} mental health recommendations. Skipping seeding.`);
      return;
    }

    // Read recommendations from JSON file
    const recommendationsPath = path.join(__dirname, "mentalHealthRecommendations.json");
    const recommendationsData = fs.readFileSync(recommendationsPath, "utf8");
    const recommendations = JSON.parse(recommendationsData);

    console.log(`Found ${recommendations.length} mental health recommendations in JSON file`);

    // Seed the database
    const seededRecommendations = [];
    for (const recData of recommendations) {
      const recommendation = new MentalHealthRecommendation({
        title: recData.title,
        description: recData.description,
        reason: recData.reason,
        timeEstimate: recData.timeEstimate,
        type: recData.type,
        category: recData.category,
        difficulty: recData.difficulty,
        isActive: true
      });

      await recommendation.save();
      seededRecommendations.push(recommendation);
    }

    console.log(`Successfully seeded database with ${seededRecommendations.length} mental health recommendations`);

    // Get categories summary
    const categories = [...new Set(seededRecommendations.map(r => r.category))];
    console.log(`Categories seeded: ${categories.join(", ")}`);

    // Get types summary
    const types = [...new Set(seededRecommendations.map(r => r.type))];
    console.log(`Types seeded: ${types.join(", ")}`);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding mental health recommendations:", error);
    process.exit(1);
  }
}

// Run seeder if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedMentalHealthRecommendations().catch(console.error);
}

export default seedMentalHealthRecommendations;