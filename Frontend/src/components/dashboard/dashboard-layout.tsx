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
  Bot,
  LogOut,
  Settings,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useLocation, useNavigate } from "react-router"
import { useAuth } from "@/contexts/authcontext"

const sidebarItems = [
  { icon: HomeIcon, label: "MainPage", href: "/main" },
  { icon: ChartArea, label: "Overview", href: "/dashboard" },
  { icon: Bot, label: "Melify", href: "/dashboard/melify" },
  { icon: Heart, label: "Mood Tracker", href: "/dashboard/mood" },
  { icon: Brain, label: "Mental Health", href: "/dashboard/mental-health" },
  { icon: Calendar, label: "Sessions", href: "/dashboard/sessions" },
  { icon: Target, label: "Goals", href: "/dashboard/goals" },
  { icon: Award, label: "Achievements", href: "/dashboard/achievements" },
]

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {

  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const location = useLocation();
  const pathname = location.pathname;
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#0b0b0b]">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-[#1a1a1a] border-gray-700/40"
        >
          {sidebarOpen ? <X className="h-4 w-4 text-yellow-400" /> : <Menu className="h-4 w-4 text-yellow-400" />}
        </Button>
      </div>

      {/* Sidebar */}
      <AnimatePresence mode="wait">
        <motion.aside
          initial={{ x: sidebarOpen ? 0 : -320 }}
          animate={{ x: sidebarOpen ? 0 : -320 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className={cn(
            "fixed left-0 top-0 z-40 h-screen bg-[#0c0c0c] border-r border-gray-800",
            sidebarOpen ? "w-80" : "w-0",
          )}
        >
          <div className="flex h-full flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex items-center space-x-3"
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                  <img src="/Images/logo.png" alt="Logo Zenium" className="w-12 h-12" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-100">Zenium</h1>
                  <p className="text-sm text-gray-400">Mental Wellness</p>
                </div>
              </motion.div>

              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="lg:hidden">
                <X className="h-4 w-4 text-yellow-400" />
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
                            ? "bg-yellow-600 text-black shadow-md"
                            : "text-gray-300 hover:bg-yellow-500/20 hover:text-yellow-400",
                        )}
                      >
                        <item.icon
                          className={cn(
                            "h-5 w-5 transition-colors",
                            isActive
                              ? "text-black"
                              : "text-gray-400/70 group-hover:text-yellow-400",
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
            <div className="p-4 border-t border-gray-800">
              <div className="bg-gradient-to-r from-yellow-900/10 to-yellow-800/10 rounded-lg p-4">
                <h3 className="font-semibold text-gray-100 mb-2">Need Support?</h3>
                <p className="text-sm text-gray-400 mb-3">Connect with our mental health professionals</p>
                <Button size="sm" className="w-full" onClick={() => navigate("/contact")}>
                  Get Help
                </Button>
              </div>
            </div>
          </div>
        </motion.aside>
      </AnimatePresence>

      {/* Main content */}
      <div className={cn("transition-all duration-300 ease-in-out bg-[#0b0b0b]", sidebarOpen ? "lg:ml-80" : "ml-0")}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-[#0a0a0a]/90 backdrop-blur-sm border-b border-gray-800/50">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              {!sidebarOpen && (
                <Button variant="outline" size="icon" onClick={() => setSidebarOpen(true)} className="hidden lg:flex bg-yellow-900/10 border-yellow-800/30 hover:bg-yellow-900/20">
                  <Menu className="h-4 w-4 text-yellow-400" />
                </Button>
              )}
              <div>
                <h2 className="text-2xl font-bold text-yellow-400">
                  Welcome back, {user?.username || 'User'}!
                </h2>
                <p className="text-gray-400">Let's continue your wellness journey</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" className="border-gray-700/50 text-gray-300 hover:bg-yellow-500/20 hover:text-yellow-400">
                <Heart className="h-4 w-4 mr-2" />
                Quick Mood Check
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center space-x-2 border-gray-700/50 text-gray-300 hover:bg-yellow-500/20 hover:text-yellow-400">
                    <div className="w-8 h-8 bg-yellow-900 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-yellow-400" />
                    </div>
                    <span>{user?.username || 'User'}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-gray-900 border-gray-700">
                  <DropdownMenuLabel className="text-gray-200">
                    My Account
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem className="text-gray-300 hover:bg-gray-800" onClick={() => navigate("/profile")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Profile Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem className="text-red-400 hover:bg-red-900 focus:bg-red-900 focus:text-red-400" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}
