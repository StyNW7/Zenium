# Zenium Backend - Mental Health Location Analysis

Backend API untuk aplikasi Zenium yang menyediakan analisis kesehatan mental berdasarkan lokasi menggunakan AI.

## Fitur Geospatial

### 1. **Location Management**
- **CRUD Operations**: Create, Read, Update, Delete lokasi
- **Geospatial Queries**: Pencarian lokasi berdasarkan koordinat dan radius
- **Mental Health Analysis**: Analisis ketenangan lokasi menggunakan AI Qwen 2.5 VL
- **User Feedback**: Sistem rating dan review untuk lokasi

### 2. **Geospatial Endpoints**

#### Get Locations
```http
GET /api/locations?lat=-7.7971&lng=110.3694&radius=5000&type=park
```
**Query Parameters:**
- `lat, lng`: Koordinat latitude dan longitude
- `radius`: Radius pencarian dalam meter (default: 5000)
- `type`: Tipe lokasi (park, cafe, clinic, dll)
- `minRating`: Rating minimum
- `minPeacefulnessScore`: Skor ketenangan minimum
- `verified`: Filter lokasi terverifikasi
- `sortBy`: Sorting (rating, peacefulness, distance, newest)

#### Analyze Location Mental Health
```http
POST /api/locations/analyze
Content-Type: application/json

{
  "imageBase64": "data:image/png;base64,...",
  "imageMetadata": {
    "width": 800,
    "height": 600,
    "scale": 100
  },
  "coordinates": [110.3694, -7.7971],
  "userPreferences": {
    "anxietyLevel": "moderate",
    "prefersNature": true
  }
}
```

#### Get Top Peaceful Locations
```http
GET /api/locations/top-peaceful?limit=10
```

### 3. **Database Schema**

#### Location Model
```javascript
{
  name: String,
  type: String, // park, cafe, clinic, etc.
  location: {
    type: "Point",
    coordinates: [longitude, latitude] // MongoDB format
  },
  address: String,
  rating: Number,
  verified: Boolean,
  moodScore: Number,
  latestAnalysis: MentalHealthAnalysisSchema,
  analysisHistory: [MentalHealthAnalysisSchema],
  stats: {
    totalAnalyses: Number,
    averagePeacefulnessScore: Number,
    lastAnalyzed: Date
  }
}
```

#### User Analysis Log
```javascript
{
  userId: ObjectId,
  coordinates: [longitude, latitude],
  analysisResults: MentalHealthAnalysisSchema,
  userPreferences: Object,
  personalizedInsights: Object
}
```

### 4. **Geospatial Indexes**
- `locations.location`: 2dsphere index untuk query geospatial
- `useranalysislogs.coordinates`: 2dsphere index untuk history
- `journals.location.coordinates`: 2dsphere index untuk journal locations

### 5. **Mental Health Analysis**
- **Peacefulness Score**: 0-100 berdasarkan elemen visual
- **Area Breakdown**: Persentase elemen (green nature, blue water, dll)
- **Mental Health Rating**: EXCELLENT, GOOD, MODERATE, POOR, VERY_POOR
- **Personalized Insights**: Rekomendasi berdasarkan preferensi user

## Setup

1. **Install Dependencies**
```bash
npm install
```

2. **Environment Variables**
```env
MONGO_URI=mongodb://localhost:27017/zenium
OPENROUTER_API_KEY=your_openrouter_api_key
JWT_SECRET=your_jwt_secret
```

3. **Run Development Server**
```bash
npm run dev
```

4. **Seed Sample Data**
```bash
POST /api/locations/seed
Authorization: Bearer <admin_token>
```

## API Documentation

### Authentication
- JWT-based authentication
- Protected routes require valid token
- Admin routes require admin privileges

### Error Handling
- Comprehensive error responses
- Geospatial query error handling
- Validation for coordinates and parameters

### Rate Limiting
- Implement rate limiting for AI analysis endpoints
- Consider API usage costs for Qwen 2.5 VL

## Troubleshooting

### Geospatial Issues
1. **Index Error**: Pastikan 2dsphere indexes sudah dibuat
2. **Coordinate Format**: Gunakan format [longitude, latitude] untuk MongoDB
3. **Radius Limits**: Radius maksimal 50km untuk performa optimal

### AI Analysis Issues
1. **API Key**: Pastikan OPENROUTER_API_KEY valid
2. **Image Format**: Gunakan base64 PNG/JPG
3. **Image Size**: Batasi ukuran gambar untuk performa

## Performance Optimization

1. **Database Indexes**: Semua geospatial queries menggunakan 2dsphere indexes
2. **Query Optimization**: Limit dan pagination untuk large datasets
3. **Caching**: Consider Redis untuk frequently accessed data
4. **Image Processing**: Compress images sebelum analysis