import { useState, useEffect } from 'react';
import { 
  Clock, BarChart3, TrendingUp, TrendingDown, Minus, 
  MapPin, Calendar, Star, Brain, Heart, Leaf, Droplets,
  Building, Car, AlertCircle, CheckCircle, Info, XCircle
} from 'lucide-react';
import axios from 'axios';

interface AnalysisHistoryItem {
  id: string;
  date: string;
  score: number;
  rating: string;
  coordinates: [number, number];
  atmosphere: string;
}

interface AnalysisStats {
  totalAnalyses: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  preferredEnvironments: Array<{
    type: string;
    averagePercentage: number;
  }>;
  improvementTrend: 'improving' | 'declining' | 'neutral';
}

interface AnalysisHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AnalysisHistoryPanel({ isOpen, onClose }: AnalysisHistoryPanelProps) {
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [stats, setStats] = useState<AnalysisStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'history' | 'stats'>('history');

  useEffect(() => {
    if (isOpen) {
      fetchAnalysisHistory();
      fetchAnalysisStats();
    }
  }, [isOpen]);

  const fetchAnalysisHistory = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
      
      const response = await axios.get(`${apiUrl}/user/analysis-history`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (response.data?.success) {
        setHistory(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching analysis history:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalysisStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
      
      const response = await axios.get(`${apiUrl}/user/mental-health-insights`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (response.data?.success) {
        setStats(response.data.data.analysisStats);
      }
    } catch (error) {
      console.error('Error fetching analysis stats:', error);
    }
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'EXCELLENT': return '#22c55e';
      case 'GOOD': return '#84cc16';
      case 'MODERATE': return '#eab308';
      case 'POOR': return '#f97316';
      case 'VERY_POOR': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'declining': return <TrendingDown className="w-4 h-4 text-red-400" />;
      default: return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getEnvironmentIcon = (type: string) => {
    switch (type) {
      case 'greenNature': return <Leaf className="w-4 h-4" />;
      case 'blueWater': return <Droplets className="w-4 h-4" />;
      case 'whiteOpen': return <Heart className="w-4 h-4" />;
      case 'brownBuildings': return <Building className="w-4 h-4" />;
      case 'yellowRoads': return <Car className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const getEnvironmentColor = (type: string) => {
    switch (type) {
      case 'greenNature': return '#4CAF50';
      case 'blueWater': return '#2196F3';
      case 'whiteOpen': return '#9E9E9E';
      case 'lightPeaceful': return '#8BC34A';
      case 'brownBuildings': return '#795548';
      case 'yellowRoads': return '#FFC107';
      case 'grayBusy': return '#607D8B';
      case 'redIndustrial': return '#F44336';
      default: return '#6b7280';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-black/95 backdrop-blur-xl rounded-2xl border border-yellow-500/30 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-yellow-400">Mental Health Analysis History</h2>
              <p className="text-sm text-gray-400">Track your environmental wellness journey</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-gray-800 transition-colors duration-300"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex space-x-1 mt-4">
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                activeTab === 'history' 
                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4 inline mr-2" />
              History
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                activeTab === 'stats' 
                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Statistics
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
              <span className="ml-3 text-gray-400">Loading analysis history...</span>
            </div>
          ) : (
            <>
              {activeTab === 'history' && (
                <div className="space-y-4">
                  {history.length === 0 ? (
                    <div className="text-center py-12">
                      <Brain className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-400 mb-2">No Analysis History</h3>
                      <p className="text-sm text-gray-500">
                        Start analyzing locations to build your mental health journey
                      </p>
                    </div>
                  ) : (
                    history.map((item) => (
                      <div 
                        key={item.id} 
                        className="bg-gray-900/50 rounded-xl border border-gray-800 p-4 hover:border-yellow-500/30 transition-all duration-300"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                              style={{ backgroundColor: getRatingColor(item.rating) }}
                            >
                              {item.score}
                            </div>
                            <div>
                              <h4 className="font-medium text-white">
                                {new Date(item.date).toLocaleDateString('id-ID', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </h4>
                              <p className="text-sm text-gray-400">
                                {new Date(item.date).toLocaleTimeString('id-ID')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span 
                              className="px-2 py-1 rounded-full text-xs font-medium"
                              style={{ 
                                backgroundColor: `${getRatingColor(item.rating)}20`,
                                color: getRatingColor(item.rating)
                              }}
                            >
                              {item.rating}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-sm text-gray-300">
                            <MapPin className="w-4 h-4 text-yellow-500" />
                            <span>
                              {item.coordinates[1].toFixed(4)}, {item.coordinates[0].toFixed(4)}
                            </span>
                          </div>
                          
                          {item.atmosphere && (
                            <p className="text-sm text-gray-400 leading-relaxed">
                              {item.atmosphere}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'stats' && stats && (
                <div className="space-y-6">
                  {/* Overall Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-green-900/20 to-green-600/20 rounded-xl border border-green-500/30 p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Brain className="w-5 h-5 text-green-400" />
                        <span className="text-sm text-gray-400">Total Analyses</span>
                      </div>
                      <p className="text-2xl font-bold text-green-400">{stats.totalAnalyses}</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-900/20 to-blue-600/20 rounded-xl border border-blue-500/30 p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <BarChart3 className="w-5 h-5 text-blue-400" />
                        <span className="text-sm text-gray-400">Average Score</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-400">{stats.averageScore}/100</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-yellow-900/20 to-yellow-600/20 rounded-xl border border-yellow-500/30 p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-yellow-400" />
                        <span className="text-sm text-gray-400">Highest Score</span>
                      </div>
                      <p className="text-2xl font-bold text-yellow-400">{stats.highestScore}</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-red-900/20 to-red-600/20 rounded-xl border border-red-500/30 p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <TrendingDown className="w-5 h-5 text-red-400" />
                        <span className="text-sm text-gray-400">Lowest Score</span>
                      </div>
                      <p className="text-2xl font-bold text-red-400">{stats.lowestScore}</p>
                    </div>
                  </div>

                  {/* Trend Analysis */}
                  <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4">
                    <h3 className="text-lg font-medium text-white mb-3">Improvement Trend</h3>
                    <div className="flex items-center space-x-3">
                      {getTrendIcon(stats.improvementTrend)}
                      <span className="text-gray-300 capitalize">
                        Your mental health environment preference is {stats.improvementTrend}
                      </span>
                    </div>
                  </div>

                  {/* Preferred Environments */}
                  <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4">
                    <h3 className="text-lg font-medium text-white mb-3">Preferred Environments</h3>
                    <div className="space-y-3">
                      {stats.preferredEnvironments.map((env, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div style={{ color: getEnvironmentColor(env.type) }}>
                              {getEnvironmentIcon(env.type)}
                            </div>
                            <span className="text-gray-300 capitalize">
                              {env.type.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-700 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full transition-all duration-500"
                                style={{ 
                                  width: `${env.averagePercentage}%`,
                                  backgroundColor: getEnvironmentColor(env.type)
                                }}
                              />
                            </div>
                            <span className="text-sm text-gray-400 w-12 text-right">
                              {Math.round(env.averagePercentage)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
