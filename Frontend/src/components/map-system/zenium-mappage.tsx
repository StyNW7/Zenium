import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Search, Layers, Info, User, Smile, Frown, Loader } from 'lucide-react';
import { Map, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

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
  rating?: number;
  moodScore?: number;
  description?: string;
  services?: string[];
  distance?: number;
}

interface EnvironmentAnalysis {
  location: string;
  moodScore: number; // 0-100, higher is better mood
  factors: {
    greenery: number; // 0-100
    crowding: number; // 0-100, higher means more crowded
    noise: number; // 0-100, higher means more noisy
  };
  recommendation: string;
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
  const [environmentAnalysis, setEnvironmentAnalysis] = useState<EnvironmentAnalysis | null>(null);
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(false);

  // Mendapatkan lokasi pengguna
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        fetchNearbyLocations(latitude, longitude);
        analyzeEnvironment(latitude, longitude);
      },
      (error) => {
        console.error('Error getting location:', error);
        // Default ke Jakarta jika tidak bisa mendapatkan lokasi
        setUserLocation([-6.2088, 106.8456]);
        fetchNearbyLocations(-6.2088, 106.8456);
        analyzeEnvironment(-6.2088, 106.8456);
      }
    );
  }, []);

  // Fungsi untuk mendapatkan lokasi psikolog terdekat
  const fetchNearbyLocations = async (lat: number, lng: number) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      // Menggunakan API untuk mendapatkan lokasi terdekat
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/locations`, 
        {
          params: {
            lat,
            lng,
            radius: 10, // Radius pencarian dalam km
          },
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data && response.data.success) {
        // Transformasi data dari API ke format yang dibutuhkan frontend
        const apiLocations = response.data.data.map((loc: any) => ({
          id: loc._id,
          name: loc.name,
          type: loc.type,
          address: loc.address,
          lat: loc.location.coordinates[1], // GeoJSON menggunakan [lng, lat]
          lng: loc.location.coordinates[0],
          rating: loc.rating,
          moodScore: loc.moodScore || 75, // Default jika tidak ada
          description: loc.description,
          services: loc.services,
          // Hitung jarak dari lokasi pengguna (bisa diimplementasikan dengan formula haversine)
          distance: calculateDistance(lat, lng, loc.location.coordinates[1], loc.location.coordinates[0])
        }));
        
        setLocations(apiLocations);
      } else {
        throw new Error('Failed to fetch locations');
      }
    } catch (error) {
      console.error('Error fetching nearby locations:', error);
      // Jika terjadi error, gunakan data default untuk demo
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Fungsi untuk menghitung jarak antara dua titik koordinat (formula haversine)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius bumi dalam km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Jarak dalam km
    return parseFloat(distance.toFixed(1));
  };

  // Fungsi untuk menganalisis lingkungan sekitar
  const analyzeEnvironment = async (lat: number, lng: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      // Menggunakan API untuk analisis lingkungan
      // Catatan: Endpoint ini perlu dibuat di backend
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/environment/analyze`, 
        {
          params: { lat, lng },
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data && response.data.success) {
        setEnvironmentAnalysis(response.data.data);
      } else {
        // Jika API belum tersedia, gunakan data default
        const defaultAnalysis: EnvironmentAnalysis = {
          location: 'Area sekitar Anda',
          moodScore: 75,
          factors: {
            greenery: 60,
            crowding: 50,
            noise: 45,
          },
          recommendation: 'Tidak dapat menganalisis lingkungan saat ini. Silakan coba lagi nanti.'
        };
        setEnvironmentAnalysis(defaultAnalysis);
      }
    } catch (error) {
      console.error('Error analyzing environment:', error);
      // Jika terjadi error, gunakan data default
      const defaultAnalysis: EnvironmentAnalysis = {
        location: 'Area sekitar Anda',
        moodScore: 75,
        factors: {
          greenery: 60,
          crowding: 50,
          noise: 45,
        },
        recommendation: 'Tidak dapat menganalisis lingkungan saat ini. Silakan coba lagi nanti.'
      };
      setEnvironmentAnalysis(defaultAnalysis);
    }
  };

  // Filter lokasi berdasarkan pencarian
  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Menampilkan marker dengan warna berbeda berdasarkan tipe
  const getMarkerIcon = (type: string, moodScore?: number) => {
    let color = '#3388ff';
    
    switch (type) {
      case 'clinic':
      case 'counseling':
      case 'hospital':
        color = '#FFD700'; // Gold untuk layanan kesehatan mental
        break;
      case 'park':
        color = '#00C853'; // Hijau untuk taman
        break;
      case 'cafe':
        color = '#9C27B0'; // Ungu untuk kafe
        break;
      default:
        color = '#3388ff';
    }

    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background-color: ${color};
        border: 2px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 10px rgba(0,0,0,0.3);
      ">
        ${moodScore ? `<span style="color: white; font-size: 10px; font-weight: bold;">${Math.round(moodScore / 10)}</span>` : ''}
      </div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  // Menampilkan warna lingkaran mood berdasarkan skor
  const getMoodColor = (score: number) => {
    if (score >= 80) return '#00C853'; // Hijau untuk mood baik
    if (score >= 60) return '#FFD600'; // Kuning untuk mood sedang
    return '#FF3D00'; // Merah untuk mood buruk
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-black/80 backdrop-blur-md border-b border-yellow-500/20 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/main')}
              className="mr-4 p-2 rounded-full bg-yellow-500/10 hover:bg-yellow-500/20 transition-colors duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
              Zenium Map System
            </h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setShowAnalysisPanel(!showAnalysisPanel)}
              className={`p-2 rounded-full ${showAnalysisPanel ? 'bg-yellow-500/30' : 'bg-yellow-500/10'} hover:bg-yellow-500/20 transition-colors duration-300`}
              title="Analisis Lingkungan"
            >
              <Info className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setMapLayer(mapLayer === 'street' ? 'satellite' : 'street')}
              className="p-2 rounded-full bg-yellow-500/10 hover:bg-yellow-500/20 transition-colors duration-300"
              title="Ganti Tampilan Peta"
            >
              <Layers className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-4 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Cari lokasi atau jenis tempat..."
            className="w-full pl-10 pr-4 py-2 bg-gray-900/80 border border-yellow-500/20 rounded-lg focus:outline-none focus:border-yellow-500/50 text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Map Container */}
      <div className="pt-28 pb-4 px-4 h-screen">
        {loading ? (
          <div className="flex items-center justify-center h-full bg-gray-900/50 rounded-xl border border-yellow-500/20">
            <div className="flex flex-col items-center">
              <Loader className="w-10 h-10 text-yellow-500 animate-spin" />
              <p className="mt-4 text-gray-400">Memuat peta dan lokasi...</p>
            </div>
          </div>
        ) : (
          <div className="h-full relative rounded-xl overflow-hidden border border-yellow-500/20">
            {userLocation && (
              <Map
                ref={mapRef}
                center={userLocation}
                zoom={14}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url={mapLayer === 'street' 
                    ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                    : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                  }
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                {/* User Location Marker */}
                <Marker 
                  position={userLocation}
                  icon={L.divIcon({
                    className: 'custom-marker',
                    html: `<div style="
                      width: 24px;
                      height: 24px;
                      border-radius: 50%;
                      background-color: #1E88E5;
                      border: 3px solid white;
                      box-shadow: 0 0 10px rgba(0,0,0,0.5);
                    "></div>`,
                    iconSize: [24, 24],
                    iconAnchor: [12, 12],
                  })}
                >
                  <Popup>
                    <div className="text-center">
                      <p className="font-medium text-gray-900">Lokasi Anda</p>
                    </div>
                  </Popup>
                </Marker>

                {/* Mood Heatmap Circle */}
                {environmentAnalysis && (
                  <Circle
                    center={userLocation}
                    radius={500}
                    pathOptions={{
                      fillColor: getMoodColor(environmentAnalysis.moodScore),
                      fillOpacity: 0.2,
                      color: getMoodColor(environmentAnalysis.moodScore),
                      weight: 1,
                    }}
                  />
                )}

                {/* Location Markers */}
                {filteredLocations.map((location) => (
                  <Marker
                    key={location.id}
                    position={[location.lat, location.lng]}
                    icon={getMarkerIcon(location.type, location.moodScore)}
                    eventHandlers={{
                      click: () => setSelectedLocation(location),
                    }}
                  >
                    <Popup>
                      <div className="text-center">
                        <p className="font-medium text-gray-900">{location.name}</p>
                        <p className="text-sm text-gray-600">{location.address}</p>
                        {location.distance && (
                          <p className="text-xs text-gray-500 mt-1">{location.distance} km dari lokasi Anda</p>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </Map>
            )}

            {/* Environment Analysis Panel */}
            {showAnalysisPanel && environmentAnalysis && (
              <div className="absolute top-4 right-4 w-80 bg-black/90 backdrop-blur-md rounded-lg border border-yellow-500/30 p-4 shadow-xl">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-medium text-yellow-400">Analisis Lingkungan</h3>
                  <button 
                    onClick={() => setShowAnalysisPanel(false)}
                    className="p-1 rounded-full hover:bg-gray-800 transition-colors duration-300"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Mood Score</span>
                    <div className="flex items-center">
                      {environmentAnalysis.moodScore >= 70 ? (
                        <Smile className="w-4 h-4 text-green-400 mr-1" />
                      ) : (
                        <Frown className="w-4 h-4 text-yellow-400 mr-1" />
                      )}
                      <span 
                        className={`font-medium ${environmentAnalysis.moodScore >= 80 ? 'text-green-400' : environmentAnalysis.moodScore >= 60 ? 'text-yellow-400' : 'text-red-400'}`}
                      >
                        {environmentAnalysis.moodScore}/100
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Kehijauan</span>
                        <span>{environmentAnalysis.factors.greenery}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5">
                        <div 
                          className="bg-green-500 h-1.5 rounded-full" 
                          style={{ width: `${environmentAnalysis.factors.greenery}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Keramaian</span>
                        <span>{environmentAnalysis.factors.crowding}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5">
                        <div 
                          className="bg-yellow-500 h-1.5 rounded-full" 
                          style={{ width: `${environmentAnalysis.factors.crowding}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Kebisingan</span>
                        <span>{environmentAnalysis.factors.noise}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5">
                        <div 
                          className="bg-red-500 h-1.5 rounded-full" 
                          style={{ width: `${environmentAnalysis.factors.noise}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-300 leading-relaxed">
                  <p>{environmentAnalysis.recommendation}</p>
                </div>
              </div>
            )}

            {/* Selected Location Detail */}
            {selectedLocation && (
              <div className="absolute bottom-4 left-4 right-4 bg-black/90 backdrop-blur-md rounded-lg border border-yellow-500/30 p-4 shadow-xl">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-yellow-400">{selectedLocation.name}</h3>
                    <p className="text-sm text-gray-400">{selectedLocation.address}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedLocation(null)}
                    className="p-1 rounded-full hover:bg-gray-800 transition-colors duration-300"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="mt-3 flex items-center">
                  <div className="flex items-center mr-4">
                    <MapPin className="w-4 h-4 text-yellow-500 mr-1" />
                    <span className="text-sm text-gray-300">{selectedLocation.type.charAt(0).toUpperCase() + selectedLocation.type.slice(1)}</span>
                  </div>
                  {selectedLocation.distance && (
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-yellow-500 mr-1" />
                      <span className="text-sm text-gray-300">{selectedLocation.distance} km</span>
                    </div>
                  )}
                  {selectedLocation.moodScore && (
                    <div className="flex items-center ml-4">
                      {selectedLocation.moodScore >= 70 ? (
                        <Smile className="w-4 h-4 text-green-400 mr-1" />
                      ) : (
                        <Frown className="w-4 h-4 text-yellow-400 mr-1" />
                      )}
                      <span 
                        className={`text-sm ${selectedLocation.moodScore >= 80 ? 'text-green-400' : selectedLocation.moodScore >= 60 ? 'text-yellow-400' : 'text-red-400'}`}
                      >
                        Mood Score: {selectedLocation.moodScore}/100
                      </span>
                    </div>
                  )}
                </div>
                
                {selectedLocation.description && (
                  <p className="mt-3 text-sm text-gray-300">{selectedLocation.description}</p>
                )}
                
                {selectedLocation.services && selectedLocation.services.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-300 mb-1">Layanan:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedLocation.services.map((service, index) => (
                        <span 
                          key={index} 
                          className="text-xs bg-yellow-500/10 text-yellow-400 px-2 py-1 rounded-full"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-4 flex justify-end">
                  <button className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-lg transition-colors duration-300">
                    Petunjuk Arah
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};