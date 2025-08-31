"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Target,
  Plus,
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
  Flag,
  Star,
  Zap,
  Heart,
  Brain,
  Activity,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"

const goals = [
  {
    id: 1,
    title: "Daily Meditation Practice",
    description: "Meditate for 20 minutes every day",
    category: "Mindfulness",
    progress: 75,
    target: 30,
    current: 22,
    unit: "days",
    deadline: "2024-02-15",
    priority: "high",
    icon: Brain,
    color: "bg-purple-500",
    status: "active",
  },
  {
    id: 2,
    title: "Improve Sleep Quality",
    description: "Get 8 hours of quality sleep nightly",
    category: "Sleep",
    progress: 60,
    target: 8,
    current: 6.8,
    unit: "hours avg",
    deadline: "2024-03-01",
    priority: "high",
    icon: Clock,
    color: "bg-blue-500",
    status: "active",
  },
  {
    id: 3,
    title: "Weekly Therapy Sessions",
    description: "Attend therapy sessions consistently",
    category: "Professional Help",
    progress: 100,
    target: 4,
    current: 4,
    unit: "sessions",
    deadline: "2024-01-31",
    priority: "medium",
    icon: Heart,
    color: "bg-red-500",
    status: "completed",
  },
  {
    id: 4,
    title: "Stress Management",
    description: "Reduce daily stress levels through various techniques",
    category: "Wellness",
    progress: 45,
    target: 100,
    current: 45,
    unit: "% improvement",
    deadline: "2024-04-01",
    priority: "high",
    icon: Zap,
    color: "bg-yellow-500",
    status: "active",
  },
  {
    id: 5,
    title: "Physical Exercise",
    description: "Exercise 3 times per week for mental health",
    category: "Physical",
    progress: 85,
    target: 12,
    current: 10,
    unit: "sessions",
    deadline: "2024-02-28",
    priority: "medium",
    icon: Activity,
    color: "bg-green-500",
    status: "active",
  },
]

const milestones = [
  { date: "2024-01-15", title: "Started meditation journey", type: "start" },
  { date: "2024-01-20", title: "First week of consistent practice", type: "achievement" },
  { date: "2024-01-25", title: "Completed therapy intake", type: "milestone" },
  { date: "2024-02-01", title: "Reached 50% stress reduction", type: "achievement" },
]

export default function GoalsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedGoal, setSelectedGoal] = useState<number | null>(null)

  const categories = ["all", "Mindfulness", "Sleep", "Professional Help", "Wellness", "Physical"]

  const filteredGoals = selectedCategory === "all" ? goals : goals.filter((goal) => goal.category === selectedCategory)

  const activeGoals = goals.filter((goal) => goal.status === "active")
  const completedGoals = goals.filter((goal) => goal.status === "completed")
  const averageProgress = Math.round(activeGoals.reduce((sum, goal) => sum + goal.progress, 0) / activeGoals.length)

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
            <h1 className="text-3xl font-bold text-foreground">Goals & Targets</h1>
            <p className="text-muted-foreground">Track your mental health goals and celebrate achievements</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Add New Goal
          </Button>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-border/50 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{activeGoals.length}</p>
                    <p className="text-sm text-muted-foreground">Active Goals</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-border/50 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-green-100 rounded-full">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{completedGoals.length}</p>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border-border/50 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{averageProgress}%</p>
                    <p className="text-sm text-muted-foreground">Avg Progress</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="border-border/50 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <Star className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">12</p>
                    <p className="text-sm text-muted-foreground">Milestones</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Goals List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Category Filter */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <Card className="border-border/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Filter by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                        className="capitalize"
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Goals Grid */}
            <div className="space-y-4">
              {filteredGoals.map((goal, index) => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    className={`border-border/50 shadow-lg hover:shadow-xl transition-all cursor-pointer ${
                      selectedGoal === goal.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setSelectedGoal(selectedGoal === goal.id ? null : goal.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className={`p-3 ${goal.color} rounded-full`}>
                          <goal.icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-foreground">{goal.title}</h3>
                              <p className="text-sm text-muted-foreground">{goal.description}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant={goal.priority === "high" ? "destructive" : "secondary"}>
                                {goal.priority}
                              </Badge>
                              {goal.status === "completed" && <CheckCircle className="h-5 w-5 text-green-500" />}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium text-foreground">
                                {goal.current} / {goal.target} {goal.unit}
                              </span>
                            </div>
                            <Progress value={goal.progress} className="h-2" />
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>{goal.progress}% complete</span>
                              <span>Due: {new Date(goal.deadline).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Goal Details */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <Card className="border-border/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">{selectedGoal ? "Goal Details" : "Select a Goal"}</CardTitle>
                  <CardDescription>
                    {selectedGoal ? "Detailed progress and insights" : "Click on a goal to see details"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedGoal ? (
                    <div className="space-y-4">
                      {(() => {
                        const goal = goals.find((g) => g.id === selectedGoal)!
                        return (
                          <>
                            <div className="flex items-center space-x-3">
                              <div className={`p-3 ${goal.color} rounded-full`}>
                                <goal.icon className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-foreground">{goal.title}</h3>
                                <Badge variant="outline">{goal.category}</Badge>
                              </div>
                            </div>
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Current Progress</span>
                                <span className="text-sm font-medium">{goal.progress}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Target Date</span>
                                <span className="text-sm font-medium">
                                  {new Date(goal.deadline).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Priority</span>
                                <Badge variant={goal.priority === "high" ? "destructive" : "secondary"}>
                                  {goal.priority}
                                </Badge>
                              </div>
                            </div>
                            <Button className="w-full" size="sm">
                              Update Progress
                            </Button>
                          </>
                        )
                      })()}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Target className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">No goal selected</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Milestones */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <Card className="border-border/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Flag className="h-5 w-5 text-primary" />
                    <span>Recent Milestones</span>
                  </CardTitle>
                  <CardDescription>Your latest achievements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {milestones.map((milestone, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div
                          className={`w-2 h-2 rounded-full mt-2 ${
                            milestone.type === "achievement"
                              ? "bg-yellow-500"
                              : milestone.type === "milestone"
                                ? "bg-blue-500"
                                : "bg-green-500"
                          }`}
                        />
                        <div>
                          <p className="text-sm font-medium text-foreground">{milestone.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(milestone.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
              <Card className="border-border/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                  <CardDescription>Manage your goals</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start bg-transparent" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Goal
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent" size="sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Review
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent" size="sm">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      View Analytics
                    </Button>
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
