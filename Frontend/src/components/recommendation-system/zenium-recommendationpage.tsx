import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Sparkles, Filter, Brain, Heart, Clock } from 'lucide-react';

type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';
type Goal = 'calm' | 'productive' | 'happy' | 'grateful' | 'motivated';
type Duration = '5' | '10' | '15' | '30';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: 'mindfulness' | 'aktivitas' | 'journaling' | 'gerak' | 'selfcare';
  tags: string[];
  timeOfDay: TimeOfDay[];
  duration: Duration;
  moodImpact: Goal[];
  score: number;
}

export function ZeniumRecommendationPage() {
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning');
  const [goal, setGoal] = useState<Goal>('calm');
  const [duration, setDuration] = useState<Duration>('10');

  const bank: Recommendation[] = useMemo(() => ([
    {
      id: 'rec-1',
      title: '4-7-8 Breathing',
      description: 'Inhale 4s, hold 7s, exhale 8s. Repeat 4x to calm your nervous system.',
      category: 'mindfulness',
      tags: ['relaxation', 'breathwork', 'anxiety'],
      timeOfDay: ['morning', 'night'],
      duration: '5',
      moodImpact: ['calm'],
      score: 0
    },
    {
      id: 'rec-2',
      title: 'Gratitude Journal (3 items)',
      description: 'Write 3 things you are grateful for today and why.',
      category: 'journaling',
      tags: ['gratitude', 'reflection'],
      timeOfDay: ['morning', 'evening', 'night'],
      duration: '10',
      moodImpact: ['grateful', 'happy'],
      score: 0
    },
    {
      id: 'rec-3',
      title: '10-Minute Walk',
      description: 'Step outside, walk gently while noticing your breath and surroundings.',
      category: 'gerak',
      tags: ['light activity', 'endorphins'],
      timeOfDay: ['afternoon', 'evening'],
      duration: '10',
      moodImpact: ['happy', 'motivated'],
      score: 0
    },
    {
      id: 'rec-4',
      title: 'Mini Body Scan',
      description: 'Sit comfortably, move attention from head to toes. Release tension gradually.',
      category: 'mindfulness',
      tags: ['grounding', 'relaxation'],
      timeOfDay: ['morning', 'afternoon', 'night'],
      duration: '5',
      moodImpact: ['calm'],
      score: 0
    },
    {
      id: 'rec-5',
      title: 'Mini Self-Care',
      description: 'Drink warm water, wash your face, play your favorite song for 5 minutes.',
      category: 'selfcare',
      tags: ['routine', 'refreshing'],
      timeOfDay: ['morning', 'evening'],
      duration: '5',
      moodImpact: ['happy', 'motivated'],
      score: 0
    },
    {
      id: 'rec-6',
      title: 'Power Focus 15',
      description: 'Set a 15-minute timer, focus on one small task. Log your progress.',
      category: 'aktivitas',
      tags: ['productive', 'focus'],
      timeOfDay: ['morning', 'afternoon'],
      duration: '15',
      moodImpact: ['productive', 'motivated'],
      score: 0
    },
    {
      id: 'rec-7',
      title: 'Positive Affirmations',
      description: 'Say 3 affirmations: "I am enough", "I am growing", "I move steadily".',
      category: 'mindfulness',
      tags: ['affirmation', 'optimism'],
      timeOfDay: ['morning', 'night'],
      duration: '5',
      moodImpact: ['motivated', 'happy'],
      score: 0
    }
  ]), []);

  const filtered = useMemo(() => {
    // Skor sederhana: cocok timeOfDay +1, cocok goal +2, cocok durasi +1, cocok query di title/desc/tags +1
    const toMinutes = (d: Duration) => parseInt(d, 10);
    return bank
      .map(r => {
        let s = 0;
        if (r.timeOfDay.includes(timeOfDay)) s += 1;
        if (r.moodImpact.includes(goal)) s += 2;
        if (Math.abs(toMinutes(r.duration) - toMinutes(duration)) <= 5) s += 1;
        if (query) {
          const q = query.toLowerCase();
          if (
            r.title.toLowerCase().includes(q) ||
            r.description.toLowerCase().includes(q) ||
            r.tags.some(t => t.toLowerCase().includes(q))
          ) s += 1;
        }
        return { ...r, score: s };
      })
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score);
  }, [bank, timeOfDay, goal, duration, query]);

  return (
    <div className="min-h-screen bg-black text-white">
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
              AI Recommendation (Self-Care)
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

        <div className="mt-4 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search activities or tags (e.g., breathwork, gratitude)..."
            className="w-full pl-10 pr-4 py-2 bg-gray-900/80 border border-yellow-500/20 rounded-lg focus:outline-none focus:border-yellow-500/50 text-white"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {showFilters && (
          <div className="mt-4 p-4 bg-gray-900/80 border border-yellow-500/20 rounded-lg">
            <h3 className="text-sm font-medium text-yellow-400 mb-3">Customize Recommendations</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-2">Time of Day</p>
                <div className="flex flex-wrap gap-2">
                  {(['morning','afternoon','evening','night'] as TimeOfDay[]).map(t => (
                    <button
                      key={t}
                      onClick={() => setTimeOfDay(t)}
                      className={`text-xs px-2 py-1 rounded-full transition-colors duration-300 ${timeOfDay === t ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-2">Goal</p>
                <div className="flex flex-wrap gap-2">
                  {(['calm','productive','happy','grateful','motivated'] as Goal[]).map(g => (
                    <button
                      key={g}
                      onClick={() => setGoal(g)}
                      className={`text-xs px-2 py-1 rounded-full transition-colors duration-300 ${goal === g ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-2">Duration (minutes)</p>
                <div className="flex flex-wrap gap-2">
                  {(['5','10','15','30'] as Duration[]).map(d => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className={`text-xs px-2 py-1 rounded-full transition-colors duration-300 ${duration === d ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={`pt-${showFilters ? '64' : '28'} pb-6 px-4`}>
        <div className="bg-gradient-to-r from-yellow-900/30 via-yellow-800/30 to-yellow-900/30 rounded-lg p-4 border border-yellow-500/30 mb-4">
          <div className="flex items-start">
            <div className="p-2 bg-yellow-500/20 rounded-full mr-4">
              <Sparkles className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-yellow-400">Zenium AI Recommendations</h3>
              <p className="text-sm text-gray-300 mt-1">
                Tailored for you: time <b>{timeOfDay}</b>, goal <b>{goal}</b>, duration about <b>{duration}</b> minutes.
              </p>
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Brain className="w-16 h-16 text-gray-600 mb-4" />
            <h3 className="text-xl font-medium text-gray-400">No suitable recommendations yet</h3>
            <p className="text-gray-500 mt-2">Try adjusting search or filters above</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((rec) => (
              <div 
                key={rec.id} 
                className="bg-gray-900/50 rounded-lg overflow-hidden border border-yellow-500/20 hover:border-yellow-500/40 transition-colors duration-300"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-white">{rec.title}</h3>
                      <p className="text-sm text-gray-300 mt-1">{rec.description}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {rec.tags.map(tag => (
                          <span key={tag} className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full">{tag}</span>
                        ))}
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <div className="flex items-center justify-end text-yellow-400 text-xs">
                        <Clock className="w-4 h-4 mr-1" /> {rec.duration} min
                      </div>
                      <div className="mt-2 flex items-center justify-end text-pink-400 text-xs">
                        <Heart className="w-4 h-4 mr-1" /> {rec.moodImpact.join(', ')}
                      </div>
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