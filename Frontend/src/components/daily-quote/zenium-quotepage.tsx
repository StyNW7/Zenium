import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Calendar, User, Clock, Trash2, VolumeX, Pause, Play, Brain } from 'lucide-react';
import { useAuth } from '@/contexts/authcontext';
import Swal from 'sweetalert2';
import axios from 'axios';

interface Quote {
  id?: string;
  quote: string;
  author: string;
  explanation: string;
  category?: string;
  generatedAt: Date | string;
  isAiGenerated: boolean;
  isInUserHistory?: boolean;
}

interface ApiQuoteData {
  _id?: string;
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
  const [quotes, setQuotes] = useState<ApiQuoteData[]>([]);
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
      // Don't set loading on refresh, only on initial load
      if (!forceNew) setLoading(true);
      if (forceNew) setRefreshing(true);

      console.log('🔮 Fetching quote from collection...', { forceNew });

      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');

      // Call backend API for quote from JSON collection
      const response = await axios.get(`${apiUrl}/daily-quote`, {
        params: forceNew ? { forceNew: true } : {},
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (response.data.success) {
        const quoteData = {
          id: response.data.data._id || response.data.data.id,
          quote: response.data.data.quote,
          author: response.data.data.author,
          explanation: response.data.data.explanation,
          category: response.data.data.category,
          generatedAt: response.data.data.generatedAt,
          isAiGenerated: response.data.data.isAiGenerated
        };

        console.log('✅ Quote received from collection:', quoteData);
        setQuote(quoteData);
      } else {
        throw new Error(response.data.message || 'Failed to fetch quote');
      }
    } catch (error) {
      console.error('❌ Error fetching quote:', error);
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to load quote from collection';
      Swal.fire('Error', errorMessage, 'error');
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

      if (!token) {
        setQuotesLoading(false);
        return false;
      }

      const resp = await axios.get(`${apiUrl}/quotes`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: 1, limit: 10 }
      });
      const items = resp.data?.data?.quotes || [];

      // Only set the quotes history, don't replace the main quote display
      setQuotes(items);
      setQuotesLoading(false);

      return items.length > 0;
    } catch (error) {
      console.error('Error fetching user quotes:', error);
      setQuotes([]); // Set empty array on error
      return false;
    } finally {
      setQuotesLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      // Always start with a fresh random quote
      await fetchDailyQuote();
      // Load user's quote history in background (but don't replace the main quote)
      await fetchUserQuotes();
      // Already set loading to false in fetchDailyQuote
    })();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setTtsAvailable(true);
    } else {
      setTtsAvailable(false);
    }
    return () => {
      try {
        window.speechSynthesis?.cancel();
      } catch (error) {
        console.error('Failed to cancel speech synthesis on cleanup:', error);
      }
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
    } catch (error) {
      console.error('TTS speak failed:', error);
    }
  };

  const pauseSpeech = () => {
    try {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        setPaused(true);
      }
    } catch (error) {
      console.error('TTS pause failed:', error);
    }
  };

  const stopSpeech = () => {
    try {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      setPaused(false);
      utteranceRef.current = null;
    } catch (error) {
      console.error('TTS stop failed:', error);
    }
  };

  const handleRefresh = async () => {
    console.log('🔮 Getting new quote from collection...');

    try {
      await fetchDailyQuote(true);
      console.log('✅ New quote loaded from collection');
    } catch (error) {
      console.error('❌ Error getting new quote:', error);
      await Swal.fire('Error', 'Failed to load new quote. Please try again.', 'error');
    }
  };

  const deleteQuoteById = async (id: string) => {
    try {
      // Check if this is a temporary quote (not in database)
      if (id && id.startsWith('temp-')) {
        console.log(`Skipping delete for temporary quote: ${id}`);
        // Remove from frontend state only
        setQuotes(prev => prev.filter((q) => (q._id || q.id) !== id));
        return;
      }

      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      await axios.delete(`${apiUrl}/quotes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuotes(prev => prev.filter((q) => (q._id || q.id) !== id));
      if (quote && (quote.id === id)) {
        setQuote(null);
      }
    } catch (error) {
      console.error('Delete quote failed', error);
      // If delete fails, just remove from frontend state anyway
      if ((error as any)?.response?.status === 404) {
        console.log(`Quote ${id} already deleted or doesn't exist, removing from UI`);
        setQuotes(prev => prev.filter((q) => (q._id || q.id) !== id));
      }
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

  const fallbackShare = async (quoteText: string) => {
    try {
      await navigator.clipboard.writeText(`${quoteText}\n\nShared from Zenium Daily Quotes`);
      await Swal.fire('Copied!', 'Quote copied to clipboard.', 'success');
    } catch (error) {
      console.error('Clipboard failed:', error);
      // Fallback: prompt user to copy manually
      Swal.fire({
        title: 'Copy this quote',
        html: `<p class="text-left mb-3">Copy the text below to share:</p>
               <textarea readonly rows="4" class="w-full bg-gray-800 text-white border border-gray-600 rounded p-2 text-sm mb-0">${quoteText}\n\nShared from Zenium Daily Quotes</textarea>`,
        showConfirmButton: true,
        confirmButtonText: 'Close'
      });
    }
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
                  <div className="flex items-center gap-2">
                    {/* Save Quote - Available for all quotes but replaces existing saved quote */}
                    <button
                      onClick={async () => {
                        const result = await Swal.fire({
                          title: 'Save this quote?',
                          text: 'This will save the quote to your personal collection.',
                          icon: 'question',
                          showCancelButton: true,
                          confirmButtonText: 'Save',
                          cancelButtonText: 'Cancel'
                        });

                        if (result.isConfirmed) {
                          try {
                            const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
                            const token = localStorage.getItem('authToken') || localStorage.getItem('token');

                            await axios.post(`${apiUrl}/user-quotes`, {
                              quote: quote.quote,
                              author: quote.author,
                              explanation: quote.explanation,
                              source: 'Quote Page Save'
                            }, {
                              headers: { Authorization: `Bearer ${token}` }
                            });

                            await Swal.fire('Saved!', 'Your quote has been saved successfully!', 'success');
                            await fetchUserQuotes(); // Refresh saved quotes

                          } catch (error) {
                            console.error('Save quote failed:', error);
                            Swal.fire('Error', 'Failed to save quote.', 'error');
                          }
                        }
                      }}
                      className="p-2 rounded-full bg-green-500/10 hover:bg-green-500/20 transition-colors duration-300"
                      title="Save quote to collection"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a3.307 3.307 0 0 0-2.933.133L7 5.293a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3l2.067-.133a3.307 3.307 0 0 0 2.933.133L12 18.646l2.067 1.188a3.307 3.307 0 0 0 2.933-.133L19 19.424a3 3 0 0 0 3-3V8.293a3 3 0 0 0-3-3l-2.067.133a3.307 3.307 0 0 0-2.933-.133L12 4.354z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                      </svg>
                    </button>

                    {/* Share Quote */}
                    <button
                      onClick={async () => {
                        const quoteText = `"${quote.quote}" - ${quote.author || 'Unknown'}`;

                        if (navigator.share) {
                          try {
                            await navigator.share({
                              title: 'Inspiring Quote',
                              text: quoteText,
                              url: window.location.href
                            });
                          } catch (error) {
                            if ((error as Error).name !== 'AbortError') {
                              console.error('Share failed:', error);
                              fallbackShare(quoteText);
                            }
                          }
                        } else {
                          fallbackShare(quoteText);
                        }
                      }}
                      className="p-2 rounded-full bg-blue-500/10 hover:bg-blue-500/20 transition-colors duration-300"
                      title="Share quote"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                    </button>

                    {/* Get New Quote */}
                    <button
                      onClick={handleRefresh}
                      disabled={refreshing}
                      className={`px-3 py-2 rounded-lg font-medium text-sm ${
                        refreshing
                          ? 'bg-yellow-500/20 text-gray-400 cursor-not-allowed'
                          : 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-lg hover:shadow-xl'
                      } transition-all duration-300 transform hover:scale-105`}
                      title={
                        refreshing
                          ? "Loading new quote..."
                          : "Get a new inspirational quote from our collection"
                      }
                    >
                      {refreshing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin mr-2 inline-block" />
                          Loading...
                        </>
                      ) : (
                        <>
                          Get New Quote
                          <RefreshCw className="w-4 h-4 ml-2 inline-block" />
                        </>
                      )}
                    </button>
                  </div>
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
                      onClick={() => navigate('/main')}
                      className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/20 rounded-lg text-xs text-blue-300 transition-colors duration-300"
                    >
                      Go to Main Dashboard
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
                  {quotes.map((q) => (
                    <div key={q._id || q.id} className="flex items-start justify-between bg-gray-800/40 rounded-md p-3">
                      <div>
                        <div className="text-yellow-100 text-sm italic">"{q.quote}"</div>
                        <div className="text-xs text-gray-400 mt-1">— {q.author || 'Unknown'} • {new Date(q.generatedAt).toLocaleString()}</div>
                      </div>
                      <button onClick={() => deleteQuoteById(q._id || q.id || '')} className="p-1.5 rounded-md bg-red-500/20 hover:bg-red-500/30 border border-red-500/30" title="Delete">
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
            <p className="mb-2">✨ Click "Get New Quote" to discover inspirational quotes from our curated collection!</p>
            <p>Carefully selected quotes from philosophers, authors, and thought leaders.</p>
            <p className="mt-1 text-xs text-gray-500">180+ quotes across 20+ categories - always something meaningful to discover</p>
          </div>
        </div>
      </div>
    </div>
  );
};
