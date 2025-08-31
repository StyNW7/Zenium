"use client"

import { motion } from "framer-motion"
import { Calendar, Clock, User, Video, Phone, MessageSquare, Star, Download, Filter, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"

const sessions = [
  {
    id: 1,
    therapist: "Dr. Sarah Mitchell",
    specialty: "Cognitive Behavioral Therapy",
    date: "2024-01-15",
    time: "2:00 PM",
    duration: "50 minutes",
    type: "Video Call",
    status: "Completed",
    rating: 5,
    notes: "Discussed anxiety management techniques and coping strategies for work stress.",
    nextSession: "2024-01-22",
    avatar: "/team-sarah.png",
  },
  {
    id: 2,
    therapist: "Dr. Michael Chen",
    specialty: "Mindfulness & Meditation",
    date: "2024-01-08",
    time: "10:00 AM",
    duration: "45 minutes",
    type: "Phone Call",
    status: "Completed",
    rating: 5,
    notes: "Practiced breathing exercises and discussed daily mindfulness routines.",
    nextSession: "2024-01-15",
    avatar: "/team-alex.png",
  },
  {
    id: 3,
    therapist: "Dr. Emily Rodriguez",
    specialty: "Trauma Therapy",
    date: "2024-01-01",
    time: "4:00 PM",
    duration: "60 minutes",
    type: "Video Call",
    status: "Completed",
    rating: 4,
    notes: "EMDR session focusing on processing past experiences and building resilience.",
    nextSession: "2024-01-08",
    avatar: "/team-maya.png",
  },
  {
    id: 4,
    therapist: "Dr. Sarah Mitchell",
    specialty: "Cognitive Behavioral Therapy",
    date: "2024-01-22",
    time: "2:00 PM",
    duration: "50 minutes",
    type: "Video Call",
    status: "Scheduled",
    rating: null,
    notes: "Upcoming session to review progress and adjust treatment plan.",
    nextSession: null,
    avatar: "/team-sarah.png",
  },
]

const upcomingSessions = sessions.filter((s) => s.status === "Scheduled")
const completedSessions = sessions.filter((s) => s.status === "Completed")

export default function SessionsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Sessions</h1>
            <p className="text-muted-foreground">
              Track your consultation history and upcoming appointments with mental health professionals
            </p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Calendar className="h-4 w-4 mr-2" />
            Book New Session
          </Button>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search sessions by therapist or specialty..." className="pl-10" />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </motion.div>

        {/* Upcoming Sessions */}
        {upcomingSessions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Upcoming Sessions</h2>
            <div className="grid gap-4">
              {upcomingSessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-primary-foreground" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{session.therapist}</h3>
                            <p className="text-sm text-muted-foreground">{session.specialty}</p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>{session.date}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{session.time}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                {session.type === "Video Call" ? (
                                  <Video className="h-4 w-4" />
                                ) : (
                                  <Phone className="h-4 w-4" />
                                )}
                                <span>{session.type}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="bg-primary/10 text-primary">
                            {session.status}
                          </Badge>
                          <Button size="sm">Join Session</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Session History */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Session History</h2>
          <div className="grid gap-4">
            {completedSessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-foreground">{session.therapist}</h3>
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < 5 ? "text-yellow-400 fill-current" : "text-muted-foreground"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{session.specialty}</p>
                          <div className="flex items-center space-x-4 mb-3 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{session.date}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{session.duration}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              {session.type === "Video Call" ? (
                                <Video className="h-4 w-4" />
                              ) : (
                                <Phone className="h-4 w-4" />
                              )}
                              <span>{session.type}</span>
                            </div>
                          </div>
                          <div className="bg-muted/50 rounded-lg p-3">
                            <p className="text-sm text-foreground">{session.notes}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          {session.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Report
                        </Button>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Notes
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Session Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">12</div>
              <p className="text-sm text-muted-foreground mt-1">+2 this month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Average Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">4.8</div>
              <div className="flex items-center mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < 5 ? "text-yellow-400 fill-current" : "text-muted-foreground"}`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Next Session</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-foreground">Jan 22</div>
              <p className="text-sm text-muted-foreground mt-1">Dr. Sarah Mitchell</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
