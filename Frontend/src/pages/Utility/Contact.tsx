"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Mail, Phone, MapPin, Clock, MessageCircle, Heart, Send } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-yellow-900/20">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 border-b border-yellow-500/20 bg-black/80 backdrop-blur-md"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center space-x-2">
              <img src="/Images/logo.png" alt="Logo Zenium" className="w-12 h-12" />
              <span className="text-2xl font-bold text-white">Zenium</span>
            </a>
            <a href="/">
              <Button
                variant="outline"
                className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 bg-transparent"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </a>
          </div>
        </div>
      </motion.header>

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Get in Touch</Badge>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-yellow-400 via-white to-yellow-300 bg-clip-text text-transparent">
            Contact Us
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            We're here to support your mental health journey. Whether you have questions about Zenium, need technical
            support, or want to share feedback, our caring team is ready to help.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card className="bg-gray-900/50 border-yellow-500/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl text-white flex items-center">
                  <MessageCircle className="mr-3 h-6 w-6 text-yellow-400" />
                  Send us a Message
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Fill out the form below and we'll get back to you within 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">First Name</label>
                    <Input
                      placeholder="Your first name"
                      className="bg-black/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-yellow-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">Last Name</label>
                    <Input
                      placeholder="Your last name"
                      className="bg-black/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-yellow-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Email Address</label>
                  <Input
                    type="email"
                    placeholder="your.email@example.com"
                    className="bg-black/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-yellow-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Subject</label>
                  <Input
                    placeholder="What can we help you with?"
                    className="bg-black/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-yellow-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Message</label>
                  <Textarea
                    placeholder="Tell us more about your question or feedback..."
                    rows={6}
                    className="bg-black/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-yellow-500 resize-none"
                  />
                </div>

                <Button className="w-full bg-gradient-to-r from-yellow-500 to-yellow-400 text-black font-semibold hover:from-yellow-400 hover:to-yellow-300 transition-all duration-300">
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-8"
          >
            {/* Contact Methods */}
            <Card className="bg-gray-900/50 border-yellow-500/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-white">Get in Touch</CardTitle>
                <CardDescription className="text-gray-400">Multiple ways to reach our support team</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-yellow-500/20 p-3 rounded-lg">
                    <Mail className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Email Support</h3>
                    <p className="text-gray-400 mb-2">For general inquiries and support</p>
                    <p className="text-yellow-400">support@zenium.app</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-yellow-500/20 p-3 rounded-lg">
                    <Phone className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Crisis Support</h3>
                    <p className="text-gray-400 mb-2">24/7 mental health crisis line</p>
                    <p className="text-yellow-400">1-800-ZENIUM-1</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-yellow-500/20 p-3 rounded-lg">
                    <MapPin className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Office Location</h3>
                    <p className="text-gray-400 mb-2">Visit us at our headquarters</p>
                    <p className="text-yellow-400">
                      123 Wellness Street
                      <br />
                      San Francisco, CA 94102
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-yellow-500/20 p-3 rounded-lg">
                    <Clock className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Support Hours</h3>
                    <p className="text-gray-400 mb-2">When our team is available</p>
                    <p className="text-yellow-400">
                      Mon-Fri: 9AM - 6PM PST
                      <br />
                      Weekends: 10AM - 4PM PST
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Quick Links */}
            <Card className="bg-gray-900/50 border-yellow-500/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-white">Quick Help</CardTitle>
                <CardDescription className="text-gray-400">Common questions and resources</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <a
                  href="/content"
                  className="block p-4 rounded-lg bg-black/30 hover:bg-yellow-500/10 transition-colors border border-gray-700 hover:border-yellow-500/30"
                >
                  <h4 className="font-semibold text-white mb-1">Mental Health Resources</h4>
                  <p className="text-gray-400 text-sm">Browse our library of articles and guides</p>
                </a>

                <a
                  href="/dashboard"
                  className="block p-4 rounded-lg bg-black/30 hover:bg-yellow-500/10 transition-colors border border-gray-700 hover:border-yellow-500/30"
                >
                  <h4 className="font-semibold text-white mb-1">Getting Started Guide</h4>
                  <p className="text-gray-400 text-sm">Learn how to use Zenium and Melify</p>
                </a>

                <div className="p-4 rounded-lg bg-black/30 border border-gray-700">
                  <h4 className="font-semibold text-white mb-1">Emergency Resources</h4>
                  <p className="text-gray-400 text-sm mb-2">If you're in crisis, please reach out immediately:</p>
                  <p className="text-yellow-400 text-sm">National Suicide Prevention Lifeline: 988</p>
                </div>
              </CardContent>
            </Card>

            {/* Support Promise */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-center p-8 rounded-2xl bg-gradient-to-r from-yellow-500/10 to-yellow-400/5 border border-yellow-500/20"
            >
              <Heart className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Our Promise to You</h3>
              <p className="text-gray-300 leading-relaxed">
                Your mental health matters to us. Every message is read with care, and we're committed to providing
                compassionate, helpful support for your wellness journey.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
