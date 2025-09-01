import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Calendar, User, Clock, Trash2, VolumeX, Pause, Play, Brain } from 'lucide-react';
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
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [quotesLoading, setQuotesLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Text-to-Speech state
  const [ttsAvailable, setTtsAvailable] = useState<boolean>(false);
  const [speaking, setSpeaking] = useState<boolean>(false);
  const [paused, setPaused] = useState<boolean>(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const fetchDailyQuote = async (forceNew = false) => {
    try {
      setLoading(true);
      if (forceNew) setRefreshing(true);

      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');

      const response = await axios.get(`${apiUrl}/daily-quote`, {
        params: { forceNew, mood: '', activity: '' },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setQuote(response.data.data);
    } catch (err) {
      console.error('Error fetching quote:', err);
      // Use a gentle fallback if API fails (no error UI)
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

  const fetchUserQuotes = async (): Promise<boolean> => {
    try {
      setQuotesLoading(true);
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const resp = await axios.get(`${apiUrl}/quotes`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: 1, limit: 10 }
      });
      const items = resp.data?.data?.quotes || [];
      setQuotes(items);
      if (items.length > 0) {
        const top = items[0];
        setQuote({
          id: top._id || top.id,
          quote: top.quote,
          author: top.author,
          explanation: top.explanation,
          category: top.category,
          generatedAt: top.generatedAt,
          isAiGenerated: top.isAiGenerated,
        });
        return true;
      }
      return false;
    } catch (e) {
      // ignore and fallback to daily quote
      return false;
    } finally {
      setQuotesLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      const hasPersonal = await fetchUserQuotes();
      if (!hasPersonal) {
        await fetchDailyQuote();
      } else {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setTtsAvailable(true);
    } else {
      setTtsAvailable(false);
    }
    return () => {
      try { window.speechSynthesis?.cancel(); } catch {}
    };
  }, []);

  const speakQuote = () => {
    try {
      if (!ttsAvailable || !quote) return;
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setPaused(false);
        setSpeaking(true);
        return;
      }
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance();
      const text = `"${quote.quote}" ${quote.author ? `by ${quote.author}.` : ''} ${quote.explanation ? quote.explanation : ''}`;
      u.text = text;
      u.lang = 'en-US';
      u.rate = 1;
      u.pitch = 1;
      u.onend = () => { setSpeaking(false); setPaused(false); };
      u.onerror = () => { setSpeaking(false); setPaused(false); };
      utteranceRef.current = u;
      window.speechSynthesis.speak(u);
      setSpeaking(true);
      setPaused(false);
    } catch {}
  };

  const pauseSpeech = () => {
    try {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        setPaused(true);
      }
    } catch {}
  };

  const stopSpeech = () => {
    try {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      setPaused(false);
      utteranceRef.current = null;
    } catch {}
  };

  const handleRefresh = () => {
    fetchDailyQuote(true);
  };

  const deleteQuoteById = async (id: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      await axios.delete(`${apiUrl}/quotes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuotes(prev => prev.filter((q: any) => (q._id || q.id) !== id));
      if (quote && ((quote as any).id === id)) {
        setQuote(null);
      }
    } catch (e) {
      console.error('Delete quote failed', e);
    }
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
                <p className="mt-4 text-gray-400">Loading daily quote...</p>
              </div>
            ) : !quote ? (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">No quote yet. Tap refresh to generate one.</p>
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-lg transition-colors duration-300 flex items-center justify-center mx-auto"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center text-sm text-gray-400">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{quote?.generatedAt ? formatDate(quote.generatedAt) : 'Today'}</span>
                  </div>
                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className={`p-2 rounded-full ${refreshing ? 'bg-yellow-500/5 text-gray-500' : 'bg-yellow-500/10 hover:bg-yellow-500/20'} transition-colors duration-300`}
                    title="Generate new quote"
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

                {ttsAvailable && (
                  <div className="flex items-center gap-2 mb-4">
                    <button
                      onClick={speaking && !window.speechSynthesis.paused ? pauseSpeech : speakQuote}
                      className="p-2 rounded-md bg-yellow-500/10 hover:bg-yellow-500/20 transition-colors duration-300"
                      title={speaking && !window.speechSynthesis.paused ? 'Pause' : 'Play'}
                    >
                      {speaking && !window.speechSynthesis.paused ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={stopSpeech}
                      disabled={!speaking && !paused}
                      className="p-2 rounded-md bg-yellow-500/10 hover:bg-yellow-500/20 transition-colors duration-300 disabled:opacity-50"
                      title="Stop"
                    >
                      <VolumeX className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="mt-8 pt-6 border-t border-yellow-500/20">
                  <h3 className="text-lg font-medium text-yellow-400 mb-3">Reflection</h3>
                  <p className="text-gray-300 leading-relaxed">
                    {quote?.explanation}
                  </p>
                </div>

                {/* AI Workflow Info */}
                {quote?.category === 'personalized' && (
                  <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-medium text-blue-300">AI Workflow Generated</span>
                    </div>
                    <p className="text-xs text-blue-200 mb-3">
                      This quote was created based on your journal content analysis. The AI also generated personalized recommendations for you.
                    </p>
                    <button
                      onClick={() => navigate('/recommendations')}
                      className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/20 rounded-lg text-xs text-blue-300 transition-colors duration-300"
                    >
                      View AI Recommendations
                    </button>
                  </div>
                )}

                {quote?.isAiGenerated && (
                  <div className="mt-6 flex items-center text-xs text-gray-500">
                    <div className="flex items-center mr-2">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>Updated every 24 hours</span>
                    </div>
                    <span className="mx-2">•</span>
                    <div className="flex items-center">
                      <User className="w-3 h-3 mr-1" />
                      <span>Created especially for {user?.username || 'You'}</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Quote History */}
          <div className="mt-8">
            <div className="bg-gray-900/50 border border-yellow-500/20 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-medium text-yellow-400">Quote History</h2>
                <button onClick={fetchUserQuotes} className="px-3 py-1 rounded-md bg-gray-800 hover:bg-gray-700 text-sm">Refresh</button>
              </div>
              {quotesLoading ? (
                <div className="text-gray-400 text-sm">Loading...</div>
              ) : quotes.length === 0 ? (
                <div className="text-gray-500 text-sm">No quotes yet.</div>
              ) : (
                <div className="space-y-2">
                  {quotes.map((q: any) => (
                    <div key={q._id || q.id} className="flex items-start justify-between bg-gray-800/40 rounded-md p-3">
                      <div>
                        <div className="text-yellow-100 text-sm italic">"{q.quote}"</div>
                        <div className="text-xs text-gray-400 mt-1">— {q.author || 'Unknown'} • {new Date(q.generatedAt).toLocaleString()}</div>
                      </div>
                      <button onClick={() => deleteQuoteById(q._id || q.id)} className="p-1.5 rounded-md bg-red-500/20 hover:bg-red-500/30 border border-red-500/30" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
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