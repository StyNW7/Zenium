import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Calendar, User, Clock } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/contexts/authcontext';

interface Quote {
  id?: string;
  quote: string;
  author: string;
  explanation: string;
  category?: string;
  generatedAt: Date | string;
  isAiGenerated: boolean;
}

export function ZeniumQuotePage() {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchDailyQuote = async (forceNew = false) => {
    try {
      setLoading(true);
      setError(null);
      if (forceNew) setRefreshing(true);

      // Menggunakan API endpoint dari backend
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/quotes/daily`, {
        params: { forceNew },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      setQuote(response.data.data);
    } catch (err) {
      console.error('Error fetching quote:', err);
      setError('Failed to load daily quote. Please try again later.');
      
      // Fallback quote if API fails
      setQuote({
        quote: "Every day is a new opportunity to become the best version of yourself.",
        author: "Zenium AI",
        explanation: "Remember that each day brings new opportunities for growth, healing, and happiness.",
        generatedAt: new Date().toISOString(),
        isAiGenerated: true
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDailyQuote();
  }, []);

  const handleRefresh = () => {
    fetchDailyQuote(true);
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-16">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-128 h-128 bg-yellow-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-4">
        {/* Header with back button */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate('/main')}
            className="mr-4 p-2 rounded-full bg-yellow-500/10 hover:bg-yellow-500/20 transition-colors duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
            Daily Motivation Quote
          </h1>
        </div>

        {/* Quote Card */}
        <div className="max-w-3xl mx-auto">
          <div className="relative bg-gradient-to-br from-gray-900 to-black border border-yellow-500/20 rounded-2xl p-8 shadow-xl overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-600/5 rounded-full blur-lg" />

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
                <p className="mt-4 text-gray-400">Memuat quote harian...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-400 mb-4">{error}</p>
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-lg transition-colors duration-300 flex items-center justify-center mx-auto"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Coba Lagi
                </button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center text-sm text-gray-400">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{quote?.generatedAt ? formatDate(quote.generatedAt) : 'Hari Ini'}</span>
                  </div>
                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className={`p-2 rounded-full ${refreshing ? 'bg-yellow-500/5 text-gray-500' : 'bg-yellow-500/10 hover:bg-yellow-500/20'} transition-colors duration-300`}
                    title="Generate quote baru"
                  >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                <div className="mb-6">
                  <p className="text-2xl font-serif italic leading-relaxed mb-4 text-yellow-100">
                    "{quote?.quote}"
                  </p>
                  <p className="text-right text-yellow-500 font-medium">
                    — {quote?.author || 'Unknown'}
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-yellow-500/20">
                  <h3 className="text-lg font-medium text-yellow-400 mb-3">Refleksi</h3>
                  <p className="text-gray-300 leading-relaxed">
                    {quote?.explanation}
                  </p>
                </div>

                {quote?.isAiGenerated && (
                  <div className="mt-6 flex items-center text-xs text-gray-500">
                    <div className="flex items-center mr-2">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>Diperbarui setiap 24 jam</span>
                    </div>
                    <span className="mx-2">•</span>
                    <div className="flex items-center">
                      <User className="w-3 h-3 mr-1" />
                      <span>Dibuat khusus untuk {user?.name || 'Anda'}</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center text-gray-400 text-sm">
            <p>New motivational quotes will be available every 24 hours.</p>
            <p className="mt-2">Created with AI to provide motivation tailored to your needs.</p>
          </div>
        </div>
      </div>
    </div>
  );
};