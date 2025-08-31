"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Calendar, ChevronLeft, ChevronRight, TrendingUp, Heart, Smile, Frown, Meh, Angry, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"

// Define types for our data structures
type MoodType = "happy" | "sad" | "anxious" | "calm" | "excited" | "neutral" | "angry"

interface MoodEntry {
  mood: MoodType
  intensity: number
  note: string
}

interface MoodEmojiConfig {
  icon: React.ComponentType<{ className?: string }>
  color: string
  bg: string
  label: string
}

interface MoodData {
  [key: string]: MoodEntry
}

// Mock mood data
const moodData: MoodData = {
  "2024-01-15": { mood: "happy", intensity: 4, note: "Great day at work!" },
  "2024-01-14": { mood: "calm", intensity: 3, note: "Peaceful evening meditation" },
  "2024-01-13": { mood: "anxious", intensity: 2, note: "Stressful meeting" },
  "2024-01-12": { mood: "excited", intensity: 5, note: "Started new project" },
  "2024-01-11": { mood: "sad", intensity: 2, note: "Missing family" },
  "2024-01-10": { mood: "happy", intensity: 4, note: "Good workout session" },
  "2024-01-09": { mood: "neutral", intensity: 3, note: "Regular day" },
  "2024-01-08": { mood: "happy", intensity: 4, note: "Lunch with friends" },
}

const moodEmojis: Record<MoodType, MoodEmojiConfig> = {
  happy: { icon: Smile, color: "text-yellow-500", bg: "bg-yellow-100", label: "Happy" },
  sad: { icon: Frown, color: "text-blue-500", bg: "bg-blue-100", label: "Sad" },
  anxious: { icon: Zap, color: "text-orange-500", bg: "bg-orange-100", label: "Anxious" },
  calm: { icon: Heart, color: "text-green-500", bg: "bg-green-100", label: "Calm" },
  excited: { icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-100", label: "Excited" },
  neutral: { icon: Meh, color: "text-gray-500", bg: "bg-gray-100", label: "Neutral" },
  angry: { icon: Angry, color: "text-red-500", bg: "bg-red-100", label: "Angry" },
}

export default function MoodTrackerPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 0, 15)) // January 15, 2024
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-16" />)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDate(currentDate.getFullYear(), currentDate.getMonth(), day)
      const dayMood = moodData[dateStr]
      const isSelected = selectedDate === dateStr

      days.push(
        <motion.div
          key={day}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`h-16 border border-border rounded-lg cursor-pointer transition-all duration-200 ${
            isSelected ? "ring-2 ring-primary" : "hover:border-primary/50"
          }`}
          onClick={() => setSelectedDate(isSelected ? null : dateStr)}
        >
          <div className="h-full p-2 flex flex-col justify-between">
            <span className="text-sm font-medium text-foreground">{day}</span>
            {dayMood && (
              <div className="flex justify-center">
                {(() => {
                  const moodConfig = moodEmojis[dayMood.mood]
                  const MoodIcon = moodConfig.icon
                  return <MoodIcon className={`h-4 w-4 ${moodConfig.color}`} />
                })()}
              </div>
            )}
          </div>
        </motion.div>,
      )
    }

    return days
  }

  const selectedMoodData = selectedDate ? moodData[selectedDate] : null

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground">Mood Tracker</h1>
            <p className="text-muted-foreground">Track your emotional journey and identify patterns</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Heart className="h-4 w-4 mr-2" />
            Log Today's Mood
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card className="border-border/50 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <CardTitle className="text-xl">
                      {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                    </CardTitle>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="h-8 flex items-center justify-center">
                      <span className="text-sm font-medium text-muted-foreground">{day}</span>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">{renderCalendar()}</div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Mood Details & Stats */}
          <div className="space-y-6">
            {/* Selected Day Details */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <Card className="border-border/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {selectedDate
                      ? `${new Date(selectedDate).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                        })}`
                      : "Select a Date"}
                  </CardTitle>
                  <CardDescription>
                    {selectedMoodData ? "Mood details for this day" : "Click on a calendar day to see details"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedMoodData ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        {(() => {
                          const moodConfig = moodEmojis[selectedMoodData.mood]
                          const MoodIcon = moodConfig.icon

                          return (
                            <>
                              <div className={`p-3 rounded-full ${moodConfig.bg}`}>
                                <MoodIcon className={`h-6 w-6 ${moodConfig.color}`} />
                              </div>
                              <div>
                                <h3 className="font-semibold text-foreground">{moodConfig.label}</h3>
                                <p className="text-sm text-muted-foreground">
                                  Intensity: {selectedMoodData.intensity}/5
                                </p>
                              </div>
                            </>
                          )
                        })()}
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-sm text-foreground">{selectedMoodData.note}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">No date selected</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Mood Legend */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <Card className="border-border/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Mood Legend</CardTitle>
                  <CardDescription>Understanding your mood colors</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(moodEmojis).map(([mood, config]) => (
                      <div key={mood} className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${config.bg}`}>
                          <config.icon className={`h-4 w-4 ${config.color}`} />
                        </div>
                        <span className="text-sm font-medium text-foreground">{config.label}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Stats */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <Card className="border-border/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">This Month</CardTitle>
                  <CardDescription>Your mood summary</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Days tracked</span>
                      <Badge variant="secondary">8 days</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Most common</span>
                      <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Happy</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Average intensity</span>
                      <Badge variant="outline">3.4/5</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}