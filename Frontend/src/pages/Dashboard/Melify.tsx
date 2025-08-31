"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Power,
  Battery,
  Camera,
  Mic,
  Volume2,
  Settings,
  Wifi,
  Bluetooth,
  Heart,
  Brain,
  MessageCircle,
  Globe,
  User,
  Zap,
  Activity,
  Shield,
  Smartphone,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"

export default function MelifyIntegrationPage() {
  const [melifyStatus, setMelifyStatus] = useState(true)
  const [batteryLevel, ] = useState(78)
  const [voiceVolume, setVoiceVolume] = useState([75])
  const [selectedLanguage, setSelectedLanguage] = useState("english")
  const [voiceGender, setVoiceGender] = useState("female")
  const [cameraEnabled, setCameraEnabled] = useState(true)
  const [micEnabled, setMicEnabled] = useState(true)
  const [emotionalMode, setEmotionalMode] = useState("adaptive")

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
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  }

  return (
    <DashboardLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8 max-w-7xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                Melify Integration
              </h1>
              <p className="text-xl text-muted-foreground">Your AI Emotional Companion</p>
            </div>
          </div>
        </motion.div>

        {/* Device Status Overview */}
        <motion.div variants={itemVariants}>
          <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-white">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-6 w-6 text-yellow-600" />
                <span>Device Status</span>
              </CardTitle>
              <CardDescription>Real-time status of your Melify companion</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Power Status */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Power className={`h-5 w-5 ${melifyStatus ? "text-green-600" : "text-red-600"}`} />
                      <span className="font-medium">Power Status</span>
                    </div>
                    <Switch checked={melifyStatus} onCheckedChange={setMelifyStatus} />
                  </div>
                  <Badge variant={melifyStatus ? "default" : "destructive"} className="w-full justify-center">
                    {melifyStatus ? "Online" : "Offline"}
                  </Badge>
                </div>

                {/* Battery Level */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Battery className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Battery Level</span>
                  </div>
                  <div className="space-y-2">
                    <Progress value={batteryLevel} className="h-3" />
                    <p className="text-sm text-center font-medium">{batteryLevel}%</p>
                  </div>
                </div>

                {/* Connection Status */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Wifi className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">Connection</span>
                  </div>
                  <div className="flex space-x-2">
                    <Badge variant="outline" className="flex items-center space-x-1">
                      <Wifi className="h-3 w-3" />
                      <span>WiFi</span>
                    </Badge>
                    <Badge variant="outline" className="flex items-center space-x-1">
                      <Bluetooth className="h-3 w-3" />
                      <span>Bluetooth</span>
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Features Configuration */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Speech & Voice Settings */}
          <motion.div variants={itemVariants}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageCircle className="h-6 w-6 text-blue-600" />
                  <span>Speech & Voice</span>
                </CardTitle>
                <CardDescription>Configure voice interaction settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Language Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center space-x-2">
                    <Globe className="h-4 w-4" />
                    <span>Language</span>
                  </label>
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="spanish">Spanish</SelectItem>
                      <SelectItem value="french">French</SelectItem>
                      <SelectItem value="german">German</SelectItem>
                      <SelectItem value="japanese">Japanese</SelectItem>
                      <SelectItem value="mandarin">Mandarin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Voice Gender */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Voice Gender</span>
                  </label>
                  <Select value={voiceGender} onValueChange={setVoiceGender}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Voice Volume */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center space-x-2">
                    <Volume2 className="h-4 w-4" />
                    <span>Voice Volume</span>
                  </label>
                  <Slider value={voiceVolume} onValueChange={setVoiceVolume} max={100} step={1} className="w-full" />
                  <p className="text-xs text-muted-foreground text-center">{voiceVolume[0]}%</p>
                </div>

                {/* Microphone Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Mic className="h-4 w-4" />
                    <span className="text-sm font-medium">Microphone</span>
                  </div>
                  <Switch checked={micEnabled} onCheckedChange={setMicEnabled} />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Computer Vision & Mood Detection */}
          <motion.div variants={itemVariants}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Camera className="h-6 w-6 text-purple-600" />
                  <span>Computer Vision</span>
                </CardTitle>
                <CardDescription>Mood detection and visual interaction</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Camera Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Camera className="h-4 w-4" />
                    <span className="text-sm font-medium">Camera</span>
                  </div>
                  <Switch checked={cameraEnabled} onCheckedChange={setCameraEnabled} />
                </div>

                {/* Mood Detection Status */}
                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center space-x-2">
                    <Brain className="h-4 w-4" />
                    <span>Mood Detection</span>
                  </label>
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Current Mood</span>
                      <Badge variant="outline" className="bg-white">
                        Calm & Focused
                      </Badge>
                    </div>
                    <Progress value={85} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">Confidence: 85%</p>
                  </div>
                </div>

                {/* Emotional Response Mode */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center space-x-2">
                    <Heart className="h-4 w-4" />
                    <span>Emotional Response Mode</span>
                  </label>
                  <Select value={emotionalMode} onValueChange={setEmotionalMode}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="adaptive">Adaptive</SelectItem>
                      <SelectItem value="supportive">Supportive</SelectItem>
                      <SelectItem value="energetic">Energetic</SelectItem>
                      <SelectItem value="calming">Calming</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Privacy Settings */}
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium">Privacy Protection</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    All visual data is processed locally on your Melify device. No images are stored or transmitted.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Personalized Support Settings */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-6 w-6 text-yellow-600" />
                <span>Personalized Support</span>
              </CardTitle>
              <CardDescription>Customize how Melify provides emotional support</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Support Intensity */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Support Intensity</label>
                  <Select defaultValue="moderate">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gentle">Gentle</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="intensive">Intensive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Interaction Frequency */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Check-in Frequency</label>
                  <Select defaultValue="daily">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Every Hour</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Crisis Support */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Crisis Detection</label>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Emergency Response</span>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Device Management Actions */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-6 w-6 text-gray-600" />
                <span>Device Management</span>
              </CardTitle>
              <CardDescription>Manage your Melify device settings and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
                  <Smartphone className="h-4 w-4" />
                  <span>Sync Data</span>
                </Button>
                <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
                  <Settings className="h-4 w-4" />
                  <span>Update Firmware</span>
                </Button>
                <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
                  <Shield className="h-4 w-4" />
                  <span>Reset Settings</span>
                </Button>
                <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
                  <Activity className="h-4 w-4" />
                  <span>Run Diagnostics</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Connection Guide */}
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-800">First Time Setup?</CardTitle>
              <CardDescription className="text-blue-600">
                Follow these steps to connect your Melify device
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-blue-600 font-bold">1</span>
                  </div>
                  <h4 className="font-medium text-blue-800">Power On</h4>
                  <p className="text-sm text-blue-600">Press and hold the power button for 3 seconds</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-blue-600 font-bold">2</span>
                  </div>
                  <h4 className="font-medium text-blue-800">Connect WiFi</h4>
                  <p className="text-sm text-blue-600">Use the Zenium app to configure network settings</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-blue-600 font-bold">3</span>
                  </div>
                  <h4 className="font-medium text-blue-800">Start Interaction</h4>
                  <p className="text-sm text-blue-600">Begin your emotional wellness journey</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  )
}
