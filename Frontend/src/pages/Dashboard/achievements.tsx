"use client"

import { motion } from "framer-motion"
import {
  Award,
  Trophy,
  Star,
  Target,
  Calendar,
  Zap,
  Heart,
  Brain,
  BookOpen,
  Users,
  Lock,
  CheckCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"

// Define types for our data structures
interface Achievement {
  id: number
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  category: string
  points: number
  unlocked: boolean
  unlockedDate?: string
  progress?: number
  maxProgress?: number
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary"
}

const achievements: Achievement[] = [
  {
    id: 1,
    title: "First Steps",
    description: "Complete your first mood check-in",
    icon: Heart,
    category: "Mood Tracking",
    points: 50,
    unlocked: true,
    unlockedDate: "2024-01-01",
    rarity: "common",
  },
  {
    id: 2,
    title: "Consistent Tracker",
    description: "Log your mood for 7 consecutive days",
    icon: Calendar,
    category: "Mood Tracking",
    points: 150,
    unlocked: true,
    unlockedDate: "2024-01-08",
    rarity: "uncommon",
  },
  {
    id: 3,
    title: "Mindful Reader",
    description: "Read 5 articles from the content library",
    icon: BookOpen,
    category: "Learning",
    points: 100,
    unlocked: true,
    unlockedDate: "2024-01-10",
    rarity: "common",
  },
  {
    id: 4,
    title: "Goal Setter",
    description: "Create your first wellness goal",
    icon: Target,
    category: "Goals",
    points: 75,
    unlocked: true,
    unlockedDate: "2024-01-05",
    rarity: "common",
  },
  {
    id: 5,
    title: "Therapy Pioneer",
    description: "Complete your first therapy session",
    icon: Users,
    category: "Sessions",
    points: 200,
    unlocked: true,
    unlockedDate: "2024-01-15",
    rarity: "rare",
  },
  {
    id: 6,
    title: "Wellness Warrior",
    description: "Maintain a 30-day streak of daily activities",
    icon: Zap,
    category: "Consistency",
    points: 500,
    unlocked: false,
    progress: 18,
    maxProgress: 30,
    rarity: "epic",
  },
  {
    id: 7,
    title: "Mental Health Advocate",
    description: "Share your journey with 3 friends",
    icon: Users,
    category: "Community",
    points: 300,
    unlocked: false,
    progress: 1,
    maxProgress: 3,
    rarity: "rare",
  },
  {
    id: 8,
    title: "Meditation Master",
    description: "Complete 50 meditation sessions",
    icon: Brain,
    category: "Mindfulness",
    points: 400,
    unlocked: false,
    progress: 23,
    maxProgress: 50,
    rarity: "epic",
  },
]

const categories = ["All", "Mood Tracking", "Learning", "Goals", "Sessions", "Consistency", "Community", "Mindfulness"]

const rarityColors: Record<string, string> = {
  common: "bg-gray-100 text-gray-800 border-gray-200",
  uncommon: "bg-green-100 text-green-800 border-green-200",
  rare: "bg-blue-100 text-blue-800 border-blue-200",
  epic: "bg-purple-100 text-purple-800 border-purple-200",
  legendary: "bg-yellow-100 text-yellow-800 border-yellow-200",
}

const unlockedAchievements = achievements.filter((a) => a.unlocked)
const totalPoints = unlockedAchievements.reduce((sum, a) => sum + a.points, 0)

export default function AchievementsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
              <Trophy className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Achievements</h1>
          <p className="text-muted-foreground">Celebrate your mental wellness journey with badges and milestones</p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <div className="text-2xl font-bold text-foreground">{unlockedAchievements.length}</div>
              <p className="text-sm text-muted-foreground">Achievements Unlocked</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="h-6 w-6 text-accent" />
              </div>
              <div className="text-2xl font-bold text-foreground">{totalPoints}</div>
              <p className="text-sm text-muted-foreground">Total Points</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="h-6 w-6 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-foreground">18</div>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="h-6 w-6 text-purple-500" />
              </div>
              <div className="text-2xl font-bold text-foreground">Gold</div>
              <p className="text-sm text-muted-foreground">Current Tier</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Achievements */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Recent Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unlockedAchievements.slice(0, 3).map((achievement, index) => {
              const AchievementIcon = achievement.icon
              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="relative overflow-hidden bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
                    <div className="absolute top-2 right-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
                        <AchievementIcon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">{achievement.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge className={rarityColors[achievement.rarity]}>{achievement.rarity}</Badge>
                        <div className="flex items-center space-x-1 text-sm text-primary">
                          <Star className="h-4 w-4" />
                          <span>{achievement.points}</span>
                        </div>
                      </div>
                      {achievement.unlockedDate && (
                        <p className="text-xs text-muted-foreground mt-2">Unlocked on {achievement.unlockedDate}</p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* All Achievements */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-2xl font-semibold text-foreground mb-4">All Achievements</h2>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((category) => (
              <Button key={category} variant="outline" size="sm">
                {category}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement, index) => {
              const AchievementIcon = achievement.icon
              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className={`relative overflow-hidden ${
                      achievement.unlocked
                        ? "bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20"
                        : "bg-muted/50 border-muted"
                    }`}
                  >
                    {achievement.unlocked ? (
                      <div className="absolute top-2 right-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                    ) : (
                      <div className="absolute top-2 right-2">
                        <Lock className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <CardContent className="p-6 text-center">
                      <div
                        className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                          achievement.unlocked ? "bg-gradient-to-r from-primary to-accent" : "bg-muted"
                        }`}
                      >
                        <AchievementIcon
                          className={`h-8 w-8 ${achievement.unlocked ? "text-white" : "text-muted-foreground"}`}
                        />
                      </div>
                      <h3
                        className={`font-semibold mb-2 ${
                          achievement.unlocked ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {achievement.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>

                      {!achievement.unlocked && achievement.progress !== undefined && achievement.maxProgress !== undefined && (
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>Progress</span>
                            <span>
                              {achievement.progress}/{achievement.maxProgress}
                            </span>
                          </div>
                          <Progress value={(achievement.progress / achievement.maxProgress) * 100} className="h-2" />
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <Badge className={rarityColors[achievement.rarity]}>{achievement.rarity}</Badge>
                        <div
                          className={`flex items-center space-x-1 text-sm ${
                            achievement.unlocked ? "text-primary" : "text-muted-foreground"
                          }`}
                        >
                          <Star className="h-4 w-4" />
                          <span>{achievement.points}</span>
                        </div>
                      </div>

                      {achievement.unlocked && achievement.unlockedDate && (
                        <p className="text-xs text-muted-foreground mt-2">Unlocked on {achievement.unlockedDate}</p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Progress Towards Next Tier */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-primary" />
                <span>Progress to Platinum Tier</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Current: Gold Tier</span>
                <span>1,200 / 2,000 points</span>
              </div>
              <Progress value={60} className="h-3 mb-4" />
              <p className="text-sm text-muted-foreground">
                Earn 800 more points to unlock exclusive Platinum tier benefits and achievements!
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}