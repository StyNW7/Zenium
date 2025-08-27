"use client"

import { useState } from "react"
import type { ChangeEvent, FormEvent } from "react"
import { motion } from "framer-motion"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Heart, Mail, ArrowRight, ArrowLeft, Check, RefreshCw } from "lucide-react"
import { API_BASE_URL, API_ENDPOINTS } from "@/config/api"

interface ForgotPasswordFormData {
  email: string
}

interface ForgotPasswordResponse {
  success: boolean
  message: string
  data?: {
    resetToken?: string
    expiresAt?: string
  }
}

interface ValidationErrors {
  email?: string
  general?: string
}

export function ZeniumForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: ''
  })
  const [errors, setErrors] = useState<ValidationErrors>({})

  const navigate = useNavigate()

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

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const response = await axios.post<ForgotPasswordResponse>(`${API_BASE_URL}${API_ENDPOINTS.AUTH.FORGOT_PASSWORD}`, formData)
      
      if (response.data.success) {
        toast.success(response.data.message || "Password reset email sent!")
        setEmailSent(true)
      } else {
        setErrors({ general: response.data.message || 'Failed to send reset email' })
        toast.error(response.data.message || 'Failed to send reset email')
      }
    } catch (error: any) {
      console.error('Forgot password error:', error)
      if (error.response?.data?.message) {
        setErrors({ general: error.response.data.message })
        toast.error(error.response.data.message)
      } else {
        setErrors({ general: 'Failed to send reset email. Please try again.' })
        toast.error('Failed to send reset email. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendEmail = async () => {
    if (!formData.email) {
      toast.error('Please enter your email address first')
      return
    }

    setIsLoading(true)
    try {
      const response = await axios.post<ForgotPasswordResponse>(`${API_BASE_URL}${API_ENDPOINTS.AUTH.FORGOT_PASSWORD}`, formData)
      
      if (response.data.success) {
        toast.success("Password reset email sent again!")
      } else {
        toast.error(response.data.message || 'Failed to resend email')
      }
    } catch (error: any) {
      console.error('Resend email error:', error)
      toast.error('Failed to resend email. Please try again.')
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
          <Badge className="mb-4 bg-amber-500/10 text-amber-400 border-amber-500/30">
            {emailSent ? "Email Sent" : "Reset Password"}
          </Badge>
          <h1 className="text-2xl font-bold mb-2 text-white">
            {emailSent ? "Check Your Email" : "Forgot Your Password?"}
          </h1>
          <p className="text-amber-200/70">
            {emailSent 
              ? "We've sent you a password reset link" 
              : "No worries, we'll send you reset instructions"
            }
          </p>
        </div>

        {/* Forgot Password Card */}
        <Card className="backdrop-blur-sm bg-gray-900/80 border-amber-500/30 shadow-xl shadow-amber-500/10">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-center text-amber-400">
              {emailSent ? "Email Sent Successfully" : "Reset Password"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!emailSent ? (
              // Email Input Form
              <form onSubmit={handleSubmit} className="space-y-4">
                {errors.general && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-md text-red-400 text-sm">
                    {errors.general}
                  </div>
                )}

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-amber-200">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-amber-400/70" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10 bg-gray-800/50 border-amber-500/30 text-white placeholder:text-amber-200/40 focus:border-amber-500"
                      required
                    />
                  </div>
                  {errors.email && <p className="text-red-400 text-sm">{errors.email}</p>}
                  <p className="text-amber-200/60 text-sm">
                    Enter the email address associated with your account and we'll send you a link to reset your password.
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-amber-500 text-black hover:bg-amber-400 group font-bold transition-all duration-300 shadow-lg shadow-amber-500/30 hover:shadow-amber-400/40 disabled:opacity-50 disabled:cursor-not-allowed"
                  size="lg"
                >
                  {isLoading ? "Sending Reset Link..." : "Send Reset Link"}
                  {!isLoading && <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />}
                </Button>
              </form>
            ) : (
              // Email Sent Confirmation
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="h-8 w-8 text-green-400" />
                  </div>
                  <p className="text-amber-200/90 mb-4">
                    We've sent a password reset link to:
                  </p>
                  <p className="text-amber-400 font-medium bg-amber-500/10 border border-amber-500/30 rounded-lg py-2 px-4">
                    {formData.email}
                  </p>
                </div>

                <div className="bg-gray-800/50 border border-amber-500/30 rounded-lg p-4">
                  <h3 className="text-amber-400 font-medium mb-2">What's next?</h3>
                  <ul className="text-amber-200/70 text-sm space-y-1">
                    <li>• Check your email inbox</li>
                    <li>• Click the reset link in the email</li>
                    <li>• Create a new password</li>
                    <li>• Sign in with your new password</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={handleResendEmail}
                    disabled={isLoading}
                    variant="outline"
                    className="w-full border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/50"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Resending...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Resend Email
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={() => navigate('/login')}
                    className="w-full bg-amber-500 text-black hover:bg-amber-400 font-bold"
                  >
                    Back to Sign In
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {!emailSent && (
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="bg-amber-500/30" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-gray-900 px-2 text-amber-400/70">Remember your password?</span>
                  </div>
                </div>

                <div className="mt-4 text-center">
                  <a 
                    href="/login" 
                    className="text-amber-400 hover:underline text-sm inline-flex items-center"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Sign In
                  </a>
                </div>
              </div>
            )}
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