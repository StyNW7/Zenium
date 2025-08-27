"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Zap, Sparkles } from "lucide-react"
import { useNavigate } from "react-router-dom"

export function SpotlightSection() {

  const navigate = useNavigate()
  const handleGetStarted = () => {
    navigate("/register")
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-128 h-128 bg-primary/5 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Lightning effects */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 bg-gradient-to-b from-primary to-transparent"
            style={{
              left: `${20 + i * 15}%`,
              height: `${Math.random() * 200 + 100}px`,
              top: `${Math.random() * 50}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scaleY: [0, 1, 0],
            }}
            transition={{
              duration: 0.5,
              repeat: Number.POSITIVE_INFINITY,
              delay: i * 0.3,
              repeatDelay: 2,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 text-center relative z-10 pt-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 text-lg px-4 py-2">
            <Sparkles className="w-4 h-4 mr-2" />
            Introducing Zenium x Melify
          </Badge>

          <motion.h1
            className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-secondary bg-clip-text text-transparent"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            AI with empathy,
            <br />
            <span className="text-primary">IoT with soul</span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Connect with <span className="text-primary font-semibold">Melify</span>, your AI and IoT companion and <span className="text-primary font-semibold">Zenium</span> to track mood,
            journal thoughts, and embark on a transformative mental wellness journey powered by lightning-fast insights.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Button size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-4"
              onClick={handleGetStarted}>
              <Zap className="w-5 h-5 mr-2" />
                Start Your Journey
              </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-4 bg-transparent">
              <Heart className="w-5 h-5 mr-2" />
              Meet Melify
            </Button>
          </motion.div>

          {/* Feature highlights */}
          <motion.div
            className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            {[
              { icon: Heart, title: "Emotional Support", desc: "24/7 AI companion" },
              { icon: Zap, title: "Lightning Insights", desc: "Real-time mood analysis" },
              { icon: Sparkles, title: "Personalized Care", desc: "Tailored wellness plans" },
            ].map((item, index) => (
              <motion.div
                key={index}
                className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 hover:bg-card/70 transition-all duration-300"
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <item.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
      >
        <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-primary rounded-full mt-2" />
        </div>
      </motion.div>
    </section>
  )
}
