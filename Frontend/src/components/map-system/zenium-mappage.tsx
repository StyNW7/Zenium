import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, RefreshCw, XCircle, Filter, Brain, BarChart3, Layers, Menu, Loader, Star, Smile, Frown, Leaf, Droplets, Heart, Building, Car, CheckCircle, AlertCircle, Info, Share, Download, MapPin, User, TrendingUp, ArrowLeft, Clock, Upload
} from 'lucide-react';
import { AnalysisHistoryPanel } from './analysis-history-panel';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { captureMapScreenshot } from './captureMapScreenshot';

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface Location {
  id: string;
  name: string;
  type: string;
  address: string;
  lat: number;
  lng: number;
  rating: number;
  moodScore: number;
  description: string;
  services: string[];
  distance: number;
  latestAnalysis?: any;
  stats: {
    totalAnalyses: number;
    averagePeacefulnessScore: number;
    lastAnalyzed: string;
  };
}

interface MentalHealthAnalysis {
  peacefulnessScore: number;
  mentalHealthRating: {
    level: string;
    color: string;
    description: string;
    recommendation: string;
  };
  areaBreakdown: {
    greenNature: number;
    blueWater: number;
    whiteOpen: number;
    lightPeaceful: number;
    yellowRoads: number;
    grayBusy: number;
    brownBuildings: number;
    redIndustrial: number;
  };
  atmosphere: string;
  visualDetails: string;
  peacefulnessIndicators: string[];
  stressIndicators: string[];
  recommendations: {
    activities: string[];
    bestTimes: string[];
    concerns: string[];
    mentalHealthTips: string[];
  };
  personalizedInsights?: {
    suitability: string;
    personalizedTips: string[];
    warnings: string[];
  };
}

export function ZeniumMapPage() {
  const navigate = useNavigate();
  const mapRef = useRef<any>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapLayer, setMapLayer] = useState<'street' | 'satellite'>('street');
  const [loading, setLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<MentalHealthAnalysis | null>(null);
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    minRating: 0,
    minPeacefulnessScore: 0,
    verified: true,
    sortBy: 'rating'
  });
  const [userPreferences] = useState({
    anxietyLevel: 'moderate',
    prefersNature: true,
    sensitiveToNoise: false,
    needsWater: false
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get user location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        fetchNearbyLocations(latitude, longitude);
      },
      (error) => {
        console.error('Error getting location:', error);
        setUserLocation([-6.2088, 106.8456]);
        fetchNearbyLocations(-6.2088, 106.8456);
      }
    );
  }, [filters]);

  // Fetch nearby locations with enhanced filtering
  const fetchNearbyLocations = async (lat: number, lng: number) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
      
      const params = {
        lat,
        lng,
        radius: 10000,
        limit: 50,
        ...filters
      };
      
      const response = await axios.get(`${apiUrl}/locations`, {
        params,
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      if (response.data?.success) {
        const apiLocations = response.data.data.map((loc: any) => ({
          id: loc._id,
          name: loc.name,
          type: loc.type,
          address: loc.address,
          lat: loc.location.coordinates[1],
          lng: loc.location.coordinates[0],
          rating: loc.rating,
          moodScore: loc.moodScore || loc.stats?.averagePeacefulnessScore || 75,
          description: loc.description,
          services: loc.services,
          distance: loc.distance,
          latestAnalysis: loc.latestAnalysis,
          stats: loc.stats
        }));
        setLocations(apiLocations);
      } else {
        setLocations([]); // Clear locations on error
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
      setLocations([]); // Clear locations on error
    } finally {
      setLoading(false);
    }
  };

  // Capture and analyze current map view
  const analyzeCurrentView = useCallback(async () => {
    if (!mapRef.current || !userLocation) return;
    setAnalysisLoading(true);
    try {
      const map = mapRef.current;
      const [lat, lng] = userLocation;
      // Use captureMapScreenshot to get real screenshot and metadata
      const screenshotResult = await captureMapScreenshot(map, lat, lng, map.getZoom());
      if (!screenshotResult.success) throw new Error('Screenshot failed');
      const { imageBase64, metadata: imageMetadata } = screenshotResult;
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
      const response = await axios.post(`${apiUrl}/locations/analyze`, {
        imageBase64: `data:image/png;base64,${imageBase64}`,
        imageMetadata,
        coordinates: [lng, lat],
        userPreferences
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (response.data?.success) {
        setCurrentAnalysis(response.data.data.analysis);
        setShowAnalysisPanel(true);
      } else {
        setCurrentAnalysis(null);
        setShowAnalysisPanel(true);
      }
    } catch (error) {
      console.error('Error analyzing location:', error);
      setCurrentAnalysis(null);
      setShowAnalysisPanel(true);
    } finally {
      setAnalysisLoading(false);
    }
  }, [userLocation, userPreferences]);

  // Handle manual screenshot upload
  const handleUploadScreenshot = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setAnalysisLoading(true);
    try {
      // Read file as base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageBase64 = e.target?.result as string;
        const token = localStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
        // Dummy metadata, could be improved by asking user for info
        const imageMetadata = { width: 800, height: 600, scale: 2.5, uploaded: true };
        const response = await axios.post(`${apiUrl}/locations/analyze`, {
          imageBase64,
          imageMetadata,
          coordinates: userLocation ? [userLocation[1], userLocation[0]] : [0, 0],
          userPreferences
        }, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (response.data?.success) {
          setCurrentAnalysis(response.data.data.analysis);
          setShowAnalysisPanel(true);
        } else {
          setCurrentAnalysis(null);
          setShowAnalysisPanel(true);
        }
        setAnalysisLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setAnalysisLoading(false);
      setCurrentAnalysis(null);
      setShowAnalysisPanel(true);
      console.error('Error analyzing uploaded screenshot:', error);
    }
  };

  // Filter locations based on search and filters
  const filteredLocations = locations.filter(location => {
    const matchesSearch = location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         location.type.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = !filters.type || location.type === filters.type;
    const matchesRating = location.rating >= filters.minRating;
    const matchesPeacefulnessScore = location.moodScore >= filters.minPeacefulnessScore;
    
    return matchesSearch && matchesType && matchesRating && matchesPeacefulnessScore;
  });

  // Get enhanced marker icon
  const getEnhancedMarkerIcon = (location: Location) => {
    const colors: Record<string, string> = {
      clinic: '#FFD700',
      counseling: '#FF6B6B',
      park: '#00C853',
      cafe: '#9C27B0',
      hospital: '#F44336',
      therapy_center: '#E91E63',
      meditation_center: '#673AB7',
      default: '#2196F3'
    };
    
    const color = colors[location.type] || colors.default;
    const score = Math.round(location.moodScore / 10);
    
    return L.divIcon({
      className: 'enhanced-marker',
      html: `
        <div style="
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, ${color} 0%, ${color}CC 100%);
          border: 3px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          font-size: 12px;
          font-weight: bold;
          color: white;
          position: relative;
        ">
          ${score}
          <div style="
            position: absolute;
            bottom: -8px;
            right: -8px;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: ${location.stats.totalAnalyses > 0 ? '#4CAF50' : '#FFC107'};
            border: 2px solid white;
          "></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  };

  // Get mood circle for current analysis
  const getMoodCircle = () => {
    if (!currentAnalysis || !userLocation) return null;
    
    return (
      <Circle
        center={userLocation}
        radius={currentAnalysis.peacefulnessScore * 10} // Dynamic radius based on score
        pathOptions={{
          fillColor: currentAnalysis.mentalHealthRating.color,
          fillOpacity: 0.1,
          color: currentAnalysis.mentalHealthRating.color,
          weight: 2,
          dashArray: '10, 10'
        }}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white overflow-hidden">
      {/* Enhanced Responsive Header */}
      <div className="fixed top-0 left-0 right-0 z-20 bg-black/95 backdrop-blur-xl border-b border-amber-500/40 shadow-2xl">
        {/* Main Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center min-w-0 flex-1">
              <button
                onClick={() => navigate('/main')}
                className="mr-3 sm:mr-4 p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 transition-all duration-300 hover:scale-105 border border-amber-500/30 flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent truncate">
                  Zenium Mind Map
                </h1>
                <p className="text-xs sm:text-sm text-gray-300 hidden sm:block">AI-Powered Mental Health Analysis</p>
              </div>
            </div>
            {/* Upload Screenshot Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="ml-2 p-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/40 border border-blue-500/30 text-blue-300 flex items-center space-x-2"
              title="Upload Screenshot for AI Analysis"
            >
              <Upload className="w-5 h-5" />
              <span className="hidden sm:inline">Upload Screenshot</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              onChange={handleUploadScreenshot}
            />
            
            {/* Desktop Action Buttons */}
            <div className="hidden lg:flex items-center space-x-2">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`p-3 rounded-2xl transition-all duration-300 border ${
                  showFilters 
                    ? 'bg-amber-500/25 border-amber-500/50 text-amber-300' 
                    : 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20'
                }`}
                title="Filters"
              >
                <Filter className="w-5 h-5" />
              </button>
              
              <button 
                onClick={analyzeCurrentView}
                disabled={analysisLoading}
                className="p-3 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 transition-all duration-300 disabled:opacity-50 border border-emerald-500/30 text-emerald-400"
                title="Analyze Current View"
              >
                {analysisLoading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Brain className="w-5 h-5" />
                )}
              </button>
              
              <button 
                onClick={() => setShowAnalysisPanel(!showAnalysisPanel)}
                className={`p-3 rounded-2xl transition-all duration-300 border ${
                  showAnalysisPanel 
                    ? 'bg-blue-500/25 border-blue-500/50 text-blue-300' 
                    : 'bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20'
                }`}
                title="Analysis Panel"
              >
                <BarChart3 className="w-5 h-5" />
              </button>
              
              <button 
                onClick={() => setShowHistoryPanel(true)}
                className="p-3 rounded-2xl bg-orange-500/15 hover:bg-orange-500/25 transition-all duration-300 border border-orange-500/30 text-orange-400"
                title="Analysis History"
              >
                <Clock className="w-5 h-5" />
              </button>
              
              <button 
                onClick={() => setMapLayer(mapLayer === 'street' ? 'satellite' : 'street')}
                className="p-3 rounded-2xl bg-purple-500/15 hover:bg-purple-500/25 transition-all duration-300 border border-purple-500/30 text-purple-400"
                title="Toggle Map Layer"
              >
                <Layers className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 transition-all duration-300 border border-amber-500/30 text-amber-400"
            >
              {showMobileMenu ? <XCircle className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="lg:hidden border-t border-gray-800 bg-black/95">
            <div className="px-4 py-3">
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => {
                    setShowFilters(!showFilters);
                    setShowMobileMenu(false);
                  }}
                  className={`p-3 rounded-xl transition-all duration-300 border flex items-center justify-center space-x-2 ${
                    showFilters 
                      ? 'bg-amber-500/25 border-amber-500/50 text-amber-300' 
                      : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  <span className="text-sm">Filters</span>
                </button>
                
                <button 
                  onClick={() => {
                    analyzeCurrentView();
                    setShowMobileMenu(false);
                  }}
                  disabled={analysisLoading}
                  className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {analysisLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Brain className="w-4 h-4" />
                  )}
                  <span className="text-sm">Analyze</span>
                </button>
                
                <button 
                  onClick={() => {
                    setShowAnalysisPanel(!showAnalysisPanel);
                    setShowMobileMenu(false);
                  }}
                  className={`p-3 rounded-xl transition-all duration-300 border flex items-center justify-center space-x-2 ${
                    showAnalysisPanel 
                      ? 'bg-blue-500/25 border-blue-500/50 text-blue-300' 
                      : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span className="text-sm">Results</span>
                </button>
                
                <button 
                  onClick={() => {
                    setMapLayer(mapLayer === 'street' ? 'satellite' : 'street');
                    setShowMobileMenu(false);
                  }}
                  className="p-3 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center space-x-2"
                >
                  <Layers className="w-4 h-4" />
                  <span className="text-sm">Layer</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Responsive Search Bar */}
        <div className="px-4 sm:px-6 pb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none">
              <Search className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
            </div>
            <input
              type="text"
              placeholder="Search peaceful places, clinics..."
              className="w-full pl-12 sm:pl-14 pr-10 sm:pr-12 py-3 sm:py-4 bg-gray-900/90 border-2 border-amber-500/30 rounded-xl sm:rounded-2xl focus:outline-none focus:border-amber-500/60 focus:bg-gray-900/95 text-white placeholder-gray-400 transition-all duration-300 text-sm sm:text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-4 sm:pr-5 flex items-center"
              >
                <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 hover:text-amber-400 transition-colors" />
              </button>
            )}
          </div>
        </div>

        {/* Responsive Filters Panel */}
        {showFilters && (
          <div className="px-4 sm:px-6 pb-4">
            <div className="p-4 sm:p-6 bg-gray-900/90 rounded-xl sm:rounded-2xl border-2 border-amber-500/20 shadow-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-semibold text-amber-300 mb-3">Type</label>
                  <select 
                    value={filters.type}
                    onChange={(e) => setFilters({...filters, type: e.target.value})}
                    className="w-full p-3 bg-gray-800 border-2 border-gray-700 rounded-xl text-white focus:border-amber-500/50 transition-all duration-300 text-sm"
                  >
                    <option value="">All Types</option>
                    <option value="park">Parks</option>
                    <option value="clinic">Clinics</option>
                    <option value="cafe">Cafes</option>
                    <option value="counseling">Counseling</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-amber-300 mb-3">Min Rating</label>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.5"
                    value={filters.minRating}
                    onChange={(e) => setFilters({...filters, minRating: parseFloat(e.target.value)})}
                    className="w-full accent-amber-500"
                  />
                  <span className="text-sm text-gray-300">{filters.minRating} stars</span>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-amber-300 mb-3">Peacefulness</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filters.minPeacefulnessScore}
                    onChange={(e) => setFilters({...filters, minPeacefulnessScore: parseInt(e.target.value)})}
                    className="w-full accent-amber-500"
                  />
                  <span className="text-sm text-gray-300">{filters.minPeacefulnessScore}/100</span>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-amber-300 mb-3">Sort By</label>
                  <select 
                    value={filters.sortBy}
                    onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                    className="w-full p-3 bg-gray-800 border-2 border-gray-700 rounded-xl text-white focus:border-amber-500/50 transition-all duration-300 text-sm"
                  >
                    <option value="rating">Rating</option>
                    <option value="peacefulness">Peacefulness</option>
                    <option value="distance">Distance</option>
                    <option value="newest">Newest</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Responsive Map Container */}
      <div className="pt-28 sm:pt-36 lg:pt-40 pb-4 px-2 sm:px-4 h-screen">
        {loading ? (
          <div className="flex items-center justify-center h-full bg-gray-900/50 rounded-xl sm:rounded-2xl border border-yellow-500/20">
            <div className="flex flex-col items-center space-y-4 px-6 text-center">
              <div className="relative">
                <Loader className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-500 animate-spin" />
                <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 absolute top-2.5 sm:top-3 left-2.5 sm:left-3 animate-pulse" />
              </div>
              <div className="text-center">
                <p className="text-base sm:text-lg font-medium text-white">Loading Mind Map...</p>
                <p className="text-xs sm:text-sm text-gray-400">Analyzing mental health locations nearby</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full relative rounded-xl sm:rounded-2xl overflow-hidden border border-yellow-500/30 shadow-2xl">
            {userLocation && (
              <MapContainer
                ref={mapRef}
                center={userLocation}
                zoom={14}
                style={{ height: '100%', width: '100%' }}
                className="z-10"
              >
                <TileLayer
                  url={mapLayer === 'street' 
                    ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                    : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                  }
                  attribution='&copy; OpenStreetMap contributors'
                />
                
                {/* User Location */}
                <Marker 
                  position={userLocation}
                  icon={L.divIcon({
                    className: 'user-location-marker',
                    html: `
                      <div style="
                        width: 20px;
                        height: 20px;
                        border-radius: 50%;
                        background: radial-gradient(circle, #1E88E5 0%, #0D47A1 100%);
                        border: 4px solid white;
                        box-shadow: 0 0 20px rgba(30, 136, 229, 0.6);
                        animation: pulse 2s infinite;
                      "></div>
                      <style>
                        @keyframes pulse {
                          0% { box-shadow: 0 0 20px rgba(30, 136, 229, 0.6); }
                          50% { box-shadow: 0 0 30px rgba(30, 136, 229, 0.9); }
                          100% { box-shadow: 0 0 20px rgba(30, 136, 229, 0.6); }
                        }
                      </style>
                    `,
                    iconSize: [20, 20],
                    iconAnchor: [10, 10],
                  })}
                >
                  <Popup>
                    <div className="text-center p-2">
                      <p className="font-medium text-gray-900">Your Location</p>
                      <p className="text-sm text-gray-600">Mental health analysis center</p>
                    </div>
                  </Popup>
                </Marker>

                {/* Mood Circle */}
                {getMoodCircle()}

                {/* Location Markers */}
                {filteredLocations.map((location) => (
                  <Marker
                    key={location.id}
                    position={[location.lat, location.lng]}
                    icon={getEnhancedMarkerIcon(location)}
                    eventHandlers={{
                      click: () => setSelectedLocation(location),
                    }}
                  >
                    <Popup>
                      <div className="p-3 min-w-64">
                        <h3 className="font-medium text-gray-900 mb-1">{location.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{location.address}</p>
                        
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm font-medium">{location.rating || 'N/A'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Brain className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-medium text-blue-600">{location.moodScore}/100</span>
                          </div>
                        </div>
                        
                        {location.distance && (
                          <p className="text-xs text-gray-500">{location.distance} km away</p>
                        )}
                        
                        {location.stats?.totalAnalyses > 0 && (
                          <div className="mt-2 p-2 bg-green-50 rounded-lg">
                            <p className="text-xs text-green-700">
                              {location.stats.totalAnalyses} AI analyses available
                            </p>
                          </div>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            )}

            {/* Responsive Analysis Panel */}
            {showAnalysisPanel && currentAnalysis && (
              <div className="absolute top-2 sm:top-4 right-2 sm:right-4 w-full sm:w-96 max-w-sm sm:max-w-none bg-black/95 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-yellow-500/30 shadow-2xl overflow-hidden max-h-[calc(100vh-8rem)] sm:max-h-96">
                <div className="p-3 sm:p-4 border-b border-gray-800">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-yellow-400">Mental Health Analysis</h3>
                      <p className="text-xs sm:text-sm text-gray-400">AI-powered location assessment</p>
                    </div>
                    <button 
                      onClick={() => setShowAnalysisPanel(false)}
                      className="p-2 rounded-xl hover:bg-gray-800 transition-colors duration-300 flex-shrink-0"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <div className="p-3 sm:p-4 overflow-y-auto max-h-[calc(100vh-12rem)] sm:max-h-80">
                  {/* Peacefulness Score */}
                  <div className="mb-4 sm:mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs sm:text-sm font-medium text-gray-300">Peacefulness Score</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xl sm:text-2xl font-bold" style={{ color: currentAnalysis.mentalHealthRating.color }}>
                          {currentAnalysis.peacefulnessScore}
                        </span>
                        <span className="text-gray-400 text-sm">/100</span>
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-800 rounded-full h-2 sm:h-3 mb-2">
                      <div 
                        className="h-2 sm:h-3 rounded-full transition-all duration-1000 ease-out"
                        style={{ 
                          width: `${currentAnalysis.peacefulnessScore}%`,
                          backgroundColor: currentAnalysis.mentalHealthRating.color
                        }}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2 mb-3">
                      <div 
                        className="px-2 sm:px-3 py-1 rounded-full text-xs font-medium"
                        style={{ 
                          backgroundColor: `${currentAnalysis.mentalHealthRating.color}20`,
                          color: currentAnalysis.mentalHealthRating.color 
                        }}
                      >
                        {currentAnalysis.mentalHealthRating.level}
                      </div>
                      {currentAnalysis.peacefulnessScore >= 70 ? (
                        <Smile className="w-4 h-4 text-green-400" />
                      ) : (
                        <Frown className="w-4 h-4 text-orange-400" />
                      )}
                    </div>
                    
                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                      {currentAnalysis.mentalHealthRating.description}
                    </p>
                  </div>

                  {/* Area Breakdown */}
                  <div className="mb-4 sm:mb-6">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-300 mb-3">Environment Analysis</h4>
                    <div className="space-y-2 sm:space-y-3">
                       {Object.entries(currentAnalysis.areaBreakdown).map(([key, value]) => {
                         if (value === 0) return null;
                         
                         const labels: Record<string, { label: string; icon: JSX.Element; color: string }> = {
                           greenNature: { label: 'Nature & Parks', icon: <Leaf className="w-3 h-3 sm:w-4 sm:h-4" />, color: '#4CAF50' },
                           blueWater: { label: 'Water Bodies', icon: <Droplets className="w-3 h-3 sm:w-4 sm:h-4" />, color: '#2196F3' },
                           whiteOpen: { label: 'Open Spaces', icon: <Heart className="w-3 h-3 sm:w-4 sm:h-4" />, color: '#9E9E9E' },
                           lightPeaceful: { label: 'Quiet Areas', icon: <Heart className="w-3 h-3 sm:w-4 sm:h-4" />, color: '#8BC34A' },
                           brownBuildings: { label: 'Buildings', icon: <Building className="w-3 h-3 sm:w-4 sm:h-4" />, color: '#795548' },
                           yellowRoads: { label: 'Roads', icon: <Car className="w-3 h-3 sm:w-4 sm:h-4" />, color: '#FFC107' },
                           grayBusy: { label: 'Busy Areas', icon: <Car className="w-3 h-3 sm:w-4 sm:h-4" />, color: '#607D8B' }
                         };
                         
                         const item = labels[key];
                         if (!item) return null;
                        
                        return (
                          <div key={key}>
                            <div className="flex justify-between items-center mb-1">
                              <div className="flex items-center space-x-2">
                                <div style={{ color: item.color }}>
                                  {item.icon}
                                </div>
                                <span className="text-xs text-gray-400">{item.label}</span>
                              </div>
                              <span className="text-xs font-medium text-white">{value}%</span>
                            </div>
                            <div className="w-full bg-gray-800 rounded-full h-1.5">
                              <div 
                                className="h-1.5 rounded-full transition-all duration-500"
                                style={{ 
                                  width: `${value}%`,
                                  backgroundColor: item.color
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="mb-3 sm:mb-4">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-300 mb-3">Recommendations</h4>
                    
                    {currentAnalysis.recommendations.mentalHealthTips.length > 0 && (
                      <div className="space-y-2">
                        {currentAnalysis.recommendations.mentalHealthTips.slice(0, 3).map((tip, index) => (
                          <div key={index} className="flex items-start space-x-2 p-2 sm:p-3 bg-green-900/20 rounded-lg border border-green-500/20">
                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-gray-300 leading-relaxed">{tip}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Personalized Insights */}
                  {currentAnalysis.personalizedInsights && (
                    <div className="mb-3 sm:mb-4">
                      <h4 className="text-xs sm:text-sm font-medium text-gray-300 mb-3">Personal Insights</h4>
                      
                      {currentAnalysis.personalizedInsights.warnings?.length > 0 && (
                        <div className="mb-3 space-y-2">
                          {currentAnalysis.personalizedInsights.warnings.map((warning, index) => (
                            <div key={index} className="flex items-start space-x-2 p-2 sm:p-3 bg-orange-900/20 rounded-lg border border-orange-500/20">
                              <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                              <p className="text-xs text-gray-300">{warning}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {currentAnalysis.personalizedInsights.personalizedTips?.length > 0 && (
                        <div className="space-y-2">
                          {currentAnalysis.personalizedInsights.personalizedTips.map((tip, index) => (
                            <div key={index} className="flex items-start space-x-2 p-2 sm:p-3 bg-blue-900/20 rounded-lg border border-blue-500/20">
                              <Info className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                              <p className="text-xs text-gray-300">{tip}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex space-x-2 pt-3 sm:pt-4 border-t border-gray-800">
                    <button className="flex-1 p-2 sm:p-3 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 rounded-lg sm:rounded-xl transition-all duration-300 flex items-center justify-center space-x-2">
                      <Share className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="text-xs sm:text-sm font-medium">Share</span>
                    </button>
                    <button className="flex-1 p-2 sm:p-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg sm:rounded-xl transition-all duration-300 flex items-center justify-center space-x-2">
                      <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="text-xs sm:text-sm font-medium">Save</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Responsive Selected Location Detail */}
            {selectedLocation && (
              <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-auto sm:w-96 bg-black/95 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-yellow-500/30 shadow-2xl overflow-hidden max-h-[40vh] sm:max-h-none">
                <div className="p-3 sm:p-4 border-b border-gray-800">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-bold text-yellow-400 mb-1 truncate">{selectedLocation.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-400 truncate">{selectedLocation.address}</p>
                    </div>
                    <button 
                      onClick={() => setSelectedLocation(null)}
                      className="p-2 rounded-xl hover:bg-gray-800 transition-colors duration-300 flex-shrink-0 ml-2"
                    >
                      <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
                
                <div className="p-3 sm:p-4 overflow-y-auto max-h-[25vh] sm:max-h-none">
                  {/* Quick Stats */}
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="flex items-center space-x-2 sm:space-x-4">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
                        <span className="text-xs sm:text-sm text-gray-300 capitalize">{selectedLocation.type.replace('_', ' ')}</span>
                      </div>
                      
                      {selectedLocation.distance && (
                        <div className="flex items-center space-x-1">
                          <User className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                          <span className="text-xs sm:text-sm text-gray-300">{selectedLocation.distance} km</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      {selectedLocation.rating && (
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 fill-current" />
                          <span className="text-xs sm:text-sm font-medium text-white">{selectedLocation.rating}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-1">
                        <Brain className={`w-3 h-3 sm:w-4 sm:h-4 ${selectedLocation.moodScore >= 80 ? 'text-green-400' : selectedLocation.moodScore >= 60 ? 'text-yellow-400' : 'text-orange-400'}`} />
                        <span className={`text-xs sm:text-sm font-medium ${selectedLocation.moodScore >= 80 ? 'text-green-400' : selectedLocation.moodScore >= 60 ? 'text-yellow-400' : 'text-orange-400'}`}>
                          {selectedLocation.moodScore}/100
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Description */}
                  {selectedLocation.description && (
                    <p className="text-xs sm:text-sm text-gray-300 mb-3 sm:mb-4 leading-relaxed line-clamp-2 sm:line-clamp-none">{selectedLocation.description}</p>
                  )}
                  
                  {/* Services */}
                  {selectedLocation.services && selectedLocation.services.length > 0 && (
                    <div className="mb-3 sm:mb-4">
                      <p className="text-xs sm:text-sm font-medium text-gray-300 mb-2">Services & Amenities:</p>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {selectedLocation.services.slice(0, 4).map((service, index) => (
                          <span 
                            key={index} 
                            className="text-xs bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 text-yellow-300 px-2 sm:px-3 py-1 rounded-full border border-yellow-500/30"
                          >
                            {service}
                          </span>
                        ))}
                        {selectedLocation.services.length > 4 && (
                          <span className="text-xs text-gray-400 px-2 py-1">
                            +{selectedLocation.services.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Analysis Stats */}
                  {selectedLocation.stats && selectedLocation.stats.totalAnalyses > 0 && (
                    <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-lg sm:rounded-xl border border-green-500/20">
                      <div className="flex items-center justify-between mb-1 sm:mb-2">
                        <span className="text-xs sm:text-sm font-medium text-green-400">AI Analysis Available</span>
                        <span className="text-xs text-gray-400">
                          Last updated: {new Date(selectedLocation.stats.lastAnalyzed).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 sm:space-x-4">
                        <div className="flex items-center space-x-1">
                          <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                          <span className="text-xs sm:text-sm text-gray-300">{selectedLocation.stats.totalAnalyses} analyses</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                          <span className="text-xs sm:text-sm text-gray-300">Avg: {selectedLocation.stats.averagePeacefulnessScore}/100</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-medium rounded-lg sm:rounded-xl transition-all duration-300 transform hover:scale-[1.02] text-xs sm:text-sm">
                      Get Directions
                    </button>
                    <button 
                      onClick={() => {
                        // Trigger analysis for this specific location
                        setCurrentAnalysis(null); // Clear current analysis
                        setShowAnalysisPanel(true);
                      }}
                      className="px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 border border-blue-500/30 text-blue-300 font-medium rounded-lg sm:rounded-xl transition-all duration-300 flex items-center justify-center"
                    >
                      <Brain className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Responsive Quick Stats Overlay */}
            <div className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-black/90 backdrop-blur-xl rounded-lg sm:rounded-xl border border-yellow-500/20 p-2 sm:p-3">
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="text-center">
                  <p className="text-xs text-gray-400">Locations</p>
                  <p className="text-sm sm:text-lg font-bold text-yellow-400">{filteredLocations.length}</p>
                </div>
                <div className="w-px h-6 sm:h-8 bg-gray-700"></div>
                <div className="text-center">
                  <p className="text-xs text-gray-400">Avg Score</p>
                  <p className="text-sm sm:text-lg font-bold text-green-400">
                    {Math.round(filteredLocations.reduce((acc, loc) => acc + loc.moodScore, 0) / filteredLocations.length) || 0}
                  </p>
                </div>
                <div className="w-px h-6 sm:h-8 bg-gray-700"></div>
                <div className="text-center">
                  <p className="text-xs text-gray-400">Status</p>
                  <div className="flex items-center justify-center space-x-1">
                    {analysisLoading ? (
                      <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 animate-spin" />
                    ) : currentAnalysis ? (
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                    ) : (
                      <Brain className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Responsive Analysis Progress Indicator */}
            {analysisLoading && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-30">
                <div className="bg-black/90 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-yellow-500/30 p-6 sm:p-8 text-center mx-4">
                  <div className="relative mb-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin mx-auto"></div>
                    <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400 absolute top-3 sm:top-4 left-1/2 transform -translate-x-1/2" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-yellow-400 mb-2">Analyzing Mental Health Factors</h3>
                  <p className="text-xs sm:text-sm text-gray-400 mb-4">AI is processing environmental elements...</p>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Analysis History Panel */}
      <AnalysisHistoryPanel 
        isOpen={showHistoryPanel}
        onClose={() => setShowHistoryPanel(false)}
      />
    </div>
  );
}

