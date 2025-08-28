import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Create geospatial indexes if they don't exist
    await createGeospatialIndexes();
    
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

const createGeospatialIndexes = async () => {
  try {
    // Create 2dsphere index for locations
    await mongoose.connection.db.collection('locations').createIndex(
      { location: "2dsphere" },
      { background: true }
    );
    console.log("✅ Geospatial index created for locations");
    
    // Create 2dsphere index for user analysis logs
    await mongoose.connection.db.collection('useranalysislogs').createIndex(
      { coordinates: "2dsphere" },
      { background: true }
    );
    console.log("✅ Geospatial index created for user analysis logs");
    
    // Create 2dsphere index for journals
    await mongoose.connection.db.collection('journals').createIndex(
      { "location.coordinates": "2dsphere" },
      { background: true }
    );
    console.log("✅ Geospatial index created for journals");
    
  } catch (error) {
    console.warn("⚠️ Some geospatial indexes may already exist:", error.message);
  }
};

export default connectDB;
