import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Plus,
  Edit2,
  Trash2,
  Search,
  ChevronDown,
  ChevronUp,
  Save,
  X,
  Smile,
  Meh,
  Frown,
  Mic,
  MicOff,
  Sparkles,
  Brain
} from 'lucide-react';
import axios from 'axios';

// Types matching backend
type Mood = 'happy' | 'sad' | 'anxious' | 'stressed' | 'neutral' | 'energetic' | 'tired' | 'excited';

interface GuidedQA {
  question: string;
  answer: string;
}

interface AIInsights {
  sentiment?: 'positive' | 'negative' | 'neutral';
  keywords?: string[];
  recommendations?: string[];
  summary?: string;
}

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: Mood;
  moodRating: number;
  tags: string[];
  guidedQuestions?: GuidedQA[];
  voiceTranscript?: string;
  mentalHealthClassification?: 'safe' | 'needs_attention' | 'high_risk';
  riskScore?: number;
  aiInsights?: AIInsights;
  createdAt: string;
  updatedAt: string;
}

export function ZeniumJournalingPage() {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<JournalEntry | null>(null);
  const [guidedQuestions, setGuidedQuestions] = useState<GuidedQA[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [tagInput, setTagInput] = useState('');

  // New entry state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<Mood>('neutral');
  const [moodRating, setMoodRating] = useState<number>(5);
  const [tags, setTags] = useState<string[]>([]);
  const [voiceTranscript, setVoiceTranscript] = useState('');

  // AI analysis state
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysis, setAnalysis] = useState<{
    aiInsights: AIInsights;
    mentalHealthClassification: 'safe' | 'needs_attention' | 'high_risk';
    riskScore: number;
  } | null>(null);

  // Voice recognition
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Fetch entries on mount
  useEffect(() => {
    fetchEntries();
  }, []);

  const token = useMemo(() => localStorage.getItem('token'), []);

  const authHeaders = useMemo(() => ({
    Authorization: `Bearer ${token}`
  }), [token]);

  const moodOptions: { key: Mood; icon: JSX.Element; color: string }[] = [
    { key: 'happy', icon: <Smile className="w-5 h-5" />, color: 'text-green-400' },
    { key: 'neutral', icon: <Meh className="w-5 h-5" />, color: 'text-yellow-400' },
    { key: 'sad', icon: <Frown className="w-5 h-5" />, color: 'text-red-400' },
    { key: 'anxious', icon: <Frown className="w-5 h-5" />, color: 'text-red-300' },
    { key: 'stressed', icon: <Frown className="w-5 h-5" />, color: 'text-orange-400' },
    { key: 'energetic', icon: <Smile className="w-5 h-5" />, color: 'text-teal-300' },
    { key: 'tired', icon: <Meh className="w-5 h-5" />, color: 'text-sky-300' },
    { key: 'excited', icon: <Smile className="w-5 h-5" />, color: 'text-pink-300' },
  ];

  async function fetchEntries() {
    try {
      if (!token) return navigate('/login');
      setLoading(true);
      const res = await axios.get(`${apiUrl}/journals`, { headers: authHeaders });
      const list = (res.data?.data || []).map((j: any): JournalEntry => ({
        id: j._id,
        title: j.title,
        content: j.content,
        mood: j.mood,
        moodRating: j.moodRating,
        tags: j.tags || [],
        guidedQuestions: j.guidedQuestions || [],
        voiceTranscript: j.voiceTranscript || '',
        mentalHealthClassification: j.mentalHealthClassification,
        riskScore: j.riskScore,
        aiInsights: j.aiInsights || {},
        createdAt: j.createdAt,
        updatedAt: j.updatedAt,
      }));
      setEntries(list);
    } catch (e) {
      console.error('Fetch journals failed', e);
    } finally {
      setLoading(false);
    }
  }

  // Filter + sort
  useEffect(() => {
    let filtered = [...entries];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.content.toLowerCase().includes(q) ||
        e.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    filtered.sort((a, b) => {
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      return sortOrder === 'newest' ? db - da : da - db;
    });
    setFilteredEntries(filtered);
  }, [entries, searchQuery, sortOrder]);

  // Guided questions
  async function loadGuidedQuestions() {
    try {
      if (!token) return navigate('/login');
      const res = await axios.get(`${apiUrl}/journals/guided-questions`, {
        headers: authHeaders,
        params: { mood, recentActivity: '' }
      });
      const qs: string[] = res.data?.data || [];
      setGuidedQuestions(qs.map(q => ({ question: q, answer: '' })));
    } catch (e) {
      console.error('Load guided questions failed', e);
    }
  }

  function addTag() {
    if (!tagInput.trim()) return;
    if (!tags.includes(tagInput.trim())) setTags(prev => [...prev, tagInput.trim()]);
    setTagInput('');
  }

  function removeTag(tag: string) {
    setTags(prev => prev.filter(t => t !== tag));
  }

  function resetForm() {
    setTitle('');
    setContent('');
    setMood('neutral');
    setMoodRating(5);
    setTags([]);
    setVoiceTranscript('');
    setGuidedQuestions([]);
    setAnalysis(null);
  }

  // Create entry
  async function createEntry() {
    if (!title.trim() || !content.trim()) return;
    try {
      const body: any = {
        title,
        content,
        mood,
        moodRating,
        tags,
        guidedQuestions,
        voiceTranscript,
        privacy: 'private'
      };
      const res = await axios.post(`${apiUrl}/journals`, body, { headers: authHeaders });
      const j = res.data?.data;
      const created: JournalEntry = {
        id: j._id,
        title: j.title,
        content: j.content,
        mood: j.mood,
        moodRating: j.moodRating,
        tags: j.tags || [],
        guidedQuestions: j.guidedQuestions || [],
        voiceTranscript: j.voiceTranscript || '',
        mentalHealthClassification: j.mentalHealthClassification,
        riskScore: j.riskScore,
        aiInsights: j.aiInsights || {},
        createdAt: j.createdAt,
        updatedAt: j.updatedAt,
      };
      setEntries(prev => [created, ...prev]);

      // If analysis already done in UI, attach to this new entry
      if (analysis) {
        try {
          await axios.post(`${apiUrl}/journals/${j._id}/analyze-attach`, {}, { headers: authHeaders });
          // Refresh list
          fetchEntries();
        } catch (e) {
          console.error('Attach analysis failed', e);
        }
      }

      resetForm();
      setIsCreating(false);
    } catch (e) {
      console.error('Create journal failed', e);
    }
  }

  // Update entry
  async function updateEntry() {
    if (!currentEntry) return;
    try {
      const body: any = {
        title: currentEntry.title,
        content: currentEntry.content,
        mood: currentEntry.mood,
        moodRating: currentEntry.moodRating,
        tags: currentEntry.tags,
        guidedQuestions: currentEntry.guidedQuestions || [],
        voiceTranscript: currentEntry.voiceTranscript || '',
        privacy: 'private'
      };
      await axios.put(`${apiUrl}/journals/${currentEntry.id}`, body, { headers: authHeaders });
      // Optional: attach analysis to this entry if present in UI
      if (analysis) {
        await axios.post(`${apiUrl}/journals/${currentEntry.id}/analyze-attach`, {}, { headers: authHeaders });
      }
      await fetchEntries();
      setIsEditing(false);
      setCurrentEntry(null);
    } catch (e) {
      console.error('Update journal failed', e);
    }
  }

  // Delete entry
  async function deleteEntry(id: string) {
    if (!confirm('Delete this journal?')) return;
    try {
      await axios.delete(`${apiUrl}/journals/${id}`, { headers: authHeaders });
      setEntries(prev => prev.filter(e => e.id !== id));
    } catch (e) {
      console.error('Delete journal failed', e);
    }
  }

  // Analyze (AI): does not persist immediately
  async function analyzeCurrent(contentText: string, moodVal: Mood, moodRatingVal: number) {
    try {
      setAnalysisLoading(true);
      const res = await axios.post(`${apiUrl}/journals/analyze`, {
        content: contentText,
        mood: moodVal,
        moodRating: moodRatingVal
      }, { headers: authHeaders });
      setAnalysis(res.data?.data || null);
    } catch (e) {
      console.error('Analyze failed', e);
    } finally {
      setAnalysisLoading(false);
    }
  }

  // Voice to text
  function toggleRecording() {
    if (recording) {
      try { recognitionRef.current?.stop?.(); } catch {}
      setRecording(false);
      return;
    }

    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      alert('SpeechRecognition API tidak tersedia di browser ini.');
      return;
    }
    const recognition = new SR();
    recognition.lang = 'id-ID';
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          setVoiceTranscript(prev => `${prev} ${transcript}`.trim());
          setContent(prev => `${prev}\n${transcript}`.trim());
        } else {
          interim += transcript;
        }
      }
    };
    recognition.onend = () => setRecording(false);
    recognition.onerror = () => setRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
  }

  // UI helpers
  function formatDate(dateString: string) {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  }

  function classificationBadge(c?: 'safe' | 'needs_attention' | 'high_risk') {
    if (!c) return null;
    const label = c === 'safe' ? 'Safe' : c === 'needs_attention' ? 'Needs Attention' : 'High Risk';
    const cls = c === 'safe' ? 'bg-green-500/20 text-green-300' : c === 'needs_attention' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-red-500/20 text-red-300';
    return <span className={`text-xs px-2 py-1 rounded-full ${cls}`}>{label}</span>;
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
              Digital Journaling
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
              className="p-2 rounded-full bg-yellow-500/10 hover:bg-yellow-500/20 transition-colors duration-300"
              title={sortOrder === 'newest' ? 'Show oldest first' : 'Show newest first'}
            >
              {sortOrder === 'newest' ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </button>
            <button
              onClick={() => {
                setIsCreating(true);
                setIsEditing(false);
                setCurrentEntry(null);
                resetForm();
              }}
              className="p-2 rounded-full bg-yellow-500/10 hover:bg-yellow-500/20 transition-colors duration-300"
              title="Create New Journal"
            >
              <Plus className="w-5 h-5" />
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
            placeholder="Search journals..."
            className="w-full pl-10 pr-4 py-2 bg-gray-900/80 border border-yellow-500/20 rounded-lg focus:outline-none focus:border-yellow-500/50 text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-28 pb-6 px-4">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-400">Loading journals...</p>
            </div>
          </div>
        ) : isCreating || isEditing ? (
          <div className="bg-gray-900/50 rounded-lg border border-yellow-500/20 p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-yellow-400">{isEditing ? 'Edit Journal' : 'New Journal'}</h2>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setIsEditing(false);
                  setCurrentEntry(null);
                  resetForm();
                }}
                className="p-1 rounded-full hover:bg-gray-800 transition-colors duration-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Left: editor */}
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Judul</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-yellow-500/50 text-white"
                    placeholder="Journal title"
                    value={isEditing ? (currentEntry?.title ?? '') : title}
                    onChange={(e) => isEditing ? setCurrentEntry(prev => prev ? { ...prev, title: e.target.value } : prev) : setTitle(e.target.value)}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-400">Konten</label>
                    <button
                      onClick={toggleRecording}
                      className={`px-2 py-1 rounded-md text-xs border ${recording ? 'border-red-500 text-red-300' : 'border-gray-500 text-gray-300'} hover:bg-gray-800`}
                      title="Voice to Text"
                    >
                      {recording ? <><MicOff className="w-4 h-4 inline-block mr-1" />Stop</> : <><Mic className="w-4 h-4 inline-block mr-1" />Record</>}
                    </button>
                  </div>
                  <textarea
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-yellow-500/50 text-white min-h-[220px]"
                    placeholder="Write your journal here..."
                    value={isEditing ? (currentEntry?.content ?? '') : content}
                    onChange={(e) => isEditing ? setCurrentEntry(prev => prev ? { ...prev, content: e.target.value } : prev) : setContent(e.target.value)}
                  />
                  {voiceTranscript && (
                    <div className="mt-2 text-xs text-gray-400">
                      <span className="font-medium text-gray-300">Transcript:</span> {voiceTranscript}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Mood</label>
                    <div className="flex flex-wrap gap-2">
                      {moodOptions.map(opt => {
                        const active = (isEditing ? currentEntry?.mood : mood) === opt.key;
                        return (
                          <button
                            key={opt.key}
                            className={`px-2 py-1 rounded-md border text-xs ${active ? 'border-yellow-500/50 bg-yellow-500/10' : 'border-gray-700 bg-gray-800'} ${opt.color}`}
                            onClick={() => isEditing
                              ? setCurrentEntry(prev => prev ? { ...prev, mood: opt.key } : prev)
                              : setMood(opt.key)}
                          >
                            <span className="inline-flex items-center gap-1">{opt.icon}{opt.key}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Mood Rating: {isEditing ? currentEntry?.moodRating : moodRating}/10</label>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={isEditing ? (currentEntry?.moodRating ?? 5) : moodRating}
                      onChange={(e) => isEditing
                        ? setCurrentEntry(prev => prev ? { ...prev, moodRating: Number(e.target.value) } : prev)
                        : setMoodRating(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Tags</label>
                  <div className="flex">
                    <input
                      type="text"
                      className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:border-yellow-500/50 text-white"
                      placeholder="Tambahkan tag"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addTag()}
                    />
                    <button
                      onClick={addTag}
                      className="px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-r-lg transition-colors duration-300"
                    >
                      Tambah
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(isEditing ? currentEntry?.tags : tags).map((tag, i) => (
                      <div key={i} className="flex items-center bg-gray-800 text-gray-300 px-2 py-1 rounded-full">
                        <span className="text-xs">{tag}</span>
                        <button onClick={() => isEditing
                          ? setCurrentEntry(prev => prev ? { ...prev, tags: prev.tags.filter(t => t !== tag) } : prev)
                          : removeTag(tag)} className="ml-1 p-0.5 rounded-full hover:bg-gray-700">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Guided Questions */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-400">Guided Journaling</label>
                    <button
                      onClick={loadGuidedQuestions}
                      className="px-2 py-1 text-xs border border-yellow-500/30 rounded-md hover:bg-yellow-500/10"
                    >
                      <Sparkles className="w-4 h-4 inline-block mr-1" /> Load Questions
                    </button>
                  </div>
                  {guidedQuestions.length === 0 ? (
                    <p className="text-xs text-gray-500">Belum ada pertanyaan. Klik "Muat Pertanyaan" untuk menampilkan pertanyaan reflektif.</p>
                  ) : (
                    <div className="space-y-3">
                      {guidedQuestions.map((qa, idx) => (
                        <div key={idx} className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                          <div className="text-sm text-yellow-300 mb-2">Q{idx + 1}. {qa.question}</div>
                          <textarea
                            className="w-full text-sm px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-yellow-500/50 text-white min-h-[80px]"
                            placeholder="Write your answer here..."
                            value={qa.answer}
                            onChange={(e) => setGuidedQuestions(prev => prev.map((x, i) => i === idx ? ({ ...x, answer: e.target.value }) : x))}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 justify-end">
                  <button
                    onClick={() => analyzeCurrent(isEditing ? (currentEntry?.content ?? '') : content, isEditing ? (currentEntry?.mood ?? 'neutral') : mood, isEditing ? (currentEntry?.moodRating ?? 5) : moodRating)}
                    disabled={analysisLoading || !(isEditing ? currentEntry?.content : content)}
                    className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/20 rounded-lg transition-colors duration-300 disabled:opacity-50"
                  >
                    {analysisLoading ? 'Analyzing...' : (<span className="inline-flex items-center gap-2"><Brain className="w-4 h-4" /> AI Analysis</span>)}
                  </button>

                  <button
                    onClick={isEditing ? updateEntry : createEntry}
                    disabled={isEditing ? !(currentEntry?.title && currentEntry?.content) : !(title && content)}
                    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-lg transition-colors duration-300 flex items-center"
                  >
                    <Save className="w-4 h-4 mr-2" /> {isEditing ? 'Update Journal' : 'Save Journal'}
                  </button>
                </div>
              </div>

              {/* Right: Analysis panel */}
              <div className="lg:col-span-1">
                <div className="p-4 bg-gray-900 rounded-lg border border-yellow-500/20">
                  <h3 className="text-sm font-medium text-yellow-400 mb-2">AI Insights</h3>
                  {!analysis ? (
                    <p className="text-xs text-gray-500">No analysis yet. Click the AI Analysis button.</p>
                  ) : (
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Klasifikasi</span>
                        {classificationBadge(analysis.mentalHealthClassification)}
                      </div>
                      <div>
                        <div className="text-gray-400 mb-1">Sentimen</div>
                        <div className="text-gray-200">{analysis.aiInsights.sentiment}</div>
                      </div>
                      {analysis.aiInsights.summary && (
                        <div>
                          <div className="text-gray-400 mb-1">Ringkasan</div>
                          <div className="text-gray-200 whitespace-pre-line">{analysis.aiInsights.summary}</div>
                        </div>
                      )}
                      {!!(analysis.aiInsights.keywords?.length) && (
                        <div>
                          <div className="text-gray-400 mb-1">Kata Kunci</div>
                          <div className="flex flex-wrap gap-1">
                            {analysis.aiInsights.keywords!.map((k, i) => (
                              <span key={i} className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full">{k}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {!!(analysis.aiInsights.recommendations?.length) && (
                        <div>
                          <div className="text-gray-400 mb-1">Recommendations</div>
                          <ul className="list-disc list-inside text-gray-200 space-y-1">
                            {analysis.aiInsights.recommendations!.map((r, i) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div className="text-xs text-gray-400">Risk Score: {(analysis.riskScore * 100).toFixed(0)}%</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Calendar className="w-16 h-16 text-gray-600 mb-4" />
            <h3 className="text-xl font-medium text-gray-400">No journals yet</h3>
            <p className="text-gray-500 mt-2">Start writing your first journal</p>
            <button
              onClick={() => { setIsCreating(true); resetForm(); }}
              className="mt-4 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-lg transition-colors duration-300 flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" /> Create New Journal
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEntries.map((entry) => (
              <div key={entry.id} className="bg-gray-900/50 rounded-lg overflow-hidden border border-yellow-500/20 hover:border-yellow-500/40 transition-colors duration-300 p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-white flex items-center gap-2">
                      {entry.title}
                      {classificationBadge(entry.mentalHealthClassification)}
                    </h3>
                    <div className="flex items-center mt-1 text-sm text-gray-400">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{formatDate(entry.createdAt)}</span>
                      <div className="mx-2 w-1 h-1 bg-gray-600 rounded-full"></div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-gray-400">Mood:</span>
                        <span className="text-gray-200">{entry.mood} ({entry.moodRating}/10)</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => { setIsEditing(true); setCurrentEntry(entry); setAnalysis(null); setGuidedQuestions(entry.guidedQuestions || []); setVoiceTranscript(entry.voiceTranscript || ''); }}
                      className="p-1.5 rounded-full bg-yellow-500/10 hover:bg-yellow-500/20 transition-colors duration-300"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      className="p-1.5 rounded-full bg-red-500/10 hover:bg-red-500/20 transition-colors duration-300"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-gray-300 whitespace-pre-line">{entry.content}</p>
                </div>
                {!!entry.tags.length && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {entry.tags.map((tag, index) => (
                      <span key={index} className="text-xs bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded-full">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}