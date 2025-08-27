"use client"

import { useState } from "react"
import type { ChangeEvent, FormEvent } from "react"
import { motion } from "framer-motion"
import axios from "axios"
import { useAuth } from "@/contexts/authcontext"
import { useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Heart, Eye, EyeOff, Mail, Lock, ArrowRight, ArrowLeft } from "lucide-react"
import { API_BASE_URL, API_ENDPOINTS } from "@/config/api"

interface LoginFormData {
  email: string
  password: string
}

interface LoginResponse {
  success: boolean
  message: string
  data?: {
    token: string
    username?: string
    role?: 'user'
  }
}

interface ValidationErrors {
  email?: string
  password?: string
  general?: string
}

export function ZeniumLoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState<ValidationErrors>({})

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name as keyof ValidationErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {}

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const response = await axios.post<LoginResponse>(`${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`, formData)
      
      if (response.data.success) {
        toast.success(response.data.message)
        // Use login function from useAuth
        if (response.data.data?.token) {
          // Get user data from response (adjust according to API response structure)
          const userData = {
            email: formData.email,
            username: response.data.data?.username || '',
            role: response.data.data?.role || 'user'
          };
          login(userData, response.data.data.token);
          navigate('/main');
        }
      } else {
        setErrors({ general: response.data.message || 'Login failed' })
        toast.error(response.data.message || 'Login failed')
      }
    } catch (error: any) {
      console.error('Login error:', error)
      if (error.response?.data?.message) {
        setErrors({ general: error.response.data.message })
        toast.error(error.response.data.message)
      } else {
        setErrors({ general: 'Login failed. Please try again.' })
        toast.error('Login failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-amber-900/20 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-amber-300/5 pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center space-x-2 mb-4"
          >
            <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Heart className="h-7 w-7 text-black" />
            </div>
            <span className="text-3xl font-bold text-amber-400">Zenium</span>
          </motion.div>
          <Badge className="mb-4 bg-amber-500/10 text-amber-400 border-amber-500/30">Welcome Back</Badge>
          <h1 className="text-2xl font-bold mb-2 text-white">Sign In to Your Account</h1>
          <p className="text-amber-200/70">Continue your wellness journey with Melify</p>
        </div>

        {/* Login Card */}
        <Card className="backdrop-blur-sm bg-gray-900/80 border-amber-500/30 shadow-xl shadow-amber-500/10">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-center text-amber-400">Welcome Back</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.general && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-md text-red-400 text-sm">
                  {errors.general}
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-amber-200">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-amber-400/70" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10 bg-gray-800/50 border-amber-500/30 text-white placeholder:text-amber-200/40 focus:border-amber-500"
                    required
                  />
                </div>
                {errors.email && <p className="text-red-400 text-sm">{errors.email}</p>}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-amber-200">Password</Label>
                  <a href="#" className="text-sm text-amber-400 hover:underline">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-amber-400/70" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-10 bg-gray-800/50 border-amber-500/30 text-white placeholder:text-amber-200/40 focus:border-amber-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-amber-400/70 hover:text-amber-400"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-sm">{errors.password}</p>}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-amber-500 text-black hover:bg-amber-400 group font-bold transition-all duration-300 shadow-lg shadow-amber-500/30 hover:shadow-amber-400/40 disabled:opacity-50 disabled:cursor-not-allowed"
                size="lg"
              >
                {isLoading ? "Signing In..." : "Sign In"}
                {!isLoading && <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="bg-amber-500/30" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-gray-900 px-2 text-amber-400/70">Don't have an account?</span>
                </div>
              </div>

              <div className="mt-4 text-center">
                <a 
                  href="/register" 
                  className="text-amber-400 hover:underline text-sm inline-flex items-center"
                >
                  Create new account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center"
        >
          <a href="/" className="text-sm text-amber-400/70 hover:text-amber-400 inline-flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </a>
        </motion.div>
      </motion.div>
    </div>
  )
}