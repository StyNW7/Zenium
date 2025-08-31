"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Shield, Lock, Eye, FileText, Users, Database, AlertTriangle, CheckCircle } from "lucide-react"

export default function LegalPage() {
  const sections = [
    {
      id: "privacy",
      title: "Privacy Policy",
      icon: Shield,
      description: "How we collect, use, and protect your personal information",
    },
    {
      id: "terms",
      title: "Terms of Service",
      icon: FileText,
      description: "Your rights and responsibilities when using Zenium",
    },
    {
      id: "data",
      title: "Data Security",
      icon: Lock,
      description: "Our commitment to keeping your mental health data secure",
    },
    {
      id: "cookies",
      title: "Cookie Policy",
      icon: Eye,
      description: "How we use cookies and tracking technologies",
    },
  ]

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
          <Badge className="mb-4 bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Legal & Privacy</Badge>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-yellow-400 via-white to-yellow-300 bg-clip-text text-transparent">
            Legal Terms & Privacy
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Your privacy and security are fundamental to our mission. Learn about our commitment to protecting your
            mental health data and your rights when using Zenium.
          </p>
        </motion.div>

        {/* Quick Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {sections.map((section, index) => (
            <motion.a
              key={section.id}
              href={`#${section.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <Card className="bg-gray-900/50 border-yellow-500/20 backdrop-blur-sm hover:bg-yellow-500/5 transition-all duration-300 h-full">
                <CardContent className="p-6 text-center">
                  <section.icon className="h-12 w-12 text-yellow-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-white mb-2">{section.title}</h3>
                  <p className="text-gray-400 text-sm">{section.description}</p>
                </CardContent>
              </Card>
            </motion.a>
          ))}
        </motion.div>

        {/* Privacy Policy Section */}
        <motion.section
          id="privacy"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-16"
        >
          <Card className="bg-gray-900/50 border-yellow-500/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-3xl text-white flex items-center">
                <Shield className="mr-4 h-8 w-8 text-yellow-400" />
                Privacy Policy
              </CardTitle>
              <CardDescription className="text-gray-400 text-lg">Last updated: January 2025</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 text-gray-300 leading-relaxed">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Database className="mr-2 h-5 w-5 text-yellow-400" />
                  Information We Collect
                </h3>
                <div className="space-y-4 pl-7">
                  <div>
                    <h4 className="font-semibold text-yellow-400 mb-2">Personal Information</h4>
                    <p>
                      We collect information you provide directly, including your name, email address, and account
                      preferences. This helps us personalize your Zenium experience and provide better mental health
                      support.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-yellow-400 mb-2">Mental Health Data</h4>
                    <p>
                      Your mood tracking, journal entries, and wellness metrics are encrypted and stored securely. This
                      sensitive data is never shared with third parties and is used solely to provide you with
                      personalized insights and support.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-yellow-400 mb-2">Melify Interactions</h4>
                    <p>
                      Conversations with your Melify AI companion are processed to improve responses and provide
                      emotional support. All interactions are anonymized and encrypted for your privacy.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Lock className="mr-2 h-5 w-5 text-yellow-400" />
                  How We Protect Your Data
                </h3>
                <div className="space-y-4 pl-7">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <p>
                      <strong>End-to-End Encryption:</strong> All mental health data is encrypted both in transit and at
                      rest using industry-standard AES-256 encryption.
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <p>
                      <strong>HIPAA Compliance:</strong> Our platform meets healthcare privacy standards to ensure your
                      mental health information is protected.
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <p>
                      <strong>Regular Security Audits:</strong> We conduct quarterly security assessments and
                      penetration testing to maintain the highest security standards.
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <p>
                      <strong>Limited Access:</strong> Only authorized personnel with legitimate business needs can
                      access your data, and all access is logged and monitored.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Users className="mr-2 h-5 w-5 text-yellow-400" />
                  Your Rights and Control
                </h3>
                <div className="space-y-4 pl-7">
                  <p>
                    You have complete control over your mental health data. You can access, modify, or delete your
                    information at any time through your dashboard settings.
                  </p>
                  <p>
                    You can export all your data in a portable format, pause data collection, or permanently delete your
                    account and all associated data.
                  </p>
                  <p>
                    We will never sell your personal information or mental health data to third parties. Your privacy is
                    not for sale.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Terms of Service Section */}
        <motion.section
          id="terms"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-16"
        >
          <Card className="bg-gray-900/50 border-yellow-500/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-3xl text-white flex items-center">
                <FileText className="mr-4 h-8 w-8 text-yellow-400" />
                Terms of Service
              </CardTitle>
              <CardDescription className="text-gray-400 text-lg">Last updated: January 2025</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 text-gray-300 leading-relaxed">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Acceptance of Terms</h3>
                <p className="pl-4">
                  By using Zenium and interacting with Melify, you agree to these terms of service. These terms govern
                  your use of our mental health platform and AI companion services.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Service Description</h3>
                <div className="space-y-4 pl-4">
                  <p>
                    Zenium is a digital mental health platform that provides mood tracking, wellness resources, and an
                    AI-powered companion named Melify. Our services are designed to support your mental wellness journey
                    but do not replace professional medical care.
                  </p>
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <p className="text-yellow-200">
                        <strong>Important:</strong> Zenium is not a substitute for professional mental health treatment.
                        If you're experiencing a mental health crisis, please contact emergency services or a mental
                        health professional immediately.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-4">User Responsibilities</h3>
                <div className="space-y-3 pl-4">
                  <p>• Provide accurate information when using our services</p>
                  <p>• Use the platform responsibly and in accordance with its intended purpose</p>
                  <p>• Respect the privacy and rights of other users</p>
                  <p>• Seek professional help when needed and not rely solely on digital tools</p>
                  <p>• Keep your account credentials secure and confidential</p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Intellectual Property</h3>
                <p className="pl-4">
                  All content, features, and functionality of Zenium, including Melify's AI responses, are owned by us
                  and protected by copyright, trademark, and other intellectual property laws.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Data Security Section */}
        <motion.section
          id="data"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mb-16"
        >
          <Card className="bg-gray-900/50 border-yellow-500/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-3xl text-white flex items-center">
                <Lock className="mr-4 h-8 w-8 text-yellow-400" />
                Data Security
              </CardTitle>
              <CardDescription className="text-gray-400 text-lg">
                Our comprehensive approach to protecting your mental health data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 text-gray-300 leading-relaxed">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Technical Safeguards</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span>256-bit SSL/TLS encryption</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span>Multi-factor authentication</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span>Regular security updates</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span>Automated threat detection</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Operational Security</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span>Staff background checks</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span>Access control policies</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span>Incident response procedures</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span>Regular security training</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <h4 className="font-semibold text-white mb-3">Data Breach Protocol</h4>
                <p>
                  In the unlikely event of a data breach, we will notify affected users within 72 hours and provide
                  detailed information about what happened, what data was involved, and what steps we're taking to
                  resolve the issue.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Cookie Policy Section */}
        <motion.section
          id="cookies"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="mb-16"
        >
          <Card className="bg-gray-900/50 border-yellow-500/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-3xl text-white flex items-center">
                <Eye className="mr-4 h-8 w-8 text-yellow-400" />
                Cookie Policy
              </CardTitle>
              <CardDescription className="text-gray-400 text-lg">
                How we use cookies and similar technologies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-gray-300 leading-relaxed">
              <p>
                We use cookies and similar technologies to enhance your experience, remember your preferences, and
                analyze how you use Zenium to improve our services.
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <h4 className="font-semibold text-yellow-400 mb-2">Essential Cookies</h4>
                  <p className="text-sm">
                    Required for basic functionality like login and security. These cannot be disabled.
                  </p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <h4 className="font-semibold text-yellow-400 mb-2">Analytics Cookies</h4>
                  <p className="text-sm">
                    Help us understand how you use Zenium to improve our services. You can opt out of these.
                  </p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <h4 className="font-semibold text-yellow-400 mb-2">Preference Cookies</h4>
                  <p className="text-sm">Remember your settings and preferences to personalize your experience.</p>
                </div>
              </div>

              <p>You can manage your cookie preferences through your browser settings or by contacting us directly.</p>
            </CardContent>
          </Card>
        </motion.section>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="text-center"
        >
          <Card className="bg-gradient-to-r from-yellow-500/10 to-yellow-400/5 border-yellow-500/20 backdrop-blur-sm">
            <CardContent className="p-8">
              <h3 className="text-2xl font-semibold text-white mb-4">Questions About Our Policies?</h3>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                We're committed to transparency about how we handle your data. If you have any questions about our
                privacy practices or terms of service, we're here to help.
              </p>
              <a href="/contact">
                <Button className="bg-gradient-to-r from-yellow-500 to-yellow-400 text-black font-semibold hover:from-yellow-400 hover:to-yellow-300">
                  Contact Our Privacy Team
                </Button>
              </a>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
