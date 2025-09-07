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
  Brain
} from 'lucide-react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
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
  guidedQuestions?: GuidedQA[];
  voiceTranscript?: string;
  mentalHealthClassification?: 'safe' | 'needs_attention' | 'high_risk';
  riskScore?: number;
  aiInsights?: AIInsights;
  aiRecommendation?: {
    title: string;
    description: string;
    reason: string;
    timeEstimate: string;
    type: string;
    isCompleted: boolean;
    generatedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}



export function ZeniumJournalingPage() {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

  // Add custom styles for animations
  const customStyles = `
    <style>
      @keyframes bounce-in {
        0% { transform: scale(0.3); opacity: 0; }
        50% { transform: scale(1.05); }
        70% { transform: scale(0.9); }
        100% { transform: scale(1); opacity: 1; }
      }
      .animate-bounce-in {
        animation: bounce-in 0.6s ease-out;
      }
    </style>
  `;

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<JournalEntry | null>(null);
  const [guidedQuestions, setGuidedQuestions] = useState<GuidedQA[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // New entry state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<Mood>('neutral');
  const [moodRating, setMoodRating] = useState<number>(5);
  const [voiceTranscript, setVoiceTranscript] = useState('');



  // AI analysis state
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analyzingJournalId, setAnalyzingJournalId] = useState<string | null>(null);

  // Voice recognition
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  const token = useMemo(() => getAuthToken(), []);

  const authHeaders = useMemo(() => (token ? { Authorization: `Bearer ${token}` } : {}), [token]);

  // Fetch entries on mount
  useEffect(() => {
    fetchEntries();
  }, [authHeaders]);



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
  const apiResponse: any = res.data?.data || [];
  const list = apiResponse.map((j: any): JournalEntry => ({
       id: j._id,
       title: j.title,
       content: j.content,
       mood: j.mood,
       moodRating: j.moodRating,
       guidedQuestions: j.guidedQuestions || [],
       voiceTranscript: j.voiceTranscript || '',
       mentalHealthClassification: j.mentalHealthClassification,
       riskScore: j.riskScore,
       aiInsights: j.aiInsights || {},
       aiRecommendation: j.aiRecommendation ? {
         title: j.aiRecommendation.title,
         description: j.aiRecommendation.description,
         reason: j.aiRecommendation.reason,
         timeEstimate: j.aiRecommendation.timeEstimate,
         type: j.aiRecommendation.type,
         isCompleted: j.aiRecommendation.isCompleted,
         generatedAt: j.aiRecommendation.generatedAt,
       } : undefined,
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
        e.content.toLowerCase().includes(q)
      );
    }
    filtered.sort((a, b) => {
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      return sortOrder === 'newest' ? db - da : da - db;
    });
    setFilteredEntries(filtered);
  }, [entries, searchQuery, sortOrder]);

  function resetForm() {
    setTitle('');
    setContent('');
    setMood('neutral');
    setMoodRating(5);
    setVoiceTranscript('');
    setGuidedQuestions([]);
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
        guidedQuestions: j.guidedQuestions || [],
        voiceTranscript: j.voiceTranscript || '',
        mentalHealthClassification: j.mentalHealthClassification,
        riskScore: j.riskScore,
        aiInsights: j.aiInsights || {},
        createdAt: j.createdAt,
        updatedAt: j.updatedAt,
      };
      setEntries(prev => [created, ...prev]);


      resetForm();
      setIsCreating(false);
    } catch (e) {
      console.error('Create journal failed', e);
      Swal.fire('Error', 'Failed to create journal.', 'error');
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
        guidedQuestions: currentEntry.guidedQuestions || [],
        voiceTranscript: currentEntry.voiceTranscript || '',
        privacy: 'private'
      };
      await axios.put(`${apiUrl}/journals/${currentEntry.id}`, body, { headers: authHeaders });

      setIsEditing(false);
      setCurrentEntry(null);
      await Swal.fire({
        title: 'Journal updated successfully',
        text: 'Your journal has been re-analyzed and personalized recommendations have been updated.',
        icon: 'success',
        confirmButtonText: 'Great!',
        timer: 2000,
        timerProgressBar: true
      });
    } catch (e) {
      console.error('Update journal failed', e);
      Swal.fire('Error', 'Failed to update journal.', 'error');
    }
  }

  // Delete entry
  async function deleteEntry(id: string) {
    const res = await Swal.fire({
      title: 'Delete this journal?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444'
    });
    if (!res.isConfirmed) return;
    try {
      await axios.delete(`${apiUrl}/journals/${id}`, { headers: authHeaders });
      setEntries(prev => prev.filter(e => e.id !== id));
      await Swal.fire('Deleted', 'Journal has been deleted.', 'success');
    } catch (e) {
      console.error('Delete journal failed', e);
      Swal.fire('Error', 'Failed to delete journal.', 'error');
    }
  }



  // Analyze (AI): process with backend (Qwen) and generate a personalized quote
  async function analyzeCurrent(contentText: string, moodVal: Mood, moodRatingVal: number, journalId?: string) {
    try {
      if (!contentText || contentText.trim().length < 10) {
        await Swal.fire('Add more detail', 'Please write a bit more (at least 10 characters) before analyzing.', 'info');
        return;
      }

      setAnalysisLoading(true);

      const t = getAuthToken();
      if (!t) {
        await Swal.fire('Login required', 'Please login to analyze your journal.', 'info');
        navigate('/login');
        return;
      }

      // Analyze with backend (uses Qwen under the hood)
      await axios.post(`${apiUrl}/journals/analyze-my-journal`, {
        content: contentText,
        mood: moodVal,
        moodRating: moodRatingVal,
        journalId: journalId || (isEditing ? currentEntry?.id : null)
      }, { headers: { Authorization: `Bearer ${t}` } });

      // Trigger personalized quote generation
      try {
        await axios.get(`${apiUrl}/daily-quote`, {
          headers: { Authorization: `Bearer ${t}` },
          params: { forceNew: true, mood: moodVal }
        });
      } catch (qe) {
        // Quote generation failure is non-blocking
        console.warn('Quote generation failed:', qe);
      }
      await Swal.fire({
        title: 'Analysis complete',
        text: 'AI analysis finished and personalized recommendations have been generated.',
        icon: 'success',
        confirmButtonText: 'Great!',
        timer: 2000,
        timerProgressBar: true
      });

      // Refresh both journal entries and recommendations to show newly generated ones
                                    await fetchEntries();
    } catch (e: any) {
      if (e?.response?.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('token');
        await Swal.fire('Session expired', 'Please login again.', 'info');
        navigate('/login');
        return;
      }
      console.error('Analyze failed', e);
      Swal.fire('Error', 'Failed to analyze content.', 'error');
    } finally {
      setAnalysisLoading(false);
      setAnalyzingJournalId(null);
    }
  }

  // Export to PDF (download directly)
  function exportToPdf() {
    try {
      const t = isEditing ? (currentEntry?.title ?? '') : title;
      const c = isEditing ? (currentEntry?.content ?? '') : content;
      if (!t.trim() || !c.trim()) return;

      // Build PDF using jsPDF
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let y = 15;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text(t, 15, y);
      y += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      const meta = `Mood: ${isEditing ? (currentEntry?.mood ?? mood) : mood}  |  Rating: ${isEditing ? (currentEntry?.moodRating ?? moodRating) : moodRating}/10`;
      doc.text(meta, 15, y);
      y += 8;
      const contentLines = doc.splitTextToSize(c, pageWidth - 30);
      doc.text(contentLines, 15, y);
      // Download directly
      doc.save(`${t.replace(/[^a-z0-9_-]+/gi, '_').slice(0, 40)}.pdf`);
    } catch (e) {
      console.error('Export PDF failed', e);
      Swal.fire('Error', 'Failed to export PDF.', 'error');
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
      Swal.fire('Not supported', 'SpeechRecognition API is not available in this browser.', 'info');
      return;
    }
    const recognition = new SR();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          setVoiceTranscript(prev => `${prev} ${transcript}`.trim());
          setContent(prev => `${prev}\n${transcript}`.trim());
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
    return new Date(dateString).toLocaleDateString('en-US', options);
  }

  function classificationBadge(c?: 'safe' | 'needs_attention' | 'high_risk') {
    if (!c) return null;
    const label = c === 'safe' ? 'Safe' : c === 'needs_attention' ? 'Needs Attention' : 'High Risk';
    const cls = c === 'safe' ? 'bg-green-500/20 text-green-300' : c === 'needs_attention' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-red-500/20 text-red-300';
    return <span className={`text-xs px-2 py-1 rounded-full ${cls}`}>{label}</span>;
  }

  // Pre-analysis badge for journals that haven't been analyzed yet
  function preAnalysisBadge(entry: JournalEntry) {
    if (entry.mentalHealthClassification) return null; // Already analyzed

    const moodRating = entry.moodRating;
    const content = entry.content.toLowerCase();
    const title = entry.title.toLowerCase();

    // Check for negative indicators
    const negativeKeywords = ['sad', 'depressed', 'anxious', 'worried', 'stress', 'alone', 'lonely', 'angry', 'frustrated', 'overwhelmed', 'tired', 'exhausted', 'pain', 'hurt', 'difficult', 'hard'];
    const negativeWords = negativeKeywords.filter(keyword => content.includes(keyword) || title.includes(keyword)).length;

    let preLabel = '';
    let cls = '';

    // Logic for pre-analysis
    if (moodRating <= 4) {
      preLabel = 'May Need Attention';
      cls = 'bg-orange-500/20 text-orange-300';
    } else if (moodRating <= 6 && negativeWords > 2) {
      preLabel = 'Might Need Attention';
      cls = 'bg-yellow-500/20 text-yellow-300';
    } else if (moodRating >= 8) {
      preLabel = 'Looks Good';
      cls = 'bg-green-500/20 text-green-300';
    } else {
      preLabel = 'Neutral Mood';
      cls = 'bg-blue-500/20 text-blue-300';
    }

    return <span className={`text-xs px-2 py-1 rounded-full ${cls}`}>{preLabel}</span>;
  }

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: customStyles }} />
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

            <div className="space-y-6">
              {/* Form editor */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
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
                    <label className="block text-sm font-medium text-gray-400">Content</label>
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

                {/* Actions */}
                <div className="flex flex-wrap gap-2 justify-end">
                  <button
                    onClick={exportToPdf}
                    disabled={isEditing ? !(currentEntry?.title && currentEntry?.content) : !(title && content)}
                    className="px-4 py-2 bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-500/20 rounded-lg transition-colors duration-300 text-yellow-100"
                  >
                    Export as PDF
                  </button>

                  <button
                    onClick={isEditing ? updateEntry : createEntry}
                    disabled={isEditing ? !(currentEntry?.title && currentEntry?.content) : !(title && content)}
                    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-lg transition-colors duration-300 flex items-center"
                  >
                    <Save className="w-4 h-4 mr-2" /> {isEditing ? 'Save to Database' : 'Save to Database'}
                  </button>
                </div>

                {/* AI Workflow Status - REMOVED as requested */}
              </div>
            </div>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Calendar className="w-16 h-16 text-gray-600 mb-4" />
            <h3 className="text-xl font-medium text-gray-400">No journals yet</h3>
            <p className="text-gray-500 mt-2">Start writing your first journal</p>
            {/* Tombol duplikat dihapus dari sini */}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEntries.map((entry) => (
              <div key={entry.id} className="bg-gray-900/50 rounded-lg overflow-hidden border border-yellow-500/20 hover:border-yellow-500/40 transition-colors duration-300 p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-white flex items-center gap-2">
                      {entry.title}
                      {classificationBadge(entry.mentalHealthClassification) || preAnalysisBadge(entry)}
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
            onClick={() => {
              console.log('🔍 Starting analysis for journal:', entry.id);
              console.log('📝 Content:', entry.content.substring(0, 50) + '...');
              setAnalyzingJournalId(entry.id);
              analyzeCurrent(entry.content, entry.mood, entry.moodRating, entry.id)
                .then(result => {
                  console.log('✅ Analysis completed:', result);
                  console.log('🔄 Refreshing data...');
                  fetchEntries();
                })
                .catch(error => {
                  console.error('❌ Analysis failed:', error);
                  console.log('🔍 Response error:', error.response?.data);
                  console.error('❌ Error details:', error.response?.data || error.message);
                })
                .finally(() => {
                  console.log('🔄 Analysis finished, resetting state');
                  setAnalyzingJournalId(null);
                });
            }}
            disabled={analysisLoading || entry.mentalHealthClassification !== null}
            className={`p-1.5 rounded-full transition-colors duration-300 ${
              entry.mentalHealthClassification
                ? 'bg-gray-500/20 cursor-not-allowed'
                : 'bg-blue-500/10 hover:bg-blue-500/20'
            }`}
            title={entry.mentalHealthClassification ? 'Already Analyzed' : 'AI Analyze'}
          >
        {analyzingJournalId === entry.id && analysisLoading ? (
          <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        ) : entry.mentalHealthClassification ? (
          <Brain className="w-4 h-4 text-gray-400" />
        ) : (
          <Brain className="w-4 h-4" />
        )}
      </button>
                    <button
                      onClick={() => { setIsEditing(true); setCurrentEntry(entry); setGuidedQuestions(entry.guidedQuestions || []); setVoiceTranscript(entry.voiceTranscript || ''); }}
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

                {/* AI Recommendation */}
                {entry.aiRecommendation && (
                  <div className="mt-3 bg-blue-500/10 border border-blue-500/20 rounded-lg overflow-hidden">
                    <div className="flex items-start gap-3 p-3">
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Brain className="w-4 h-4 text-blue-400 flex-shrink-0" />
                          <span className="text-xs font-medium text-blue-300">AI Recommendation</span>
                        </div>

                        <h4 className="text-sm font-semibold mb-1 text-white">
                          {entry.aiRecommendation.title}
                        </h4>

                        <p className="text-xs leading-relaxed text-gray-300">
                          {entry.aiRecommendation.description}
                        </p>

                        <div className="flex items-center mt-2">
                          <div className="flex items-center gap-3 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <span className="text-gray-500">Type:</span>
                              <span className="text-blue-300">{entry.aiRecommendation.type}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="text-gray-500">Duration:</span>
                              <span className="text-blue-300">{entry.aiRecommendation.timeEstimate}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </>
);
}
