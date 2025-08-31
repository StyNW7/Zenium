/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Lightbulb,
  CheckCircle,
  Clock,
  RefreshCw,
  Activity,
  Heart,
  Users,
  Briefcase,
  Brain
} from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';

// Helpers: sanitize token from storage
function getAuthToken(): string | null {
  const raw = localStorage.getItem('authToken') || localStorage.getItem('token');
  if (!raw) return null;
  let t = raw.trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) t = t.slice(1, -1);
  if (t.toLowerCase().startsWith('bearer ')) t = t.slice(7).trim();
  return t || null;
}

interface Recommendation {
  _id: string;
  type: 'activity' | 'mindfulness' | 'social' | 'professional' | 'health' | 'general';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  category: 'immediate' | 'short_term' | 'long_term';
  actionable: boolean;
  estimatedTime: number;
  tags: string[];
  aiGenerated: boolean;
  isCompleted: boolean;
  completedAt?: string;
  userFeedback?: {
    helpful?: boolean;
    implemented?: boolean;
    notes?: string;
  };
  context: {
    mood: string;
    sentiment: string;
    keywords: string[];
    riskScore: number;
  };
  createdAt: string;
  journalId?: {
    _id: string;
    title: string;
    content: string;
    mood: string;
    createdAt: string;
  };
}

interface RecommendationStats {
  total: number;
  completed: number;
  pending: number;
  completionRate: string;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
}

export function ZeniumRecommendationPage() {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [filteredRecommendations, setFilteredRecommendations] = useState<Recommendation[]>([]);
  const [stats, setStats] = useState<RecommendationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter states
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const token = useMemo(() => getAuthToken(), []);
  const authHeaders = useMemo(() => (token ? { Authorization: `Bearer ${token}` } : {}), [token]);

  // Type icons mapping
  const typeIcons = {
    activity: <Activity className="w-5 h-5" />,
    mindfulness: <Brain className="w-5 h-5" />,
    social: <Users className="w-5 h-5" />,
    professional: <Briefcase className="w-5 h-5" />,
    health: <Heart className="w-5 h-5" />,
    general: <Lightbulb className="w-5 h-5" />
  };

  // Priority colors
  const priorityColors = {
    high: 'text-red-400 border-red-500/20 bg-red-500/10',
    medium: 'text-yellow-400 border-yellow-500/20 bg-yellow-500/10',
    low: 'text-green-400 border-green-500/20 bg-green-500/10'
  };

  // Category colors
  const categoryColors = {
    immediate: 'text-orange-400 border-orange-500/20 bg-orange-500/10',
    short_term: 'text-blue-400 border-blue-500/20 bg-blue-500/10',
    long_term: 'text-purple-400 border-purple-500/20 bg-purple-500/10'
  };

  useEffect(() => {
    if (token) {
      fetchRecommendations();
      fetchStats();
    } else {
      navigate('/login');
    }
  }, [token, navigate]);

  // Filter recommendations
  useEffect(() => {
    let filtered = [...recommendations];

    if (typeFilter !== 'all') {
      filtered = filtered.filter(r => r.type === typeFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(r => r.priority === priorityFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => 
        statusFilter === 'completed' ? r.isCompleted : !r.isCompleted
      );
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.tags.some(tag => tag.toLowerCase().includes(q))
      );
    }

    setFilteredRecommendations(filtered);
  }, [recommendations, typeFilter, priorityFilter, statusFilter, searchQuery]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${apiUrl}/recommendations`, { 
        headers: authHeaders,
        params: { limit: 50, page: 1 }
      });
      setRecommendations(res.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
      Swal.fire('Error', 'Failed to load recommendations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${apiUrl}/recommendations/stats`, { headers: authHeaders });
      setStats(res.data?.data || null);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const markAsCompleted = async (recommendationId: string, feedback: any = {}) => {
    try {
      await axios.put(`${apiUrl}/recommendations/${recommendationId}/complete`, feedback, { headers: authHeaders });
      
      // Update local state
      setRecommendations(prev => prev.map(r => 
        r._id === recommendationId 
          ? { ...r, isCompleted: true, completedAt: new Date().toISOString(), userFeedback: feedback }
          : r
      ));
      
      // Refresh stats
      fetchStats();
      
      Swal.fire('Success', 'Recommendation marked as completed!', 'success');
    } catch (error) {
      console.error('Failed to mark as completed:', error);
      Swal.fire('Error', 'Failed to mark recommendation as completed', 'error');
    }
  };

  const deleteRecommendation = async (recommendationId: string) => {
    const result = await Swal.fire({
      title: 'Delete this recommendation?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444'
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${apiUrl}/recommendations/${recommendationId}`, { headers: authHeaders });
      setRecommendations(prev => prev.filter(r => r._id !== recommendationId));
      fetchStats();
      Swal.fire('Deleted', 'Recommendation has been deleted.', 'success');
    } catch (error) {
      console.error('Failed to delete recommendation:', error);
      Swal.fire('Error', 'Failed to delete recommendation', 'error');
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await Promise.all([fetchRecommendations(), fetchStats()]);
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-400">Loading AI recommendations...</p>
        </div>
      </div>
    );
  }

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
              AI Recommendations
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="p-2 rounded-full bg-yellow-500/10 hover:bg-yellow-500/20 transition-colors duration-300"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        {stats && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-900/50 rounded-lg p-3 border border-yellow-500/20">
              <div className="text-2xl font-bold text-yellow-400">{stats.total}</div>
              <div className="text-xs text-gray-400">Total</div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-3 border border-green-500/20">
              <div className="text-2xl font-bold text-green-400">{stats.completed}</div>
              <div className="text-xs text-gray-400">Completed</div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-3 border border-blue-500/20">
              <div className="text-2xl font-bold text-blue-400">{stats.pending}</div>
              <div className="text-xs text-gray-400">Pending</div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-3 border border-purple-500/20">
              <div className="text-2xl font-bold text-purple-400">{stats.completionRate}%</div>
              <div className="text-xs text-gray-400">Success Rate</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mt-4 flex flex-wrap gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
          >
            <option value="all">All Types</option>
            <option value="activity">Activity</option>
            <option value="mindfulness">Mindfulness</option>
            <option value="social">Social</option>
            <option value="professional">Professional</option>
            <option value="health">Health</option>
            <option value="general">General</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>

          <input
            type="text"
            placeholder="Search recommendations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm flex-1 min-w-48"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-48 pb-6 px-4">
        {filteredRecommendations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Lightbulb className="w-16 h-16 text-gray-600 mb-4" />
            <h3 className="text-xl font-medium text-gray-400">No recommendations found</h3>
            <p className="text-gray-500 mt-2">
              {recommendations.length === 0 
                ? "Start journaling to get AI-powered recommendations"
                : "Try adjusting your filters"
              }
            </p>
            {recommendations.length === 0 && (
              <button
                onClick={() => navigate('/journal')}
                className="mt-4 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-lg transition-colors duration-300"
              >
                Start Journaling
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRecommendations.map((recommendation) => (
              <div
                key={recommendation._id}
                className={`bg-gray-900/50 rounded-lg overflow-hidden border transition-colors duration-300 p-4 ${
                  recommendation.isCompleted 
                    ? 'border-green-500/20 bg-green-500/5' 
                    : 'border-yellow-500/20 hover:border-yellow-500/40'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-yellow-400">
                        {typeIcons[recommendation.type]}
                      </div>
                      <h3 className="text-lg font-medium text-white">
                        {recommendation.title}
                        {recommendation.isCompleted && (
                          <CheckCircle className="inline-block w-5 h-5 text-green-400 ml-2" />
                        )}
                      </h3>
                    </div>

                    <p className="text-gray-300 mb-3">{recommendation.description}</p>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs border ${priorityColors[recommendation.priority]}`}>
                        {recommendation.priority} priority
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs border ${categoryColors[recommendation.category]}`}>
                        {recommendation.category}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-300 border border-blue-500/20">
                        <Clock className="inline-block w-3 h-3 mr-1" />
                        {formatTime(recommendation.estimatedTime)}
                      </span>
                    </div>

                    {recommendation.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {recommendation.tags.map((tag, index) => (
                          <span key={index} className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {recommendation.journalId && (
                      <div className="text-xs text-gray-500 mb-3">
                        <span className="text-gray-400">Based on journal:</span> {recommendation.journalId.title}
                        <span className="mx-2">•</span>
                        Mood: {recommendation.journalId.mood}
                        <span className="mx-2">•</span>
                        {formatDate(recommendation.journalId.createdAt)}
                      </div>
                    )}

                    {recommendation.isCompleted && recommendation.userFeedback && (
                      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-3">
                        <div className="text-sm text-green-300 font-medium mb-1">Completed</div>
                        {recommendation.userFeedback.helpful !== undefined && (
                          <div className="text-xs text-green-400">
                            Helpful: {recommendation.userFeedback.helpful ? 'Yes' : 'No'}
                          </div>
                        )}
                        {recommendation.userFeedback.notes && (
                          <div className="text-xs text-green-400 mt-1">
                            Notes: {recommendation.userFeedback.notes}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    {!recommendation.isCompleted ? (
                      <button
                        onClick={() => markAsCompleted(recommendation._id)}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition-colors duration-300"
                      >
                        Mark Complete
                      </button>
                    ) : (
                      <button
                        onClick={() => markAsCompleted(recommendation._id, { helpful: true, implemented: true })}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors duration-300"
                      >
                        Update Feedback
                      </button>
                    )}
                    
                    <button
                      onClick={() => deleteRecommendation(recommendation._id)}
                      className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-300 text-sm rounded-md border border-red-500/30 transition-colors duration-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}