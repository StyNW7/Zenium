"use client"

import { motion } from "framer-motion"
import { Heart, Brain, Target, Calendar, TrendingUp, Smile, BookOpen, Award, MessageCircle, Zap, Upload, Camera, User } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/authcontext"
import { getTimezoneGreeting } from "@/lib/utils"
import { useState, useRef } from "react"
import axios from 'axios'

const moodData = [
  { day: "Mon", mood: "happy", score: 8 },
  { day: "Tue", mood: "calm", score: 7 },
  { day: "Wed", mood: "excited", score: 9 },
  { day: "Thu", mood: "neutral", score: 6 },
  { day: "Fri", mood: "happy", score: 8 },
  { day: "Sat", mood: "relaxed", score: 9 },
  { day: "Sun", mood: "content", score: 8 },
]

const motivationalQuotes = [
  "Every small step forward is progress worth celebrating.",
  "Your mental health journey is unique and valuable.",
  "Today is a new opportunity to nurture your wellbeing.",
  "You have the strength to overcome any challenge.",
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export function DashboardOverview() {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(user?.profilePhoto || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentMood = moodData[moodData.length - 1]
  const weeklyAverage = Math.round(moodData.reduce((acc, day) => acc + day.score, 0) / moodData.length)
  const todayQuote = motivationalQuotes[new Date().getDay() % motivationalQuotes.length]

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('profilePhoto', file);

      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');

      const response = await axios.post(`${apiUrl}/user/upload-profile-photo`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.user?.profilePhoto) {
        setUploadedPhoto(response.data.user.profilePhoto);
        // Update user context if needed
        window.location.reload(); // Refresh to show new photo
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Welcome Section */}
      <motion.div variants={itemVariants}>
        <Card className="relative bg-gradient-to-r from-yellow-500/20 via-yellow-600/10 to-yellow-500/20 border-yellow-500/40 hover:border-yellow-500/60 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/5 to-transparent opacity-50"></div>
          <CardContent className="relative p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-900 to-yellow-700 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-yellow-300" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                      {getTimezoneGreeting()}, {user?.username || 'User'}! ✌️
                    </h1>
                  </div>
                </div>

                <p className="text-base sm:text-lg text-gray-300 mb-6 leading-relaxed">
                  Ready to make today amazing? Let's check in on your wellness journey.
                </p>

                <div className="flex items-center gap-4 flex-wrap">
                  <Badge className="bg-gradient-to-r from-yellow-600 to-yellow-500 text-black hover:from-yellow-500 hover:to-yellow-400 border-0 px-4 py-2 text-sm font-medium shadow-lg">
                    <Zap className="h-3 w-3 mr-2" />
                    7-day streak
                  </Badge>
                  <Badge variant="outline" className="border-yellow-500/60 text-yellow-400 hover:border-yellow-400/80 px-4 py-2 text-sm">
                    🏆 Level 3 Wellness Warrior
                  </Badge>
                </div>
              </div>
              <div className="relative flex-shrink-0 mt-4 sm:mt-0">
                {uploadedPhoto || user?.profilePhoto ? (
                  <div className="relative">
                    <img
                      src={uploadedPhoto || (user && user.profilePhoto?.startsWith('http') ? user.profilePhoto : `http://localhost:3000/${user?.profilePhoto || ''}`)}
                      alt="Profile"
                      className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full object-cover border-2 sm:border-4 border-yellow-500/30"
                    />
                    <Button
                      onClick={triggerFileInput}
                      className="absolute -bottom-2 -right-2 sm:bottom-0 sm:right-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-yellow-500 hover:bg-yellow-600 p-0 min-h-[32px] min-w-[32px] sm:min-h-[40px] sm:min-w-[40px]"
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center border-2 sm:border-4 border-yellow-500/30 relative">
                    <User className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 text-white" />
                    <Button
                      onClick={triggerFileInput}
                      className="absolute -bottom-2 -right-2 sm:bottom-0 sm:right-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-yellow-500 hover:bg-yellow-600 p-0 min-h-[32px] min-w-[32px] sm:min-h-[40px] sm:min-w-[40px] flex items-center justify-center"
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      )}
                    </Button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/30 border-gray-700/50 hover:border-yellow-500/50 transition-all duration-200">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-400">Current Mood</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold capitalize text-white">{currentMood.mood}</p>
                <p className="text-xs sm:text-sm text-yellow-400">{currentMood.score}/10</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-700/30 rounded-full flex items-center justify-center">
                <Smile className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/30 border-gray-700/50 hover:border-yellow-500/50 transition-all duration-200">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-400">Weekly Average</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{weeklyAverage}/10</p>
                <p className="text-xs sm:text-sm text-yellow-400">+0.5 from last week</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-700/30 rounded-full flex items-center justify-center">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/30 border-gray-700/50 hover:border-yellow-500/50 transition-all duration-200">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-400">Sessions This Week</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white">5</p>
                <p className="text-xs sm:text-sm text-yellow-400">2 more than last week</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-700/30 rounded-full flex items-center justify-center">
                <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/30 border-gray-700/50 hover:border-yellow-500/50 transition-all duration-200">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-400">Goals Completed</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white">3/5</p>
                <p className="text-xs sm:text-sm text-yellow-400">60% completion</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-700/30 rounded-full flex items-center justify-center">
                <Target className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Mood Tracking */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-primary" />
                <span>Weekly Mood Journey</span>
              </CardTitle>
              <CardDescription>Track your emotional wellbeing throughout the week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {moodData.map((day, index) => (
                  <motion.div
                    key={day.day}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">{day.day}</span>
                      </div>
                      <div>
                        <p className="font-medium capitalize">{day.mood}</p>
                        <p className="text-sm text-muted-foreground">Score: {day.score}/10</p>
                      </div>
                    </div>
                    <Progress value={day.score * 10} className="w-24" />
                  </motion.div>
                ))}
              </div>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Button className="flex-1 sm:flex-[1_1_auto] min-h-11">
                  <Heart className="h-4 w-4 mr-2" />
                  Log Today's Mood
                </Button>
                <Button variant="outline" className="flex-1 sm:flex-[1_1_auto] min-h-11">View Detailed Analytics</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sidebar Content */}
        <div className="space-y-4 sm:space-y-6">
          {/* Daily Motivation */}
          <motion.div variants={itemVariants}>
            <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/30 border-gray-700/50 hover:border-yellow-500/50 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-700/30 rounded-full">
                    <Zap className="h-5 w-5 text-yellow-400" />
                  </div>
                  <span className="text-white font-semibold">Daily Inspiration</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <blockquote className="text-base sm:text-lg font-medium text-gray-200 mb-6 italic border-l-4 border-yellow-500/50 pl-4">
                  "{todayQuote}"
                </blockquote>
                <Button variant="outline" size="sm" className="w-full bg-transparent border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/20 hover:border-yellow-400/80 transition-all duration-200 min-h-11">
                  Share This Quote
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants}>
            <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/30 border-gray-700/50 hover:border-yellow-500/50 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-700/30 rounded-full">
                    <Target className="h-5 w-5 text-yellow-400" />
                  </div>
                  <span className="text-white font-semibold">Quick Actions</span>
                </CardTitle>
                <CardDescription className="text-gray-400 ml-11">Jump into your wellness activities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start bg-transparent hover:bg-yellow-500/20 hover:border-yellow-400/80 transition-colors duration-200 min-h-11 border-yellow-500/50 text-yellow-200">
                  <MessageCircle className="h-4 w-4 mr-3" />
                  Chat with Melify
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent hover:bg-yellow-500/20 hover:border-yellow-400/80 transition-colors duration-200 min-h-11 border-yellow-500/50 text-yellow-200">
                  <BookOpen className="h-4 w-4 mr-3" />
                  Read Articles
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent hover:bg-yellow-500/20 hover:border-yellow-400/80 transition-colors duration-200 min-h-11 border-yellow-500/50 text-yellow-200">
                  <Brain className="h-4 w-4 mr-3" />
                  Meditation Session
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent hover:bg-yellow-500/20 hover:border-yellow-400/80 transition-colors duration-200 min-h-11 border-yellow-500/50 text-yellow-200">
                  <Award className="h-4 w-4 mr-3" />
                  View Achievements
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Melify Status */}
          <motion.div variants={itemVariants}>
            <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/30 border-gray-700/50 hover:border-yellow-500/50 transition-all duration-300">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center space-x-4 mb-5">
                  <div className="w-14 h-14 bg-gradient-to-br from-yellow-900 to-yellow-700 rounded-full flex items-center justify-center shadow-lg">
                    <Heart className="h-7 w-7 text-yellow-300" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-lg">Melify</h3>
                    <p className="text-sm text-gray-400">Your AI Companion</p>
                  </div>
                  <div className="w-4 h-4 bg-yellow-400 rounded-full animate-pulse shadow-lg"></div>
                </div>
                <p className="text-sm text-gray-300 mb-6 italic leading-relaxed">
                  I'm here whenever you need support or just want to chat!
                </p>
                <Button size="sm" className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-semibold min-h-11 shadow-lg">
                  Connect with Melify
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
