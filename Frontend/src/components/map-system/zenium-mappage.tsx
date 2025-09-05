/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Search, Brain, Save, Loader, History, X, Trash2, Eye, LocateFixed, Menu } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import Swal from 'sweetalert2';

// Helpers
const getAuthToken = (): string | null => {
  // Ambil dari localStorage dan sanitasi - prioritasi authToken dari context
  const raw = localStorage.getItem('authToken') ?? localStorage.getItem('token');
  if (!raw) return null;
  let t = raw.trim();
  // Jika token tersimpan pakai tanda kutip (mis. JSON.stringify token string)
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    t = t.slice(1, -1);
  }
  // Jika token sudah mengandung "Bearer " di depan, buang prefix-nya
  if (t.toLowerCase().startsWith('bearer ')) {
    t = t.slice(7).trim();
  }
  return t || null;
};

const notify = async (
  icon: 'success' | 'error' | 'warning' | 'info' | 'question',
  title: string,
  text?: string
) => {
  try {
    await Swal.fire({ icon, title, text });
  } catch {
    alert(`${title}${text ? `\n${text}` : ''}`);
  }
};

const confirmDialog = async (title: string, text?: string) => {
  try {
    const res = await Swal.fire({
      icon: 'warning',
      title,
      text,
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'Cancel',
    });
    return res.isConfirmed;
  } catch {
    return confirm(title);
  }
};

// Fix Leaflet default icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface AnalysisResult {
  peacefulnessScore: number;
  peacefulnessLabel: string;
  areaDistribution: {
    greenBlueSpaces: number;
    buildings: number;
    roads: number;
    neutral: number;
  };
  aiAnalysis: {
    description: string;
    recommendations: string[];
    healingSpots: Array<{
      name: string;
      coordinates: [number, number];
      reason: string;
    }>;
  };
  location: {
    coordinates: [number, number];
  };
  address: string;
}

interface SavedAnalysis {
  _id: string;
  peacefulnessScore: number;
  peacefulnessLabel: string;
  address: string;
  location: {
    coordinates: [number, number];
  };
  createdAt: string;
}

interface Suggestion {
  display_name: string;
  lat: string;
  lon: string;
}

export function ZeniumMapPage() {
  const navigate = useNavigate();
  const mapRef = useRef<any>(null);

  // Geospatial state
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [pinnedLocation, setPinnedLocation] = useState<[number, number] | null>(null);
  const [pinnedAddress, setPinnedAddress] = useState('');

  // UI state
  const [loading, setLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPinModeEnabled, setIsPinModeEnabled] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Analysis
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceTimer = useRef<number | null>(null);

  const apiUrl = useMemo(
    () => import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
    []
  );

  // Geolocation
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation([latitude, longitude]);
        setLoading(false);
      },
      async () => {
        await notify('warning', 'Location disabled', 'Using Jakarta as default.');
        setUserLocation([-6.2088, 106.8456]);
        setLoading(false);
      }
    );
  }, []);

  // Load history
  useEffect(() => {
    (async () => {
      try {
        const token = getAuthToken();
        if (!token) return;
        const res = await axios.get(`${apiUrl}/analysis`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data?.success) setSavedAnalyses(res.data.data);
      } catch {
        // ignore history load errors
      }
    })();
  }, [apiUrl]);

  // Debounced suggestions
  useEffect(() => {
    if (debounceTimer.current) window.clearTimeout(debounceTimer.current);
    if (!searchQuery || searchQuery.trim().length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    debounceTimer.current = window.setTimeout(async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(
          searchQuery
        )}`;
        const res = await axios.get(url);
        setSuggestions(res.data || []);
        setShowSuggestions(true);
      } catch (e) {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 350);
  }, [searchQuery]);

  const centerMap = (lat: number, lng: number, zoom = 15) => {
    if (mapRef.current) mapRef.current.setView([lat, lng], zoom);
  };

  const onSelectSuggestion = (s: Suggestion) => {
    const lat = parseFloat(s.lat);
    const lng = parseFloat(s.lon);
    setPinnedLocation([lat, lng]);
    setPinnedAddress(s.display_name);
    centerMap(lat, lng);
    setShowSuggestions(false);
  };

  const clearPin = () => {
    setPinnedLocation(null);
    setPinnedAddress('');
    setAnalysisResult(null);
  };

  const useMyLocation = () => {
    if (!userLocation) return;
    const [lat, lng] = userLocation;
    setPinnedLocation([lat, lng]);
    setPinnedAddress('Your current location');
    centerMap(lat, lng);
  };

  // Reverse geocoding
  const getAddressFromCoordinates = async (lat: number, lng: number): Promise<string> => {
    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      return res.data?.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } catch {
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  };

  // Analyze
  const analyzeLocation = async () => {
    if (!pinnedLocation) return;
    setIsAnalyzing(true);
    const address = pinnedAddress || (await getAddressFromCoordinates(pinnedLocation[0], pinnedLocation[1]));
    const payload = {
      coordinates: [pinnedLocation[1], pinnedLocation[0]] as [number, number], // [lng, lat]
      address,
      mapImageUrl: null as string | null,
    };

    const onSuccess = async (data: AnalysisResult) => {
      setAnalysisResult(data);
      await notify(
        'success',
        'Analysis complete',
        `Peacefulness: ${data.peacefulnessScore}/100 - ${data.peacefulnessLabel}`
      );
    };

    try {
      const token = getAuthToken();
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
      const res = await axios.post(`${apiUrl}/analysis/analyze`, payload, config);
      if (res.data?.success) {
        await onSuccess(res.data.data);
      } else {
        await notify('error', 'Failed to analyze', res.data?.message || 'Please try again.');
      }
    } catch (e: any) {
      const status = e?.response?.status;
      const message = e?.response?.data?.message || e?.message;
      // Jika token invalid/expired dan endpoint mengizinkan anonim,
      // hapus token dan coba ulang tanpa Authorization sekali.
      if (status === 401 && /token|jwt|unauthor/i.test(String(message))) {
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
        try {
          const res2 = await axios.post(`${apiUrl}/analysis/analyze`, payload);
          if (res2.data?.success) {
            await onSuccess(res2.data.data);
          } else {
            await notify('error', 'Failed to analyze', res2.data?.message || 'Please try again.');
          }
        } catch (err: any) {
          await notify(
            'error',
            'Failed to analyze',
            err?.response?.data?.message || 'Please try again.'
          );
        }
      } else {
        await notify('error', 'Failed to analyze', message || 'Please try again.');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Save analysis
  const saveAnalysis = async () => {
    if (!analysisResult) return;
    setIsSaving(true);
    try {
      const token = getAuthToken();
      if (!token) {
        await notify('warning', 'Login required', 'Please login to save analysis.');
        return;
      }

      // Debug: Log what we're sending
      console.log('🔍 Save Analysis - Token present:', !!token);
      console.log('📦 Data to save:', JSON.stringify(analysisResult, null, 2));

      const res = await axios.post(`${apiUrl}/analysis/save`, analysisResult, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data?.success) {
        await notify('success', 'Saved', 'Analysis has been added to your history.');
        // reload history
        const h = await axios.get(`${apiUrl}/analysis`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (h.data?.success) setSavedAnalyses(h.data.data);
      } else {
        console.error('❌ Save failed - Response:', res.data);
        await notify('error', 'Failed to save analysis', res.data?.message || 'Please try again.');
      }
    } catch (e: any) {
      console.error('❌ Save error - Full response:', e.response);
      console.error('❌ Save error - Request data:', e.config?.data);
      const errorMessage = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Please try again.';
      await notify('error', 'Failed to save analysis', errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete saved
  const deleteAnalysis = async (id: string) => {
    const confirmed = await confirmDialog('Delete this analysis?', 'This action cannot be undone.');
    if (!confirmed) return;
    try {
      const token = getAuthToken();
      if (!token) return;
      await axios.delete(`${apiUrl}/analysis/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSavedAnalyses((prev) => prev.filter((a) => a._id !== id));
      await notify('success', 'Deleted', 'Analysis has been removed.');
    } catch (e) {
      await notify('error', 'Failed to delete');
    }
  };

  // Map click to pin
  const MapClickHandler = () => {
    useMapEvents({
      click: async (e) => {
        if (!isPinModeEnabled) return;
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        setPinnedLocation([lat, lng]);
        const address = await getAddressFromCoordinates(lat, lng);
        setPinnedAddress(address);
        centerMap(lat, lng);
      },
    });
    return null;
  };

  const getPeacefulnessColor = (score: number) => {
    if (score >= 75) return '#00C853';
    if (score >= 50) return '#FFD600';
    return '#FF3D00';
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-yellow-500/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/main')}
              className="p-2 rounded-full bg-yellow-500/10 hover:bg-yellow-500/20"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
              PeaceFinder
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Desktop actions */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => setIsPinModeEnabled((v) => !v)}
                className={`px-3 py-2 rounded-lg border ${
                  isPinModeEnabled ? 'border-yellow-500/60 bg-yellow-500/10' : 'border-yellow-500/20 bg-transparent'
                }`}
                title="Toggle Pin Mode"
              >
                <MapPin className="w-4 h-4 inline mr-2" />
                {isPinModeEnabled ? 'Pinning' : 'Pin Mode'}
              </button>
              <button
                onClick={useMyLocation}
                className="px-3 py-2 rounded-lg border border-yellow-500/20 hover:bg-yellow-500/10"
                title="Use My Location"
              >
                <LocateFixed className="w-4 h-4 inline mr-2" />
                My Location
              </button>
              <button
                onClick={clearPin}
                className="px-3 py-2 rounded-lg border border-red-500/30 hover:bg-red-500/10"
                title="Clear Pin"
              >
                <X className="w-4 h-4 inline mr-2" />
                Clear
              </button>
            </div>
            {/* Mobile hamburger */}
            <button
              onClick={() => setShowMobileMenu((v) => !v)}
              className="sm:hidden p-2 rounded-lg border border-yellow-500/20 hover:bg-yellow-500/10"
              aria-label="Menu"
              title="Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
        {/* Search */}
        <div className="max-w-7xl mx-auto px-4 pb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search for a place, district, or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.length >= 3 && setShowSuggestions(true)}
              className="w-full pl-10 pr-4 py-3 bg-gray-900/80 border border-yellow-500/20 rounded-xl focus:outline-none focus:border-yellow-500/50"
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute mt-2 w-full bg-gray-950/95 backdrop-blur-md border border-yellow-500/20 rounded-xl shadow-2xl ring-1 ring-yellow-500/10 max-h-60 overflow-auto z-30">
                {suggestions.map((s, idx) => (
                  <button
                    key={`${s.lat}-${s.lon}-${idx}`}
                    onClick={() => onSelectSuggestion(s)}
                    className="block w-full text-left px-3 py-2 hover:bg-yellow-500/10"
                  >
                    <div className="text-sm text-white truncate">{s.display_name}</div>
                    <div className="text-xs text-gray-400">
                      {parseFloat(s.lat).toFixed(5)}, {parseFloat(s.lon).toFixed(5)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Quick Actions under search */}
        <div className="max-w-7xl mx-auto px-4 pb-2 -mt-2 flex flex-col sm:flex-row gap-2">
          <button
            onClick={analyzeLocation}
            disabled={!pinnedLocation || isAnalyzing}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/20 rounded-xl disabled:opacity-50"
            title={!pinnedLocation ? 'Pin a location first' : 'Analyze the selected location'}
          >
            {isAnalyzing ? <Loader className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
            <span>{isAnalyzing ? 'Analyzing...' : 'Analyze'}</span>
          </button>
          <button
            onClick={saveAnalysis}
            disabled={!analysisResult || isSaving}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600/20 hover:bg-green-600/30 border border-green-500/20 rounded-xl disabled:opacity-50"
            title={!analysisResult ? 'Run analysis first' : 'Save the latest analysis'}
          >
            {isSaving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isSaving ? 'Saving...' : 'Save Analysis'}</span>
          </button>
        </div>
        {/* Mobile menu panel - removed duplicate analyze/save buttons */}
        {showMobileMenu && (
          <div className="sm:hidden max-w-7xl mx-auto px-4 pb-4">
            <div className="p-3 bg-black/70 border border-yellow-500/20 rounded-lg backdrop-blur-md grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setIsPinModeEnabled((v) => !v);
                  setShowMobileMenu(false);
                }}
                className={`px-3 py-2 rounded-lg border ${
                  isPinModeEnabled ? 'border-yellow-500/60 bg-yellow-500/10' : 'border-yellow-500/20 bg-transparent'
                }`}
              >
                <MapPin className="w-4 h-4 inline mr-2" />
                {isPinModeEnabled ? 'Pinning' : 'Pin Mode'}
              </button>
              <button
                onClick={() => {
                  useMyLocation();
                  setShowMobileMenu(false);
                }}
                className="px-3 py-2 rounded-lg border border-yellow-500/20 hover:bg-yellow-500/10"
              >
                <LocateFixed className="w-4 h-4 inline mr-2" />
                My Location
              </button>
              <button
                onClick={() => {
                  clearPin();
                  setShowMobileMenu(false);
                }}
                className="col-span-2 px-3 py-2 rounded-lg border border-red-500/30 hover:bg-red-500/10"
              >
                <X className="w-4 h-4 inline mr-2" />
                Clear Pin
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Analysis and History Sections */}
          <div className="lg:col-span-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Analysis Result */}
              <section className="lg:col-span-8 bg-gray-900/50 border border-yellow-500/20 rounded-xl p-4">
                <h2 className="text-lg font-semibold text-yellow-400 mb-3">Analysis</h2>
                {!analysisResult ? (
                  <p className="text-sm text-gray-400">No analysis yet. Pin a location and click Analyze.</p>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-4">
                      <div>
                        <div
                          className="text-4xl font-bold"
                          style={{ color: getPeacefulnessColor(analysisResult.peacefulnessScore) }}
                        >
                          {analysisResult.peacefulnessScore}
                        </div>
                        <div className="text-sm text-gray-400">Peacefulness (0-100)</div>
                        <div className="mt-2 h-2 w-48 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${analysisResult.peacefulnessScore}%`,
                              backgroundColor: getPeacefulnessColor(analysisResult.peacefulnessScore),
                              transition: 'width 300ms ease',
                            }}
                          />
                        </div>
                      </div>
                      <div className="px-3 py-1 rounded-full text-sm border border-yellow-500/30 text-yellow-300">
                        {analysisResult.peacefulnessLabel}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-300 mb-2">Area Distribution</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div className="p-3 bg-gray-800/60 rounded-lg border border-gray-700">
                          <div className="text-green-400">🌿 Green/Blue</div>
                          <div className="text-white font-semibold">
                            {analysisResult.areaDistribution.greenBlueSpaces.toFixed(1)}%
                          </div>
                        </div>
                        <div className="p-3 bg-gray-800/60 rounded-lg border border-gray-700">
                          <div className="text-gray-300">🏢 Buildings</div>
                          <div className="text-white font-semibold">
                            {analysisResult.areaDistribution.buildings.toFixed(1)}%
                          </div>
                        </div>
                        <div className="p-3 bg-gray-800/60 rounded-lg border border-gray-700">
                          <div className="text-red-400">🛣️ Roads</div>
                          <div className="text-white font-semibold">
                            {analysisResult.areaDistribution.roads.toFixed(1)}%
                          </div>
                        </div>
                        <div className="p-3 bg-gray-800/60 rounded-lg border border-gray-700">
                          <div className="text-blue-300">⚪ Neutral</div>
                          <div className="text-white font-semibold">
                            {analysisResult.areaDistribution.neutral.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-300 mb-2">AI Analysis</h3>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {analysisResult.aiAnalysis.description}
                      </p>
                    </div>
                    {!!analysisResult.aiAnalysis.recommendations?.length && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-300 mb-2">Recommendations</h3>
                        <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                          {analysisResult.aiAnalysis.recommendations.map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </section>
              {/* History */}
              <aside className="lg:col-span-4 bg-gray-900/50 border border-yellow-500/20 rounded-xl p-4 max-h-[70vh] overflow-auto">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-yellow-400">History</h2>
                  <History className="w-4 h-4 text-yellow-400" />
                </div>
                {savedAnalyses.length === 0 ? (
                  <p className="text-sm text-gray-400">
                    No saved analyses yet. Save results to build your history.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {savedAnalyses.map((a) => (
                      <div
                        key={a._id}
                        className="p-3 bg-gray-800/60 rounded-lg border border-gray-700"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-white truncate">{a.address}</div>
                            <div className="text-xs text-gray-400 mt-0.5">
                              {new Date(a.createdAt).toLocaleString()} • {a.peacefulnessScore}/100
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                const [lng, lat] = a.location.coordinates;
                                setPinnedLocation([lat, lng]);
                                setPinnedAddress(a.address);
                                centerMap(lat, lng);
                              }}
                              className="p-2 rounded-md bg-blue-600/20 hover:bg-blue-600/30"
                              title="View on map"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteAnalysis(a._id)}
                              className="p-2 rounded-md bg-red-600/20 hover:bg-red-600/30"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </aside>
            </div>
          </div>
          {/* Map Section */}
          <div className="lg:col-span-12">
            <div className="relative rounded-2xl overflow-hidden border border-yellow-500/20 bg-gray-950 min-h-[300px] sm:min-h-[360px] shadow-lg">
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader className="w-10 h-10 text-yellow-500 animate-spin" />
                </div>
              ) : (
                userLocation && (
                  <MapContainer
                    ref={mapRef}
                    center={userLocation}
                    zoom={14}
                    className="w-full h-[58vh] sm:h-[62vh] lg:h-[68vh]"
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {/* User marker */}
                    <Marker
                      position={userLocation}
                      icon={L.divIcon({
                        className: 'custom-marker',
                        html: `<div style="width: 20px; height: 20px; border-radius: 50%; background-color: #1E88E5; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
                        iconSize: [20, 20],
                        iconAnchor: [10, 10],
                      })}
                    >
                      <Popup>Your Location</Popup>
                    </Marker>
                    {/* Pin marker */}
                    {pinnedLocation && (
                      <Marker
                        position={pinnedLocation}
                        icon={L.divIcon({
                          className: 'custom-marker',
                          html: `<div style="width: 28px; height: 28px; border-radius: 50%; background-color: #FF5722; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px rgba(0,0,0,0.5);"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
                          iconSize: [28, 28],
                          iconAnchor: [14, 14],
                        })}
                      >
                        <Popup>
                          <div className="text-sm max-w-[220px]">
                            <div className="font-medium text-gray-900">Selected Location</div>
                            <div className="text-gray-600 mt-1">{pinnedAddress}</div>
                          </div>
                        </Popup>
                      </Marker>
                    )}
                    {/* Healing spots markers */}
                    {analysisResult?.aiAnalysis.healingSpots.map((spot, idx) => (
                      <Marker
                        key={idx}
                        position={[spot.coordinates[1], spot.coordinates[0]]}
                        icon={L.divIcon({
                          className: 'custom-marker',
                          html: `<div style="width: 20px; height: 20px; border-radius: 50%; background-color: #00C853; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px rgba(0,0,0,0.3);"><span style="color: white; font-size: 10px;">🌿</span></div>`,
                          iconSize: [20, 20],
                          iconAnchor: [10, 10],
                        })}
                      >
                        <Popup>
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">{spot.name}</div>
                            <div className="text-gray-600 mt-1">{spot.reason}</div>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                    {/* Click handler for pin */}
                    <MapClickHandler />
                  </MapContainer>
                )
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
