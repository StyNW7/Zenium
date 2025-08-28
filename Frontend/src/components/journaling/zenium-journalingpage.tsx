import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Plus, Edit2, Trash2, Search, ChevronDown, ChevronUp, Save, X, Smile, Meh, Frown, Sun, Cloud, CloudRain, Moon } from 'lucide-react';
import axios from 'axios';

interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  mood: 'happy' | 'neutral' | 'sad';
  weather: 'sunny' | 'cloudy' | 'rainy' | 'night';
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export function ZeniumJournalingPage() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<JournalEntry | null>(null);
  const [newEntry, setNewEntry] = useState<Partial<JournalEntry>>({
    title: '',
    content: '',
    mood: 'neutral',
    weather: 'sunny',
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Fetch journal entries
  useEffect(() => {
    fetchJournalEntries();
  }, []);

  // Filter and sort entries
  useEffect(() => {
    let filtered = [...entries];
    
    if (searchQuery) {
      filtered = filtered.filter(entry => 
        entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
    
    setFilteredEntries(filtered);
  }, [entries, searchQuery, sortOrder]);

  // Fungsi untuk mendapatkan data jurnal
  const fetchJournalEntries = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/journals`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.data) {
        // Transform API response to match our interface
        const journalEntries = response.data.data.map((entry: any) => ({
          id: entry._id,
          date: new Date(entry.createdAt).toISOString().split('T')[0],
          title: entry.title,
          content: entry.content,
          mood: entry.mood,
          weather: entry.location?.address ? 'sunny' : 'cloudy', // Default weather based on location
          tags: entry.tags || [],
          createdAt: entry.createdAt,
          updatedAt: entry.updatedAt
        }));
        
        setEntries(journalEntries);
      }
    } catch (error) {
      console.error('Error fetching journal entries:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk membuat entri baru
  const createEntry = async () => {
    if (!newEntry.title || !newEntry.content) return;

    try {
      // Dalam implementasi nyata, ini akan memanggil API backend
      const currentDate = new Date();
      const formattedDate = currentDate.toISOString().split('T')[0];
      
      const createdEntry: JournalEntry = {
        id: Date.now().toString(),
        date: formattedDate,
        title: newEntry.title || '',
        content: newEntry.content || '',
        mood: newEntry.mood as 'happy' | 'neutral' | 'sad',
        weather: newEntry.weather as 'sunny' | 'cloudy' | 'rainy' | 'night',
        tags: newEntry.tags || [],
        createdAt: currentDate.toISOString(),
        updatedAt: currentDate.toISOString(),
      };

      setEntries([createdEntry, ...entries]);
      resetForm();
      setIsCreating(false);
    } catch (error) {
      console.error('Error creating journal entry:', error);
    }
  };

  // Fungsi untuk mengupdate entri
  const updateEntry = async () => {
    if (!currentEntry || !currentEntry.title || !currentEntry.content) return;

    try {
      // Dalam implementasi nyata, ini akan memanggil API backend
      const updatedEntries = entries.map(entry => {
        if (entry.id === currentEntry.id) {
          return {
            ...currentEntry,
            updatedAt: new Date().toISOString(),
          };
        }
        return entry;
      });

      setEntries(updatedEntries);
      resetForm();
      setIsEditing(false);
      setCurrentEntry(null);
    } catch (error) {
      console.error('Error updating journal entry:', error);
    }
  };

  // Fungsi untuk menghapus entri
  const deleteEntry = async (id: string) => {
    try {
      // Dalam implementasi nyata, ini akan memanggil API backend
      const updatedEntries = entries.filter(entry => entry.id !== id);
      setEntries(updatedEntries);
    } catch (error) {
      console.error('Error deleting journal entry:', error);
    }
  };

  // Fungsi untuk menambahkan tag
  const addTag = () => {
    if (!tagInput.trim()) return;
    
    if (isEditing && currentEntry) {
      if (!currentEntry.tags.includes(tagInput.trim())) {
        setCurrentEntry({
          ...currentEntry,
          tags: [...currentEntry.tags, tagInput.trim()]
        });
      }
    } else {
      if (!newEntry.tags?.includes(tagInput.trim())) {
        setNewEntry({
          ...newEntry,
          tags: [...(newEntry.tags || []), tagInput.trim()]
        });
      }
    }
    
    setTagInput('');
  };

  // Fungsi untuk menghapus tag
  const removeTag = (tag: string) => {
    if (isEditing && currentEntry) {
      setCurrentEntry({
        ...currentEntry,
        tags: currentEntry.tags.filter(t => t !== tag)
      });
    } else {
      setNewEntry({
        ...newEntry,
        tags: newEntry.tags?.filter(t => t !== tag) || []
      });
    }
  };

  // Fungsi untuk reset form
  const resetForm = () => {
    setNewEntry({
      title: '',
      content: '',
      mood: 'neutral',
      weather: 'sunny',
      tags: [],
    });
    setTagInput('');
  };

  // Fungsi untuk edit entri
  const startEditing = (entry: JournalEntry) => {
    setCurrentEntry(entry);
    setIsEditing(true);
    setIsCreating(false);
  };

  // Fungsi untuk format tanggal
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  // Render icon mood
  const renderMoodIcon = (mood: 'happy' | 'neutral' | 'sad') => {
    switch (mood) {
      case 'happy':
        return <Smile className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />;
      case 'neutral':
        return <Meh className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />;
      case 'sad':
        return <Frown className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />;
      default:
        return null;
    }
  };

  // Render icon cuaca
  const renderWeatherIcon = (weather: 'sunny' | 'cloudy' | 'rainy' | 'night') => {
    switch (weather) {
      case 'sunny':
        return <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />;
      case 'cloudy':
        return <Cloud className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />;
      case 'rainy':
        return <CloudRain className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />;
      case 'night':
        return <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header - responsive */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-black/80 backdrop-blur-md border-b border-yellow-500/20 px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/main')}
              className="mr-2 sm:mr-4 p-2 rounded-full bg-yellow-500/10 hover:bg-yellow-500/20 transition-colors duration-300 touch-manipulation"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
              Digital Journaling
            </h1>
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button 
              onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
              className="p-2 rounded-full bg-yellow-500/10 hover:bg-yellow-500/20 transition-colors duration-300 touch-manipulation"
              title={sortOrder === 'newest' ? 'Terlama Dulu' : 'Terbaru Dulu'}
            >
              {sortOrder === 'newest' ? <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" /> : <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
            <button 
              onClick={() => {
                setIsCreating(true);
                setIsEditing(false);
                setCurrentEntry(null);
              }}
              className="p-2 rounded-full bg-yellow-500/10 hover:bg-yellow-500/20 transition-colors duration-300 touch-manipulation"
              title="Buat Jurnal Baru"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar - responsive */}
        <div className="mt-3 sm:mt-4 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Cari jurnal..."
            className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 bg-gray-900/80 border border-yellow-500/20 rounded-lg focus:outline-none focus:border-yellow-500/50 text-white text-sm sm:text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Main Content - responsive padding */}
      <div className="pt-24 sm:pt-28 pb-4 px-3 sm:px-4">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-400 text-sm sm:text-base">Memuat jurnal...</p>
            </div>
          </div>
        ) : isCreating || isEditing ? (
          <div className="bg-gray-900/50 rounded-lg border border-yellow-500/20 p-3 sm:p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base sm:text-lg font-medium text-yellow-400">
                {isEditing ? 'Edit Jurnal' : 'Jurnal Baru'}
              </h2>
              <button 
                onClick={() => {
                  setIsCreating(false);
                  setIsEditing(false);
                  setCurrentEntry(null);
                  resetForm();
                }}
                className="p-1 rounded-full hover:bg-gray-800 transition-colors duration-300 touch-manipulation"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1">Judul</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-yellow-500/50 text-white text-sm sm:text-base"
                  placeholder="Judul jurnal"
                  value={isEditing ? currentEntry?.title || '' : newEntry.title || ''}
                  onChange={(e) => isEditing 
                    ? setCurrentEntry({ ...currentEntry!, title: e.target.value })
                    : setNewEntry({ ...newEntry, title: e.target.value })
                  }
                />
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1">Konten</label>
                <textarea
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-yellow-500/50 text-white min-h-[150px] sm:min-h-[200px] text-sm sm:text-base resize-none"
                  placeholder="Tulis jurnal Anda di sini..."
                  value={isEditing ? currentEntry?.content || '' : newEntry.content || ''}
                  onChange={(e) => isEditing 
                    ? setCurrentEntry({ ...currentEntry!, content: e.target.value })
                    : setNewEntry({ ...newEntry, content: e.target.value })
                  }
                ></textarea>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">Mood</label>
                  <div className="flex space-x-2">
                    <button 
                      className={`p-2 sm:p-3 rounded-lg flex items-center justify-center flex-1 sm:flex-none ${(isEditing ? currentEntry?.mood : newEntry.mood) === 'happy' ? 'bg-green-500/20 border border-green-500/50' : 'bg-gray-800 border border-gray-700'} touch-manipulation`}
                      onClick={() => isEditing 
                        ? setCurrentEntry({ ...currentEntry!, mood: 'happy' })
                        : setNewEntry({ ...newEntry, mood: 'happy' })
                      }
                    >
                      <Smile className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                    </button>
                    <button 
                      className={`p-2 sm:p-3 rounded-lg flex items-center justify-center flex-1 sm:flex-none ${(isEditing ? currentEntry?.mood : newEntry.mood) === 'neutral' ? 'bg-yellow-500/20 border border-yellow-500/50' : 'bg-gray-800 border border-gray-700'} touch-manipulation`}
                      onClick={() => isEditing 
                        ? setCurrentEntry({ ...currentEntry!, mood: 'neutral' })
                        : setNewEntry({ ...newEntry, mood: 'neutral' })
                      }
                    >
                      <Meh className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                    </button>
                    <button 
                      className={`p-2 sm:p-3 rounded-lg flex items-center justify-center flex-1 sm:flex-none ${(isEditing ? currentEntry?.mood : newEntry.mood) === 'sad' ? 'bg-red-500/20 border border-red-500/50' : 'bg-gray-800 border border-gray-700'} touch-manipulation`}
                      onClick={() => isEditing 
                        ? setCurrentEntry({ ...currentEntry!, mood: 'sad' })
                        : setNewEntry({ ...newEntry, mood: 'sad' })
                      }
                    >
                      <Frown className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">Cuaca</label>
                  <div className="grid grid-cols-4 gap-2">
                    <button 
                      className={`p-2 sm:p-3 rounded-lg flex items-center justify-center ${(isEditing ? currentEntry?.weather : newEntry.weather) === 'sunny' ? 'bg-yellow-500/20 border border-yellow-500/50' : 'bg-gray-800 border border-gray-700'} touch-manipulation`}
                      onClick={() => isEditing 
                        ? setCurrentEntry({ ...currentEntry!, weather: 'sunny' })
                        : setNewEntry({ ...newEntry, weather: 'sunny' })
                      }
                    >
                      <Sun className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                    </button>
                    <button 
                      className={`p-2 sm:p-3 rounded-lg flex items-center justify-center ${(isEditing ? currentEntry?.weather : newEntry.weather) === 'cloudy' ? 'bg-gray-500/20 border border-gray-500/50' : 'bg-gray-800 border border-gray-700'} touch-manipulation`}
                      onClick={() => isEditing 
                        ? setCurrentEntry({ ...currentEntry!, weather: 'cloudy' })
                        : setNewEntry({ ...newEntry, weather: 'cloudy' })
                      }
                    >
                      <Cloud className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                    </button>
                    <button 
                      className={`p-2 sm:p-3 rounded-lg flex items-center justify-center ${(isEditing ? currentEntry?.weather : newEntry.weather) === 'rainy' ? 'bg-blue-500/20 border border-blue-500/50' : 'bg-gray-800 border border-gray-700'} touch-manipulation`}
                      onClick={() => isEditing 
                        ? setCurrentEntry({ ...currentEntry!, weather: 'rainy' })
                        : setNewEntry({ ...newEntry, weather: 'rainy' })
                      }
                    >
                      <CloudRain className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                    </button>
                    <button 
                      className={`p-2 sm:p-3 rounded-lg flex items-center justify-center ${(isEditing ? currentEntry?.weather : newEntry.weather) === 'night' ? 'bg-indigo-500/20 border border-indigo-500/50' : 'bg-gray-800 border border-gray-700'} touch-manipulation`}
                      onClick={() => isEditing 
                        ? setCurrentEntry({ ...currentEntry!, weather: 'night' })
                        : setNewEntry({ ...newEntry, weather: 'night' })
                      }
                    >
                      <Moon className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1">Tag</label>
                <div className="flex">
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:border-yellow-500/50 text-white text-sm sm:text-base"
                    placeholder="Tambahkan tag"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <button 
                    onClick={addTag}
                    className="px-2 sm:px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-r-lg transition-colors duration-300 text-xs sm:text-sm touch-manipulation"
                  >
                    <span className="hidden sm:inline">Tambah</span>
                    <span className="sm:hidden">+</span>
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2">
                  {(isEditing ? currentEntry?.tags : newEntry.tags)?.map((tag, index) => (
                    <div 
                      key={index} 
                      className="flex items-center bg-gray-800 text-gray-300 px-2 py-1 rounded-full"
                    >
                      <span className="text-xs">{tag}</span>
                      <button 
                        onClick={() => removeTag(tag)}
                        className="ml-1 p-0.5 rounded-full hover:bg-gray-700 touch-manipulation"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end pt-2">
                <button 
                  onClick={isEditing ? updateEntry : createEntry}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2.5 bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-lg transition-colors duration-300 flex items-center justify-center text-sm sm:text-base touch-manipulation"
                  disabled={!(isEditing ? currentEntry?.title && currentEntry?.content : newEntry.title && newEntry.content)}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isEditing ? 'Update Jurnal' : 'Simpan Jurnal'}
                </button>
              </div>
            </div>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center px-4">
            <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600 mb-4" />
            <h3 className="text-lg sm:text-xl font-medium text-gray-400">Belum ada jurnal</h3>
            <p className="text-sm sm:text-base text-gray-500 mt-2">Mulai tulis jurnal pertama Anda</p>
            <button 
              onClick={() => setIsCreating(true)}
              className="mt-4 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-lg transition-colors duration-300 flex items-center text-sm sm:text-base touch-manipulation"
            >
              <Plus className="w-4 h-4 mr-2" />
              Buat Jurnal Baru
            </button>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filteredEntries.map((entry) => (
              <div 
                key={entry.id} 
                className="bg-gray-900/50 rounded-lg overflow-hidden border border-yellow-500/20 hover:border-yellow-500/40 transition-colors duration-300 p-3 sm:p-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-medium text-white truncate pr-2">{entry.title}</h3>
                    <div className="flex flex-wrap items-center mt-1 text-xs sm:text-sm text-gray-400 gap-2">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        <span className="truncate">{formatDate(entry.date)}</span>
                      </div>
                      <div className="w-1 h-1 bg-gray-600 rounded-full hidden sm:block"></div>
                      <div className="flex items-center gap-1">
                        {renderMoodIcon(entry.mood)}
                        {renderWeatherIcon(entry.weather)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-1 flex-shrink-0 ml-2">
                    <button 
                      onClick={() => startEditing(entry)}
                      className="p-1.5 rounded-full bg-yellow-500/10 hover:bg-yellow-500/20 transition-colors duration-300 touch-manipulation"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                    <button 
                      onClick={() => deleteEntry(entry.id)}
                      className="p-1.5 rounded-full bg-red-500/10 hover:bg-red-500/20 transition-colors duration-300 touch-manipulation"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-2 sm:mt-3">
                  <p className="text-gray-300 whitespace-pre-line text-sm sm:text-base leading-relaxed">{entry.content}</p>
                </div>
                
                {entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2 sm:mt-3">
                    {entry.tags.map((tag, index) => (
                      <span 
                        key={index} 
                        className="text-xs bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded-full"
                      >
                        #{tag}
                      </span>
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
};