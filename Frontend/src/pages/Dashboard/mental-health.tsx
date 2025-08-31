"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Brain, Heart, Activity, Target, Award, Zap, Moon, Droplets, Wind } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"

const healthMetrics = [
  { label: "Stress Level", value: 65, color: "bg-orange-500", trend: -5 },
  { label: "Sleep Quality", value: 78, color: "bg-blue-500", trend: +12 },
  { label: "Anxiety Level", value: 45, color: "bg-red-500", trend: -8 },
  { label: "Mood Stability", value: 82, color: "bg-green-500", trend: +15 },
]

const weeklyActivities = [
  { day: "Mon", meditation: 20, exercise: 45, journaling: 15 },
  { day: "Tue", meditation: 15, exercise: 30, journaling: 10 },
  { day: "Wed", meditation: 25, exercise: 60, journaling: 20 },
  { day: "Thu", meditation: 30, exercise: 0, journaling: 25 },
  { day: "Fri", meditation: 20, exercise: 45, journaling: 15 },
  { day: "Sat", meditation: 35, exercise: 90, journaling: 30 },
  { day: "Sun", meditation: 40, exercise: 30, journaling: 35 },
]

export default function MentalHealthPage() {
  const [, setSelectedMetric] = useState(0)

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
            <h1 className="text-3xl font-bold text-foreground">Mental Health Dashboard</h1>
            <p className="text-muted-foreground">Comprehensive overview of your mental wellness journey</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Brain className="h-4 w-4 mr-2" />
            Start Assessment
          </Button>
        </motion.div>

        {/* Health Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {healthMetrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className="border-border/50 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => setSelectedMetric(index)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{metric.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-foreground">{metric.value}%</span>
                      <Badge variant={metric.trend > 0 ? "default" : "secondary"} className="text-xs">
                        {metric.trend > 0 ? "+" : ""}
                        {metric.trend}%
                      </Badge>
                    </div>
                    <Progress value={metric.value} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weekly Activity Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <span>Weekly Wellness Activities</span>
                </CardTitle>
                <CardDescription>Your daily wellness practice breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {weeklyActivities.map((day, index) => (
                    <motion.div
                      key={day.day}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center space-x-4"
                    >
                      <div className="w-12 text-sm font-medium text-muted-foreground">{day.day}</div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div
                              className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${(day.meditation / 45) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-muted-foreground w-8">{day.meditation}m</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${(day.exercise / 90) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-muted-foreground w-8">{day.exercise}m</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${(day.journaling / 35) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-muted-foreground w-8">{day.journaling}m</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="flex items-center justify-center space-x-6 mt-6 pt-4 border-t border-border">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-muted-foreground">Meditation</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-muted-foreground">Exercise</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-muted-foreground">Journaling</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Today's Wellness Score */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <Card className="border-border/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    <span>Today's Wellness Score</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <div className="relative w-24 h-24 mx-auto">
                      <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          className="text-muted"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={`${2 * Math.PI * 40}`}
                          strokeDashoffset={`${2 * Math.PI * 40 * (1 - 0.78)}`}
                          className="text-primary transition-all duration-500"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-foreground">78</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Good progress today!</p>
                      <p className="text-xs text-muted-foreground mt-1">Keep up the great work</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <Card className="border-border/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                  <CardDescription>Boost your wellness right now</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start bg-transparent" size="sm">
                      <Wind className="h-4 w-4 mr-2" />
                      5-min Breathing Exercise
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent" size="sm">
                      <Moon className="h-4 w-4 mr-2" />
                      Sleep Meditation
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent" size="sm">
                      <Zap className="h-4 w-4 mr-2" />
                      Energy Boost Session
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent" size="sm">
                      <Droplets className="h-4 w-4 mr-2" />
                      Stress Relief Guide
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Achievements */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
              <Card className="border-border/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-yellow-500" />
                    <span>Recent Achievements</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Award className="h-4 w-4 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">7-Day Streak</p>
                        <p className="text-xs text-muted-foreground">Consistent mood tracking</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Target className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Meditation Master</p>
                        <p className="text-xs text-muted-foreground">100 minutes this week</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Heart className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Wellness Warrior</p>
                        <p className="text-xs text-muted-foreground">Improved mood stability</p>
                      </div>
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
