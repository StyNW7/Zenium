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
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
      {/* Welcome Section */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-r from-yellow-500/10 via-yellow-600/5 to-yellow-500/5 border-yellow-500/20">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {getTimezoneGreeting()}, {user?.username || 'User'}! 
                </h1>
                <p className="text-lg text-gray-300 mb-4">
                  Ready to make today amazing? Let's check in on your wellness journey.
                </p>
                <div className="flex items-center space-x-4">
                  <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                    <Zap className="h-3 w-3 mr-1" />
                    7-day streak
                  </Badge>
                  <Badge variant="outline" className="border-yellow-500/30 text-yellow-400">
                    Level 3 Wellness Warrior
                  </Badge>
                </div>
              </div>
              <div className="hidden md:block relative">
                {uploadedPhoto || user?.profilePhoto ? (
                  <div className="relative">
                    <img
                      src={uploadedPhoto || (user && user.profilePhoto?.startsWith('http') ? user.profilePhoto : `http://localhost:3000/${user?.profilePhoto || ''}`)}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover border-4 border-yellow-500/30"
                    />
                    <Button
                      onClick={triggerFileInput}
                      className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-yellow-500 hover:bg-yellow-600 p-0"
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Camera className="h-5 w-5 text-white" />
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="w-32 h-32 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center border-4 border-yellow-500/30 relative">
                    <User className="h-16 w-16 text-white" />
                    <Button
                      onClick={triggerFileInput}
                      className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-yellow-500 hover:bg-yellow-600 p-0 flex items-center justify-center"
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Upload className="h-5 w-5 text-white" />
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
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-chart-1/10 to-chart-1/5 border-chart-1/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Mood</p>
                <p className="text-2xl font-bold capitalize">{currentMood.mood}</p>
                <p className="text-sm text-muted-foreground">{currentMood.score}/10</p>
              </div>
              <div className="w-12 h-12 bg-chart-1/20 rounded-full flex items-center justify-center">
                <Smile className="h-6 w-6 text-chart-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-chart-2/10 to-chart-2/5 border-chart-2/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Weekly Average</p>
                <p className="text-2xl font-bold">{weeklyAverage}/10</p>
                <p className="text-sm text-chart-2">+0.5 from last week</p>
              </div>
              <div className="w-12 h-12 bg-chart-2/20 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-chart-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-chart-3/10 to-chart-3/5 border-chart-3/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sessions This Week</p>
                <p className="text-2xl font-bold">5</p>
                <p className="text-sm text-chart-3">2 more than last week</p>
              </div>
              <div className="w-12 h-12 bg-chart-3/20 rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-chart-3" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-chart-4/10 to-chart-4/5 border-chart-4/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Goals Completed</p>
                <p className="text-2xl font-bold">3/5</p>
                <p className="text-sm text-chart-4">60% completion</p>
              </div>
              <div className="w-12 h-12 bg-chart-4/20 rounded-full flex items-center justify-center">
                <Target className="h-6 w-6 text-chart-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
              <div className="mt-6 flex space-x-3">
                <Button className="flex-1">
                  <Heart className="h-4 w-4 mr-2" />
                  Log Today's Mood
                </Button>
                <Button variant="outline">View Detailed Analytics</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sidebar Content */}
        <div className="space-y-6">
          {/* Daily Motivation */}
          <motion.div variants={itemVariants}>
            <Card className="bg-gradient-to-br from-accent/10 to-primary/5 border-accent/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-accent" />
                  <span>Daily Inspiration</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <blockquote className="text-lg font-medium text-foreground mb-4 italic">"{todayQuote}"</blockquote>
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  Share This Quote
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Jump into your wellness activities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Chat with Melify
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Read Articles
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Brain className="h-4 w-4 mr-2" />
                  Meditation Session
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Award className="h-4 w-4 mr-2" />
                  View Achievements
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Melify Status */}
          <motion.div variants={itemVariants}>
            <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <Heart className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Melify</h3>
                    <p className="text-sm text-muted-foreground">Your AI Companion</p>
                  </div>
                  <div className="ml-auto">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  "I'm here whenever you need support or just want to chat!"
                </p>
                <Button size="sm" className="w-full">
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
