"use client"

import { useState } from "react"
import type { ChangeEvent, FormEvent } from "react"
import { motion } from "framer-motion"
import axios from "axios"
import { useAuth } from "@/contexts/authcontext"
import { useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"
import { API_BASE_URL, API_ENDPOINTS } from "@/config/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, ArrowLeft, Check, X } from "lucide-react"
import Image from '@/assets/logo.png'

interface RegisterFormData {
  username: string
  email: string
  password: string
  confirmPassword: string
}

interface ValidationErrors {
  username?: string
  email?: string
  password?: string
  confirmPassword?: string
  general?: string
}

interface RegisterResponse {
  success: boolean
  message: string
  data?: {
    username: string
    email: string
  }
}

export function ZeniumRegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
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

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = "Username is required"
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters"
    }

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
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must contain uppercase, lowercase, and number"
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const response = await axios.post<RegisterResponse>(`${API_BASE_URL}${API_ENDPOINTS.AUTH.REGISTER}`, {
        username: formData.username,
        email: formData.email,
        password: formData.password
      })

      if (response.data.success) {
        toast.success(response.data.message || "Registration successful!")
        
        // Auto login setelah registrasi berhasil
        try {
          const loginResponse = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`, {
            email: formData.email,
            password: formData.password
          });
          
          if (loginResponse.data.success && loginResponse.data.data?.token) {
            const userData = {
              username: formData.username,
              email: formData.email
            };
            login(userData, loginResponse.data.data.token);
            navigate('/main');
          } else {
            // Jika auto login gagal, redirect ke halaman login
            navigate('/login');
          }
        } catch (loginError) {
          console.error('Auto login error:', loginError);
          navigate('/login');
        }
      } else {
        setErrors({ general: response.data.message || "Registration failed" })
        toast.error(response.data.message || "Registration failed")
      }
    } catch (error: any) {
      console.error('Registration error:', error)
      if (error.response?.data?.message) {
        setErrors({ general: error.response.data.message })
        toast.error(error.response.data.message)
      } else {
        setErrors({ general: "Registration failed. Please try again." })
        toast.error("Registration failed. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const passwordStrength = () => {
    if (!formData.password) return { strength: 0, text: "", color: "text-gray-400" }
    
    let strength = 0
    if (formData.password.length >= 6) strength++
    if (/[a-z]/.test(formData.password)) strength++
    if (/[A-Z]/.test(formData.password)) strength++
    if (/\d/.test(formData.password)) strength++
    
    const strengthText = ["Very Weak", "Weak", "Fair", "Good", "Strong"][strength] || "Very Weak"
    const strengthColor = [
      "text-red-400",
      "text-red-400",
      "text-yellow-400",
      "text-green-400",
      "text-green-400"
    ][strength] || "text-red-400"
    
    return { strength, text: strengthText, color: strengthColor }
  }

  const passwordCriteria = [
    { label: "At least 6 characters", met: formData.password.length >= 6 },
    { label: "Contains lowercase letter", met: /[a-z]/.test(formData.password) },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(formData.password) },
    { label: "Contains number", met: /\d/.test(formData.password) },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-amber-900/20 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48ZyBmaWxsPSJub25lIiBzdHJva2U9IiM4ODcwM2EzMCIgc3Ryb2tlLXdpZHRoPSIxIj48cGF0aCBd=" />
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
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg">
             <img src={Image} alt="Logo" className="w-full h-full"/>
            </div>
            <span className="text-3xl font-bold text-amber-400">Zenium</span>
          </motion.div>
          <Badge className="mb-4 bg-amber-500/10 text-amber-400 border-amber-500/30">Create Account</Badge>
          <h1 className="text-2xl font-bold mb-2 text-white">Join Our Platform</h1>
          <p className="text-amber-200/70">Start your wellness journey with Melify</p>
        </div>

        {/* Register Card */}
        <Card className="backdrop-blur-sm bg-gray-900/80 border-amber-500/30 shadow-xl shadow-amber-500/10">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-center text-amber-400">Create Account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.general && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-md text-red-400 text-sm">
                  {errors.general}
                </div>
              )}

              {/* Username Field */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-amber-200">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-amber-400/70" />
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="pl-10 bg-gray-800/50 border-amber-500/30 text-white placeholder:text-amber-200/40 focus:border-amber-500"
                    required
                  />
                </div>
                {errors.username && <p className="text-red-400 text-sm">{errors.username}</p>}
              </div>

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
                <Label htmlFor="password" className="text-amber-200">Password</Label>
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
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="text-sm mt-1">
                    <span className={passwordStrength().color}>
                      Strength: {passwordStrength().text}
                    </span>
                  </div>
                )}
                
                {/* Password Criteria */}
                {formData.password && (
                  <div className="text-sm space-y-1 mt-2">
                    {passwordCriteria.map((criteria, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        {criteria.met ? (
                          <Check className="h-3 w-3 text-green-400" />
                        ) : (
                          <X className="h-3 w-3 text-red-400" />
                        )}
                        <span className={criteria.met ? "text-green-400" : "text-red-400"}>
                          {criteria.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-amber-200">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-amber-400/70" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="pl-10 pr-10 bg-gray-800/50 border-amber-500/30 text-white placeholder:text-amber-200/40 focus:border-amber-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-amber-400/70 hover:text-amber-400"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-400 text-sm">{errors.confirmPassword}</p>}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-amber-500 text-black hover:bg-amber-400 group font-bold transition-all duration-300 shadow-lg shadow-amber-500/30 hover:shadow-amber-400/40 disabled:opacity-50 disabled:cursor-not-allowed"
                size="lg"
              >
                {isLoading ? "Creating Account..." : "Create Account"}
                {!isLoading && <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="bg-amber-500/30" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-gray-900 px-2 text-amber-400/70">Already have an account?</span>
                </div>
              </div>

              <div className="mt-4 text-center">
                <a 
                  href="/login" 
                  className="text-amber-400 hover:underline text-sm inline-flex items-center"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Sign in to your account
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