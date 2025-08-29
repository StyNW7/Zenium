import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import router from "./routes/routes.js";
import cors from "cors";

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === "production";

// Middleware untuk parsing JSON
app.use(express.json());

// CORS configuration

let corsOptions;

if (process.env.NODE_ENV === "development") {
  corsOptions = {
    origin: (origin, callback) => {
      // Jika origin tidak ada (contoh: Postman, curl), izinkan
      if (!origin) return callback(null, true);
      return callback(null, true); // Semua origin diizinkan
    },
    credentials: true,
  };
} else {
  corsOptions = {
    credentials: true,
  };
  corsOptions.origin = "https://zenium-frontend.vercel.app";
}

const allowedOrigins = typeof corsOptions.origin === "string" ? corsOptions.origin : "*";

app.use(cors(corsOptions));

// API Routes with error handling
try {
  app.use("/api", router);
  console.log('✅ Routes loaded successfully');
} catch (routeError) {
  console.error('❌ Error loading routes:', routeError);
  console.error('This might be caused by invalid route patterns in routes.js');
}

// Global error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Server Error:', error.message);
  console.error('Stack:', error.stack);
  
  // CORS specific errors
  if (error.message.includes('CORS')) {
    return res.status(403).json({
      success: false,
      message: 'CORS policy violation',
      origin: req.headers.origin,
      allowedOrigins: allowedOrigins
    });
  }
  
  // General server errors
  res.status(500).json({
    success: false,
    message: isProduction ? 'Internal server error' : error.message
  });
});

// 404 handler for unmatched routes (avoid '*' pattern in Express 5)
app.use((req, res) => {
  console.log('❌ 404 - Route not found:', req.originalUrl);
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: ['/api/auth/login', '/api/auth/register']
  });
});

// Determine if running in serverless environment
const isServerless = !!process.env.VERCEL || process.env.SERVERLESS === "true";

// Serverless handler untuk Vercel
export default isServerless
  ? async (req, res) => {
      try {
        console.log('🚀 Vercel serverless handler invoked');
        console.log('Request:', req.method, req.url);
        await connectDB();
        return app(req, res);
      } catch (err) {
        console.error("❌ Serverless error:", err);
        return res.status(500).json({ 
          success: false,
          error: "Database connection failed",
          message: err.message
        });
      }
    }
  : app;

// Start HTTP server untuk local development
if (!isServerless) {
  (async () => {
    try {
      console.log('🗄️  Connecting to MongoDB...');
      await connectDB();
      console.log('✅ Database connected successfully');
      
      const server = app.listen(port, () => {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🚀 Zenium Backend Server Started');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`📍 Server URL: http://localhost:${port}`);
        console.log(`🔗 API Base: http://localhost:${port}/api`);
        console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🌐 Allowed Origins:`, allowedOrigins);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ Server ready to accept requests');
        console.log('💡 Test endpoints:');
        console.log('   - GET  http://localhost:' + port);
        console.log('   - POST http://localhost:' + port + '/api/auth/login');
        console.log('   - POST http://localhost:' + port + '/api/auth/register');
      });

      // Graceful shutdown
      process.on('SIGTERM', () => {
        console.log('🛑 SIGTERM received - shutting down gracefully');
        server.close(() => {
          console.log('✅ Server closed');
          process.exit(0);
        });
      });

    } catch (err) {
      console.error("❌ Failed to start server:", err);
      process.exit(1);
    }
  })();
}