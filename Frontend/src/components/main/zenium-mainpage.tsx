import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Quote, 
  Map, 
  BookOpen, 
  Menu,
  X,
  Heart,
  Sparkles,
  Zap,
  Brain,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '@/contexts/authcontext';
import Image from '@/assets/logo.png';

export function ZeniumMainPage() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const navigationItems = [
    {
      id: 'daily-quote',
      title: 'Daily Quote',
      description: 'Inspirational quotes to brighten your day and spark motivation',
      icon: Quote,
      gradient: 'from-yellow-400 via-yellow-500 to-yellow-600',
      bgColor: 'from-yellow-500/10 to-yellow-600/10'
    },
    {
      id: 'map-system',
      title: 'Peace-Finder',
      description: 'Find peace and analyze peaceful percetage in area',
      icon: Map,
      gradient: 'from-yellow-500 via-yellow-400 to-yellow-600',
      bgColor: 'from-yellow-400/10 to-yellow-500/10'
    },
    {
      id: 'recommendation-system',
      title: 'AI Recommendations',
      description: 'Personalized wellness suggestions powered by advanced AI',
      icon: Brain,
      gradient: 'from-yellow-600 via-yellow-500 to-yellow-400',
      bgColor: 'from-yellow-600/10 to-yellow-400/10'
    },
    {
      id: 'journal',
      title: 'Digital Journaling',
      description: 'Express your thoughts and track your emotional journey',
      icon: BookOpen,
      gradient: 'from-yellow-400 via-yellow-600 to-yellow-500',
      bgColor: 'from-yellow-500/10 to-yellow-600/10'
    }
  ];

  const handleNavigation = (itemId: string) => {
    // Perbaikan routing untuk konsistensi
    switch (itemId) {
      case 'user':
        navigate('/user');
        break;
      case 'recommendation-system':
        navigate('/recommendation-system');
        break;
      case 'journal':
        navigate('/journal');
        break;
      case 'daily-quote':
        navigate('/quote');
        break;
      case 'map-system':
        navigate('/map');
        break;
      default:
        console.warn(`Unknown navigation item: ${itemId}`);
    }
    setShowMobileMenu(false);
  };

  const quickStats = [
    { number: "24/7", label: "AI Support", description: "Always available for you" },
    { number: "100%", label: "Privacy", description: "Your data stays secure" },
    { number: "∞", label: "Growth", description: "Unlimited potential" },
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-128 h-128 bg-yellow-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>

      {/* Lightning effects */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 bg-gradient-to-b from-yellow-400 to-transparent opacity-0 animate-pulse"
            style={{
              left: `${20 + i * 15}%`,
              height: `${Math.random() * 200 + 100}px`,
              top: `${Math.random() * 50}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: '2s'
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-yellow-500/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img src={Image} alt="Logo Zenium" className="w-12 h-12" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                  Zenium
                </h1>
                <p className="text-xs text-gray-400">Mental Wellness Platform</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <div className="flex items-center space-x-6">
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.id)}
                    className="text-gray-300 hover:text-yellow-400 transition-all duration-300 text-sm font-medium hover:scale-105"
                  >
                    {item.title}
                  </button>
                ))}
              </div>
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 hover:from-yellow-500/20 hover:to-yellow-600/20 p-2 rounded-lg transition-all duration-300 border border-yellow-500/20 hover:border-yellow-400/40"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-black" />
                  </div>
                </button>

                {/* User Dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-black backdrop-blur-md rounded-xl shadow-2xl border border-yellow-500/20 z-50">
                    <div className="py-2">
                      <div className="px-4 py-3 border-b border-yellow-500/20">
                        <p className="text-sm font-medium text-yellow-400">Welcome back!</p>
                        <p className="text-xs text-gray-400">{user?.username}</p>
                      </div>
                      <button 
                        onClick={() => {
                          handleNavigation('user');
                          setShowUserMenu(false);
                        }}
                        className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-gray-300 hover:text-yellow-400 hover:bg-gradient-to-r hover:from-yellow-500/10 hover:to-yellow-600/10 transition-all duration-300"
                      >
                        <User className="w-4 h-4" />
                        <span>Profile Setting</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 rounded-lg hover:bg-yellow-500/10 transition-colors duration-300 border border-yellow-500/20"
              >
                {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {showMobileMenu && (
          <div className="md:hidden bg-black backdrop-blur-md border-t border-yellow-500/20">
            <div className="container mx-auto px-4 py-4 space-y-2">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    handleNavigation(item.id);
                    setShowMobileMenu(false);
                  }}
                  className="flex items-center space-x-3 w-full p-3 text-left text-gray-300 hover:text-yellow-400 hover:bg-gradient-to-r hover:from-yellow-500/10 hover:to-yellow-600/10 rounded-lg transition-all duration-300"
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6 bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border border-yellow-500/20 rounded-full px-6 py-3 inline-flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 font-medium">Your Mental Wellness Command Center</span>
            </div>

            <h2 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-yellow-300 to-yellow-500 bg-clip-text text-transparent leading-tight">
              AI with empathy,
              <br />
              <span className="text-yellow-400">wellness with purpose</span>
            </h2>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed max-w-4xl mx-auto">
              Connect with <span className="text-yellow-400 font-semibold">Melify</span>, your AI companion, and explore powerful tools designed to support your mental wellness journey with lightning-fast insights and personalized care.
            </p>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-3 gap-6 max-w-2xl mx-auto mb-12">
              {quickStats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 backdrop-blur-sm border border-yellow-500/20 rounded-xl p-4 hover:from-yellow-500/20 hover:to-yellow-600/20 transition-all duration-300"
                >
                  <div className="text-2xl font-bold text-yellow-400 mb-1">{stat.number}</div>
                  <div className="font-semibold text-white text-sm mb-1">{stat.label}</div>
                  <div className="text-gray-400 text-xs">{stat.description}</div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center space-x-2 text-yellow-400 mb-16">
              <Heart className="w-6 h-6 fill-current animate-pulse" />
              <span className="text-lg font-medium">Prioritizing your mental wellbeing</span>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-yellow-400/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-yellow-400 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 relative z-10">
        <div className="container mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="mb-4 bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border border-yellow-500/20 rounded-full px-4 py-2 inline-block">
              <span className="text-yellow-400 font-medium text-sm">Comprehensive Wellness Tools</span>
            </div>
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Everything you need for
              <br />
              <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                mental wellness
              </span>
            </h3>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Explore our powerful suite of tools designed to support your journey to better mental health.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {navigationItems.map((item) => (
              <div
                key={item.id}
                className="group cursor-pointer transform hover:scale-105 transition-all duration-500"
                onClick={() => handleNavigation(item.id)}
              >
                <div className={`bg-gradient-to-br ${item.bgColor} backdrop-blur-sm border border-yellow-500/20 rounded-2xl p-8 hover:border-yellow-400/40 hover:shadow-2xl hover:shadow-yellow-500/10 transition-all duration-500 h-full`}>
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                    <item.icon className="w-8 h-8 text-black" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-yellow-300 transition-colors duration-300">
                    {item.title}
                  </h3>
                  
                  <p className="text-gray-400 text-base leading-relaxed mb-6">
                    {item.description}
                  </p>
                  
                  <div className="flex items-center text-yellow-400 font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <span>Explore now</span>
                    <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/5 to-yellow-400/5" />
        <div className="container mx-auto text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to transform your
              <br />
              <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                mental wellness journey?
              </span>
            </h3>
            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
              Take the first step towards better mental health. Choose any tool above to begin your personalized wellness experience with Zenium.
            </p>
            <div className="flex items-center justify-center space-x-4 text-yellow-400">
              <TrendingUp className="w-5 h-5" />
              <span className="font-medium">Your journey to wellness starts here</span>
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black backdrop-blur-sm border-t border-yellow-500/20 py-12 px-4 relative z-10">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-black" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                Zenium
              </span>
            </div>
            <p className="text-gray-400 text-sm max-w-md mx-auto">
              Empowering mental wellness through innovative AI technology and compassionate design. Your path to better mental health starts today.
            </p>
          </div>
          <div className="text-center text-gray-500 text-sm border-t border-yellow-500/10 pt-8">
            <p>&copy; 2025 Zenium. Built for mental wellness.</p>
          </div>
        </div>
      </footer>

      {/* Click outside handler */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </div>
  );
};