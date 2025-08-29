import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import router from "./routes/routes.js";
import cors from "cors";

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware untuk parsing JSON
app.use(express.json());

// Improved environment detection
const isProduction = process.env.NODE_ENV === 'production';
const isVercel = !!process.env.VERCEL;
const isDevelopment = !isProduction || port == 3000;

// CORS origins configuration
let allowedOrigins;

if (isProduction && isVercel) {
  // Production di Vercel - hanya allow production URLs
  allowedOrigins = [
    'https://zenium-frontend.vercel.app',
    process.env.FRONTEND_URL,
    process.env.CORS_ORIGIN
  ].filter(Boolean); // Remove undefined values
} else {
  // Development atau local - allow localhost origins
  allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    // Include production URL for testing
    'https://zenium-frontend.vercel.app'
  ];
}

// Debug logging
console.log('🔧 Server Configuration:');
console.log('NODE_ENV:', process.env.NODE_ENV || 'undefined');
console.log('PORT:', port);
console.log('VERCEL:', process.env.VERCEL || 'false');
console.log('isProduction:', isProduction);
console.log('isDevelopment:', isDevelopment);
console.log('allowedOrigins:', allowedOrigins);

// CORS middleware with detailed logging
app.use(cors({
  origin: function (origin, callback) {
    console.log('🌐 CORS Request from origin:', origin || 'no-origin');
    
    // Allow requests with no origin (mobile apps, Postman, server-to-server)
    if (!origin) {
      console.log('✅ No origin header - allowing request');
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      console.log('✅ Origin allowed:', origin);
      return callback(null, true);
    }
    
    // In development, be more permissive for localhost
    if (isDevelopment && origin.includes('localhost')) {
      console.log('🔧 Development mode - allowing localhost origin:', origin);
      return callback(null, true);
    }
    
    // Log blocked requests for debugging
    console.log('❌ Origin blocked:', origin);
    console.log('Allowed origins:', allowedOrigins);
    
    return callback(new Error(`CORS policy: Origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Cache-Control'
  ],
  exposedHeaders: ['Authorization'],
  maxAge: 86400 // Cache preflight for 24 hours
}));

// Explicit preflight handling without path pattern (compatible with Express 5)
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    console.log('🔄 Preflight OPTIONS request for:', req.path);
    console.log('Origin:', req.headers.origin);

    const origin = req.headers.origin;
    if (!origin || allowedOrigins.includes(origin) || (isDevelopment && origin.includes('localhost'))) {
      res.header('Access-Control-Allow-Origin', origin || '*');
      res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
      res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,Accept,Origin,Cache-Control');
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Max-Age', '86400');
    }
    return res.sendStatus(200);
  }
  next();
});

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ 
    success: true,
    message: "Zenium API is running", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: port,
    cors: {
      allowedOrigins: allowedOrigins,
      requestOrigin: req.headers.origin
    }
  });
});

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
const isServerless = isVercel;

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