import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Star, MapPin, User, Brain, Sparkles, Loader, Filter } from 'lucide-react';
import axios from 'axios';

interface Psychologist {
  id: string;
  name: string;
  specialization: string[];
  rating: number;
  experience: number;
  address: string;
  distance: number;
  price: string;
  availability: string[];
  description: string;
  photoUrl: string;
  matchScore: number;
}

interface UserPreference {
  specializations: string[];
  maxDistance: number;
  minRating: number;
  priceRange: string;
  availability: string[];
}

export function ZeniumRecommendationPage() {
  const navigate = useNavigate();
  const [psychologists, setPsychologists] = useState<Psychologist[]>([]);
  const [filteredPsychologists, setFilteredPsychologists] = useState<Psychologist[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [userPreferences, setUserPreferences] = useState<UserPreference>({
    specializations: [],
    maxDistance: 10,
    minRating: 4,
    priceRange: 'all',
    availability: [],
  });

  const specializations = [
    'Depression', 'Anxiety', 'Trauma', 'Stress', 'Relationships', 
    'Career', 'Family', 'Addiction', 'Children & Teens', 'General Mental Health'
  ];

  const availabilityOptions = [
    'Morning', 'Afternoon', 'Evening', 'Night', 'Weekend'
  ];

  const priceRanges = [
    { value: 'all', label: 'All Prices' },
    { value: 'low', label: '$10 - $20' },
    { value: 'medium', label: '$20 - $50' },
    { value: 'high', label: '$50+' },
  ];

  // Get user location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        fetchPsychologists(latitude, longitude);
      },
      (error) => {
        console.error('Error getting location:', error);
        // Default to Jakarta if location access fails
        setUserLocation([-6.2088, 106.8456]);
        fetchPsychologists(-6.2088, 106.8456);
      }
    );
  }, []);

  // Function to fetch psychologists data
  const fetchPsychologists = async (lat: number, lng: number) => {
    setLoading(true);
    try {
      // Get token from localStorage
      const token = localStorage.getItem('authToken');
      
      // Prepare API URL with query parameters
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/psychologists?lat=${lat}&lng=${lng}&radius=10`;
      
      // Make API request
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });
      
      if (response.data.success) {
        setPsychologists(response.data.data);
        setFilteredPsychologists(response.data.data);
      } else {
        console.error('Failed to fetch psychologists:', response.data.message);
        // Fallback to empty array if API fails
        setPsychologists([]);
        setFilteredPsychologists([]);
      }
    } catch (error) {
      console.error('Error fetching psychologists:', error);
      // Fallback to empty array if API fails
      setPsychologists([]);
      setFilteredPsychologists([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter psikolog berdasarkan pencarian dan preferensi
  useEffect(() => {
    let results = psychologists;

    // Filter berdasarkan pencarian
    if (searchQuery) {
      results = results.filter(psych => 
        psych.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        psych.specialization.some(spec => spec.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter berdasarkan preferensi
    if (userPreferences.specializations.length > 0) {
      results = results.filter(psych => 
        userPreferences.specializations.some(spec => 
          psych.specialization.includes(spec)
        )
      );
    }

    if (userPreferences.maxDistance < 10) {
      results = results.filter(psych => psych.distance <= userPreferences.maxDistance);
    }

    if (userPreferences.minRating > 0) {
      results = results.filter(psych => psych.rating >= userPreferences.minRating);
    }

    if (userPreferences.priceRange !== 'all') {
      results = results.filter(psych => {
        const price = parseInt(psych.price.replace(/\D/g, ''));
        switch (userPreferences.priceRange) {
          case 'low':
            return price >= 100000 && price < 200000;
          case 'medium':
            return price >= 200000 && price < 500000;
          case 'high':
            return price >= 500000;
          default:
            return true;
        }
      });
    }

    if (userPreferences.availability.length > 0) {
      results = results.filter(psych => 
        userPreferences.availability.some(avail => 
          psych.availability.includes(avail)
        )
      );
    }

    setFilteredPsychologists(results);
  }, [searchQuery, userPreferences, psychologists]);

  // Fungsi untuk mengubah preferensi
  const handleSpecializationChange = (spec: string) => {
    setUserPreferences(prev => {
      if (prev.specializations.includes(spec)) {
        return {
          ...prev,
          specializations: prev.specializations.filter(s => s !== spec)
        };
      } else {
        return {
          ...prev,
          specializations: [...prev.specializations, spec]
        };
      }
    });
  };

  const handleAvailabilityChange = (avail: string) => {
    setUserPreferences(prev => {
      if (prev.availability.includes(avail)) {
        return {
          ...prev,
          availability: prev.availability.filter(a => a !== avail)
        };
      } else {
        return {
          ...prev,
          availability: [...prev.availability, avail]
        };
      }
    });
  };

  // Render bintang rating
  const renderRatingStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />);
      } else if (i - 0.5 <= rating) {
        stars.push(<Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500 fill-opacity-50" />);
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-yellow-500" />);
      }
    }
    return stars;
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
              AI Recommendation System
            </h1>
          </div>
          
          <div className="flex items-center">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-full ${showFilters ? 'bg-yellow-500/30' : 'bg-yellow-500/10'} hover:bg-yellow-500/20 transition-colors duration-300`}
              title="Filter"
            >
              <Filter className="w-5 h-5" />
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
            placeholder="Cari psikolog atau spesialisasi..."
            className="w-full pl-10 pr-4 py-2 bg-gray-900/80 border border-yellow-500/20 rounded-lg focus:outline-none focus:border-yellow-500/50 text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-900/80 border border-yellow-500/20 rounded-lg">
            <h3 className="text-sm font-medium text-yellow-400 mb-3">Filter Berdasarkan</h3>
            
            <div className="mb-4">
              <h4 className="text-xs text-gray-400 mb-2">Spesialisasi</h4>
              <div className="flex flex-wrap gap-2">
                {specializations.map((spec) => (
                  <button
                    key={spec}
                    onClick={() => handleSpecializationChange(spec)}
                    className={`text-xs px-2 py-1 rounded-full transition-colors duration-300 ${userPreferences.specializations.includes(spec) ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="text-xs text-gray-400 mb-2">Jarak Maksimum</h4>
                <div className="flex items-center">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={userPreferences.maxDistance}
                    onChange={(e) => setUserPreferences(prev => ({ ...prev, maxDistance: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                  />
                  <span className="ml-2 text-sm">{userPreferences.maxDistance} km</span>
                </div>
              </div>
              
              <div>
                <h4 className="text-xs text-gray-400 mb-2">Rating Minimum</h4>
                <div className="flex items-center">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.5"
                    value={userPreferences.minRating}
                    onChange={(e) => setUserPreferences(prev => ({ ...prev, minRating: parseFloat(e.target.value) }))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                  />
                  <span className="ml-2 text-sm">{userPreferences.minRating}</span>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-xs text-gray-400 mb-2">Rentang Harga</h4>
              <div className="flex flex-wrap gap-2">
                {priceRanges.map((range) => (
                  <button
                    key={range.value}
                    onClick={() => setUserPreferences(prev => ({ ...prev, priceRange: range.value }))}
                    className={`text-xs px-2 py-1 rounded-full transition-colors duration-300 ${userPreferences.priceRange === range.value ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs text-gray-400 mb-2">Ketersediaan</h4>
              <div className="flex flex-wrap gap-2">
                {availabilityOptions.map((avail) => (
                  <button
                    key={avail}
                    onClick={() => handleAvailabilityChange(avail)}
                    className={`text-xs px-2 py-1 rounded-full transition-colors duration-300 ${userPreferences.availability.includes(avail) ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                  >
                    {avail}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className={`pt-${showFilters ? '96' : '28'} pb-4 px-4`}>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center">
              <Loader className="w-10 h-10 text-yellow-500 animate-spin" />
              <p className="mt-4 text-gray-400">Mencari psikolog terbaik untuk Anda...</p>
            </div>
          </div>
        ) : filteredPsychologists.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Brain className="w-16 h-16 text-gray-600 mb-4" />
            <h3 className="text-xl font-medium text-gray-400">Tidak ada psikolog yang sesuai</h3>
            <p className="text-gray-500 mt-2">Coba ubah filter atau kata kunci pencarian Anda</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* AI Recommendation Banner */}
            <div className="bg-gradient-to-r from-yellow-900/30 via-yellow-800/30 to-yellow-900/30 rounded-lg p-4 border border-yellow-500/30">
              <div className="flex items-start">
                <div className="p-2 bg-yellow-500/20 rounded-full mr-4">
                  <Sparkles className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-yellow-400">Rekomendasi AI Zenium</h3>
                  <p className="text-sm text-gray-300 mt-1">
                    Berdasarkan preferensi dan kebutuhan Anda, kami merekomendasikan psikolog berikut yang memiliki kecocokan tertinggi dengan profil Anda.
                  </p>
                </div>
              </div>
            </div>

            {/* Psychologist Cards */}
            {filteredPsychologists.map((psych) => (
              <div 
                key={psych.id} 
                className="bg-gray-900/50 rounded-lg overflow-hidden border border-yellow-500/20 hover:border-yellow-500/40 transition-colors duration-300"
              >
                <div className="p-4">
                  <div className="flex">
                    <div className="w-20 h-20 rounded-full overflow-hidden mr-4 border-2 border-yellow-500/30">
                      <img 
                        src={psych.photoUrl} 
                        alt={psych.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-medium text-white">{psych.name}</h3>
                        <div className="flex items-center bg-yellow-500/10 px-2 py-1 rounded-full">
                          <Sparkles className="w-3 h-3 text-yellow-500 mr-1" />
                          <span className="text-xs font-medium text-yellow-400">{psych.matchScore}% Match</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center mt-1">
                        {renderRatingStars(psych.rating)}
                        <span className="ml-2 text-sm text-gray-400">{psych.rating} ({psych.experience} tahun)</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-2">
                        {psych.specialization.map((spec, index) => (
                          <span 
                            key={index} 
                            className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <p className="text-sm text-gray-300">{psych.description}</p>
                    
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-yellow-500 mr-2" />
                        <span className="text-xs text-gray-400">{psych.address}</span>
                      </div>
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-yellow-500 mr-2" />
                        <span className="text-xs text-gray-400">{psych.distance} km dari lokasi Anda</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-yellow-400">{psych.price}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {psych.availability.map((time, index) => (
                            <span 
                              key={index} 
                              className="text-xs bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded-full"
                            >
                              {time}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <button className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-lg transition-colors duration-300">
                        Jadwalkan
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};