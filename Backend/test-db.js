// Test script to verify MongoDB connection
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const testConnection = async () => {
  try {
    console.log('🔄 Testing MongoDB connection...');
    console.log('📍 Connection URI:', process.env.MONGO_URI ? 'Set' : 'Not set');

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
    });

    console.log('✅ MongoDB connected successfully!');
    console.log('📊 Database:', conn.connection.db.databaseName);
    console.log('🌐 Host:', conn.connection.host);
    console.log('📈 Ready state:', conn.connection.readyState);

    // Test basic operations
    const db = conn.connection.db;
    const collections = await db.collections();
    console.log('📋 Available collections:', collections.map(c => c.collectionName));

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    console.error('CodeName:', error.codeName);
    process.exit(1);
  }
};

testConnection();