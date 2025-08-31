"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Linkedin, Twitter, Mail, Heart, Target, Users, Zap, Star, Award, Coffee } from "lucide-react"

export default function TeamPage() {
  const teamMembers = [
    {
      name: "Dr. Sarah Chen",
      role: "Co-Founder & Chief Executive Officer",
      image: "/team-sarah.png",
      bio: "Clinical psychologist with 15+ years in digital mental health. Former researcher at Stanford's AI Lab, passionate about making mental health support accessible to everyone.",
      expertise: ["Clinical Psychology", "AI Ethics", "Digital Health"],
      social: {
        linkedin: "#",
        twitter: "#",
        email: "sarah@zenium.app",
      },
      isLeader: true,
    },
    {
      name: "Alex Rodriguez",
      role: "Co-Founder & Chief Technology Officer",
      image: "/team-alex.png",
      bio: "Full-stack engineer and AI specialist. Previously led engineering teams at major tech companies, now dedicated to building empathetic AI companions.",
      expertise: ["AI/ML Engineering", "IoT Development", "System Architecture"],
      social: {
        linkedin: "#",
        twitter: "#",
        email: "alex@zenium.app",
      },
      isLeader: false,
    },
    {
      name: "Dr. Maya Patel",
      role: "Head of Clinical Research",
      image: "/team-maya.png",
      bio: "Neuroscientist and mental health researcher. Leads our clinical validation studies and ensures Zenium's approaches are evidence-based and effective.",
      expertise: ["Neuroscience", "Clinical Research", "Data Analysis"],
      social: {
        linkedin: "#",
        twitter: "#",
        email: "maya@zenium.app",
      },
      isLeader: false,
    },
  ]

  const values = [
    {
      icon: Heart,
      title: "Empathy First",
      description: "Every decision we make is guided by genuine care for mental health and human wellbeing.",
    },
    {
      icon: Target,
      title: "Evidence-Based",
      description: "Our approaches are grounded in scientific research and clinical best practices.",
    },
    {
      icon: Users,
      title: "Inclusive Design",
      description: "We build for everyone, ensuring accessibility and cultural sensitivity in all our work.",
    },
    {
      icon: Zap,
      title: "Innovation",
      description: "We push boundaries in AI and IoT to create breakthrough mental health solutions.",
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
          <Badge className="mb-4 bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Meet Our Team</Badge>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-yellow-400 via-white to-yellow-300 bg-clip-text text-transparent">
            The Minds Behind Zenium
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            We're a passionate team of clinicians, engineers, and researchers united by a shared mission: making mental
            health support accessible, effective, and deeply human through innovative technology.
          </p>
        </motion.div>

        {/* Team Mission */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-20"
        >
          <Card className="bg-gradient-to-r from-yellow-500/10 to-yellow-400/5 border-yellow-500/20 backdrop-blur-sm">
            <CardContent className="p-6 md:p-12 text-center">
              <Star className="h-12 md:h-16 w-12 md:w-16 text-yellow-400 mx-auto mb-6" />
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Our Mission</h2>
              <p className="text-lg md:text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                "We believe that everyone deserves access to compassionate, personalized mental health support. By
                combining cutting-edge AI with human empathy, we're creating a future where technology doesn't replace
                human connection—it enhances it. Zenium and Melify represent our commitment to making mental wellness
                not just accessible, but genuinely transformative."
              </p>
              <div className="mt-8 flex items-center justify-center space-x-2">
                <Coffee className="h-5 w-5 text-yellow-400" />
                <span className="text-gray-400 italic">Built with love, powered by purpose</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Team Members */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Leadership Team</h2>
            <p className="text-gray-400 text-lg">The visionaries driving Zenium's mission forward</p>
          </div>

          <div className="flex flex-col lg:flex-row justify-center items-stretch gap-8 max-w-6xl mx-auto">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                className={`flex-1 ${member.isLeader ? "lg:order-2" : index === 0 ? "lg:order-1" : "lg:order-3"}`}
              >
                <Card
                  className={`bg-gray-900/50 border-yellow-500/20 backdrop-blur-sm hover:bg-yellow-500/5 transition-all duration-300 h-full flex flex-col ${member.isLeader ? "border-yellow-500/40 shadow-lg shadow-yellow-500/10" : ""}`}
                >
                  <CardContent className="p-6 text-center flex flex-col flex-grow">
                    {member.isLeader && (
                      <div className="flex justify-center mb-4">
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                          <Award className="mr-1 h-3 w-3" />
                          Team Leader
                        </Badge>
                      </div>
                    )}

                    <div className="relative mb-6">
                      <div
                        className={`w-24 h-24 md:w-32 md:h-32 mx-auto rounded-full bg-gradient-to-br from-yellow-500/20 to-yellow-400/10 border-2 ${member.isLeader ? "border-yellow-500/50" : "border-yellow-500/30"} flex items-center justify-center`}
                      >
                        <Users className="h-12 w-12 md:h-16 md:w-16 text-yellow-400" />
                      </div>
                      {member.isLeader && (
                        <div className="absolute -top-2 -right-2 bg-yellow-500 rounded-full p-2">
                          <Star className="h-4 w-4 text-black" />
                        </div>
                      )}
                    </div>

                    <h3 className="text-xl md:text-2xl font-bold text-white mb-2">{member.name}</h3>
                    <p className="text-yellow-400 font-semibold mb-4 text-sm md:text-base">{member.role}</p>
                    <p className="text-gray-300 leading-relaxed mb-6 text-sm md:text-base flex-grow">{member.bio}</p>

                    <div className="mb-6">
                      <h4 className="text-white font-semibold mb-3 text-sm md:text-base">Expertise</h4>
                      <div className="flex flex-wrap justify-center gap-2">
                        {member.expertise.map((skill) => (
                          <Badge 
                            key={skill} 
                            variant="outline" 
                            className="border-gray-600 text-gray-300 bg-gray-800/50 text-xs"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-center space-x-4 mt-auto">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 bg-transparent"
                      >
                        <Linkedin className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 bg-transparent"
                      >
                        <Twitter className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 bg-transparent"
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Team Values */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Our Values</h2>
            <p className="text-gray-400 text-lg">The principles that guide everything we do</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
              >
                <Card className="bg-gray-900/50 border-yellow-500/20 backdrop-blur-sm hover:bg-yellow-500/5 transition-all duration-300 h-full">
                  <CardContent className="p-6 text-center">
                    <div className="bg-yellow-500/20 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <value.icon className="h-6 w-6 md:h-8 md:w-8 text-yellow-400" />
                    </div>
                    <h3 className="text-lg md:text-xl font-semibold text-white mb-3">{value.title}</h3>
                    <p className="text-gray-300 leading-relaxed text-sm md:text-base">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Join Us Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center"
        >
          <Card className="bg-gradient-to-r from-yellow-500/10 to-yellow-400/5 border-yellow-500/20 backdrop-blur-sm">
            <CardContent className="p-6 md:p-12">
              <Users className="h-12 md:h-16 w-12 md:w-16 text-yellow-400 mx-auto mb-6" />
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">Join Our Mission</h3>
              <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                We're always looking for passionate individuals who share our vision of making mental health support
                more accessible and effective. Whether you're a clinician, engineer, researcher, or simply someone who
                cares deeply about mental wellness, we'd love to hear from you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/contact">
                  <Button className="bg-gradient-to-r from-yellow-500 to-yellow-400 text-black font-semibold hover:from-yellow-400 hover:to-yellow-300">
                    Get in Touch
                  </Button>
                </a>
                <Button
                  variant="outline"
                  className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 bg-transparent"
                >
                  View Open Positions
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}