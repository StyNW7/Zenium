"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Heart,
  Menu,
  X,
  Brain,
  Calendar,
  Target,
  Award,
  User,
  HomeIcon,
  ChartArea,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useLocation, useNavigate } from "react-router"

const sidebarItems = [
  { icon: HomeIcon, label: "Home", href: "/main" },
  { icon: ChartArea, label: "Overview", href: "/dashboard" },
  { icon: Heart, label: "Mood Tracker", href: "/dashboard/mood" },
  { icon: Brain, label: "Mental Health", href: "/dashboard/mental-health" },
  { icon: Calendar, label: "Sessions", href: "/dashboard/sessions" },
  { icon: Target, label: "Goals", href: "/dashboard/goals" },
  { icon: Award, label: "Achievements", href: "/dashboard/achievements" },
  { icon: User, label: "Profile", href: "/dashboard/profile" },
]

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {

  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-card border-primary/20"
        >
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <AnimatePresence mode="wait">
        <motion.aside
          initial={{ x: sidebarOpen ? 0 : -320 }}
          animate={{ x: sidebarOpen ? 0 : -320 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className={cn(
            "fixed left-0 top-0 z-40 h-screen bg-sidebar-background border-r border-sidebar-border",
            sidebarOpen ? "w-80" : "w-0",
          )}
        >
          <div className="flex h-full flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-sidebar-border">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex items-center space-x-3"
              >
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Brain className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-sidebar-foreground">Zenium</h1>
                  <p className="text-sm text-sidebar-foreground/70">Mental Wellness</p>
                </div>
              </motion.div>

              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="lg:hidden">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {sidebarItems.map((item, index) => {
                  const isActive = pathname === item.href
                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <a
                        href={item.href}
                        className={cn(
                          "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                          isActive
                            ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                            : "text-sidebar-foreground hover:bg-sidebar-accent/10 hover:text-sidebar-accent",
                        )}
                      >
                        <item.icon
                          className={cn(
                            "h-5 w-5 transition-colors",
                            isActive
                              ? "text-sidebar-primary-foreground"
                              : "text-sidebar-foreground/70 group-hover:text-sidebar-accent",
                          )}
                        />
                        <span className="font-medium">{item.label}</span>
                      </a>
                    </motion.div>
                  )
                })}
              </div>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-sidebar-border">
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-4">
                <h3 className="font-semibold text-sidebar-foreground mb-2">Need Support?</h3>
                <p className="text-sm text-sidebar-foreground/70 mb-3">Connect with our mental health professionals</p>
                <Button size="sm" className="w-full" onClick={() => navigate("/contact")}>
                  Get Help
                </Button>
              </div>
            </div>
          </div>
        </motion.aside>
      </AnimatePresence>

      {/* Main content */}
      <div className={cn("transition-all duration-300 ease-in-out", sidebarOpen ? "lg:ml-80" : "ml-0")}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              {!sidebarOpen && (
                <Button variant="outline" size="icon" onClick={() => setSidebarOpen(true)} className="hidden lg:flex">
                  <Menu className="h-4 w-4" />
                </Button>
              )}
              <div>
                <h2 className="text-2xl font-bold text-foreground">Welcome back!</h2>
                <p className="text-muted-foreground">Let's continue your wellness journey</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Heart className="h-4 w-4 mr-2" />
                Quick Mood Check
              </Button>
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-primary-foreground" />
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}
