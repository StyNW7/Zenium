# Zenium Backend - PeaceFinder API

## Overview

The Zenium backend now includes enhanced geospatial analysis capabilities through the **PeaceFinder** system, which uses AI-powered analysis to assess the peacefulness of locations for mental well-being.

## 🌿 PeaceFinder Features

### AI-Powered Analysis
- **Qwen2.5-VL Integration**: Multimodal AI model for analyzing map screenshots
- **Advanced Peacefulness Scoring**: Sophisticated algorithm considering multiple factors
- **Area Distribution Detection**: Analyzes green spaces, buildings, roads, and neutral areas
- **Smart Recommendations**: Context-aware suggestions for mental wellness activities

### Geospatial Intelligence
- **MongoDB Geospatial Indexing**: Efficient location-based queries
- **Coordinate-based Analysis**: Enhanced scoring based on geographic patterns
- **Nearby Analysis Discovery**: Find similar analyses in surrounding areas
- **Healing Spot Detection**: AI-identified calming locations within analyzed areas

### User Experience
- **Personal Analysis History**: Save and revisit analyzed locations
- **Real-time Processing**: Fast analysis with progress tracking
- **Image Upload Support**: Analyze custom map screenshots
- **Export Capabilities**: Save analysis results for future reference

## API Endpoints

### Analysis Routes

#### POST `/api/analysis/analyze`
Analyze a location for peacefulness score and recommendations.

**Request Body:**
```json
{
  "coordinates": [longitude, latitude],
  "address": "Location address",
  "mapImageUrl": "base64_image_data" // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "peacefulnessScore": 85,
    "peacefulnessLabel": "Very Peaceful",
    "areaDistribution": {
      "greenBlueSpaces": 45.2,
      "buildings": 25.8,
      "roads": 15.3,
      "neutral": 13.7
    },
    "aiAnalysis": {
      "description": "Detailed analysis description...",
      "recommendations": ["Recommendation 1", "Recommendation 2"],
      "healingSpots": [
        {
          "name": "Natural Sanctuary",
          "coordinates": [lng, lat],
          "reason": "High concentration of green spaces..."
        }
      ]
    },
    "location": {
      "type": "Point",
      "coordinates": [longitude, latitude]
    },
    "address": "Location address",
    "metadata": {
      "analysisDate": "2025-01-29T...",
      "modelVersion": "qwen2.5-vl-enhanced",
      "processingTime": 1250
    }
  }
}
```

#### POST `/api/analysis/upload`
Analyze a location with uploaded map image.

**Form Data:**
- `mapImage`: Image file (multipart/form-data)
- `coordinates`: JSON string of [longitude, latitude]
- `address`: Location address string

#### POST `/api/analysis/save`
Save analysis result to user's history.

**Request Body:** Analysis result object from analyze endpoint

#### GET `/api/analysis`
Get user's saved analyses with pagination.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 10)
- `sortBy`: Sort field (default: 'createdAt')
- `sortOrder`: 'asc' or 'desc' (default: 'desc')

#### GET `/api/analysis/:id`
Get specific analysis by ID.

#### DELETE `/api/analysis/:id`
Delete analysis from user's history.

#### GET `/api/analysis/nearby`
Get nearby analyses for recommendations.

**Query Parameters:**
- `lat`: Latitude
- `lng`: Longitude
- `radius`: Search radius in meters (default: 5000)
- `limit`: Maximum results (default: 10)

## Peacefulness Scoring Algorithm

The enhanced scoring system considers multiple factors:

### Base Weights
- **Green/Blue Spaces**: +0.45 (parks, water bodies, forests)
- **Neutral Areas**: +0.15 (open spaces, residential areas)
- **Buildings**: -0.25 (urban density, potential stress)
- **Roads**: -0.35 (traffic noise, pollution)

### Additional Factors
- **Location Modifiers**: Geographic patterns and known peaceful areas
- **Balance Bonus**: Reward for harmonious area distribution
- **Coordinate Analysis**: Enhanced scoring based on location characteristics

### Score Ranges
- **75-100**: Very Peaceful - Ideal for meditation, relaxation
- **50-74**: Moderately Peaceful - Good for light activities
- **0-49**: Less Peaceful - Requires coping strategies

## Database Schema

### Analysis Model
```javascript
{
  userId: ObjectId,
  location: {
    type: "Point",
    coordinates: [longitude, latitude]
  },
  address: String,
  mapImageUrl: String,
  peacefulnessScore: Number (0-100),
  peacefulnessLabel: String,
  areaDistribution: {
    greenBlueSpaces: Number,
    buildings: Number,
    roads: Number,
    neutral: Number
  },
  aiAnalysis: {
    description: String,
    recommendations: [String],
    healingSpots: [{
      name: String,
      coordinates: [Number],
      reason: String
    }]
  },
  metadata: {
    analysisDate: Date,
    modelVersion: String,
    processingTime: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Environment Variables

Add these to your `.env` file:

```env
# Qwen AI API Configuration (optional)
QWEN_API_URL=https://api.qwen.com/v1/vision
QWEN_API_KEY=your_qwen_api_key

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/zenium

# Other existing variables...
```

## Installation & Setup

1. Install dependencies:
```bash
npm install
```

2. Create uploads directory:
```bash
mkdir uploads
```

3. Start the server:
```bash
npm run dev
```

## File Structure

```
Backend/
├── controllers/
│   ├── analysis.controller.js    # PeaceFinder analysis logic
│   └── ...
├── models/
│   ├── analysis.model.js         # Analysis data schema
│   └── ...
├── services/
│   └── mapAnalysis.service.js    # Enhanced analysis algorithms
├── middleware/
│   └── upload.js                 # File upload handling
├── uploads/                      # Temporary image storage
└── ...
```

## Usage Examples

### Frontend Integration

```javascript
// Analyze a location
const analyzeLocation = async (coordinates, address) => {
  const response = await axios.post('/api/analysis/analyze', {
    coordinates,
    address
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Save analysis
const saveAnalysis = async (analysisData) => {
  const response = await axios.post('/api/analysis/save', analysisData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Get user's analysis history
const getAnalysisHistory = async () => {
  const response = await axios.get('/api/analysis', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
```

## Contributing

When adding new features to PeaceFinder:

1. Update the analysis service with new algorithms
2. Extend the database schema if needed
3. Add appropriate API endpoints
4. Update this documentation
5. Test with various location types

## License

This project is part of the Zenium mental wellness platform.