"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Heart, Brain, Smartphone, Users, TrendingUp, Zap, Shield, Clock, CheckCircle } from "lucide-react"
import { SpotlightSection } from "./spotlight-section"
import { MarqueeSection } from "./marquee-section"
import { StatsSection } from "./stats-section"
import { TestimonialSection } from "./testimonial-section"

export function ZeniumHomepage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">Zenium</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
              About
            </a>
            <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">
              Testimonials
            </a>
            <a href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">
              FAQ
            </a>
          </div>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Get Started</Button>
        </div>
      </motion.nav>

      {/* Hero Section with Spotlight */}
      <SpotlightSection />

      {/* About Section */}
      <section id="about" className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">About Zenium</Badge>
            <h2 className="text-4xl font-bold mb-6">Your Digital Wellness Companion</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Zenium is a revolutionary web application designed to support mental health in an accessible,
              cross-platform way. Connect with Melify, your AI-powered smart doll companion, and embark on a journey of
              digital wellness and emotional support.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h3 className="text-2xl font-bold mb-4">Meet Melify</h3>
              <p className="text-muted-foreground mb-6">
                Melify is an AI & IoT-powered smart doll designed as an interactive emotional companion. With warm
                design, natural interactions, and seamless integration with Zenium, Melify delivers a humanized
                technology experience for mental health support.
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>AI-powered emotional intelligence</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Natural voice interactions</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Seamless app integration</span>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl p-8 text-center">
                <div className="w-32 h-32 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Heart className="h-16 w-16 text-primary" />
                </div>
                <h4 className="text-xl font-semibold mb-2">Melify Smart Doll</h4>
                <p className="text-muted-foreground">Your AI companion for emotional wellness</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <Card className="h-full">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Our Vision</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    To create a world where mental health support is accessible, personalized, and seamlessly integrated
                    into daily life through innovative AI technology and compassionate design.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                    <Heart className="h-6 w-6 text-secondary" />
                  </div>
                  <CardTitle className="text-2xl">Our Mission</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    To empower individuals on their mental wellness journey by providing intelligent, empathetic, and
                    accessible digital tools that complement traditional mental health care and foster emotional
                    resilience.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Zenium Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Why Choose Zenium</Badge>
            <h2 className="text-4xl font-bold mb-6">Transforming Mental Health Care</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Experience the future of mental wellness with our innovative approach to digital health support.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Privacy First",
                description:
                  "Your mental health data is protected with enterprise-grade security and complete privacy control.",
              },
              {
                icon: Clock,
                title: "24/7 Availability",
                description:
                  "Access support whenever you need it, with Melify always ready to provide comfort and guidance.",
              },
              {
                icon: Brain,
                title: "AI-Powered Insights",
                description:
                  "Advanced AI analyzes patterns to provide personalized recommendations for your wellness journey.",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="text-center h-full">
                  <CardHeader>
                    <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <item.icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle>{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Use Zenium */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-secondary/10 text-secondary border-secondary/20">How It Works</Badge>
            <h2 className="text-4xl font-bold mb-6">Simple Steps to Wellness</h2>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Sign Up", description: "Create your account and complete your wellness profile" },
              { step: "02", title: "Connect Melify", description: "Pair your Melify smart doll with the Zenium app" },
              {
                step: "03",
                title: "Start Tracking",
                description: "Begin logging your mood, thoughts, and daily activities",
              },
              {
                step: "04",
                title: "Grow Together",
                description: "Receive personalized insights and support from Melify",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center text-primary-foreground font-bold text-xl">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Marquee Section */}
      <MarqueeSection />

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Features</Badge>
            <h2 className="text-4xl font-bold mb-6">Comprehensive Wellness Tools</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to support your mental health journey in one integrated platform.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: TrendingUp,
                title: "Mood Tracking",
                description: "Monitor your emotional patterns with intelligent mood analysis and insights.",
              },
              {
                icon: Heart,
                title: "Daily Journaling",
                description: "Express your thoughts and feelings with guided journaling prompts and reflection tools.",
              },
              {
                icon: Zap,
                title: "Daily Motivation",
                description: "Receive personalized motivational content and affirmations to start your day right.",
              },
              {
                icon: Brain,
                title: "Mindfulness Exercises",
                description: "Access guided meditation, breathing exercises, and mindfulness practices.",
              },
              {
                icon: Users,
                title: "Community Support",
                description: "Connect with others on similar journeys in a safe, supportive environment.",
              },
              {
                icon: Smartphone,
                title: "Cross-Platform Access",
                description: "Use Zenium on any device, anywhere, with seamless synchronization.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <StatsSection />

      {/* Testimonials */}
      <TestimonialSection />

      {/* FAQ Section */}
      <section id="faq" className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">FAQ</Badge>
            <h2 className="text-4xl font-bold mb-6">Frequently Asked Questions</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Find answers to common questions about Zenium and Melify.
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {[
                {
                  question: "What is Melify and how does it work?",
                  answer:
                    "Melify is an AI-powered smart doll that serves as your emotional companion. It uses advanced AI to understand your emotions, provide comfort, and integrate seamlessly with the Zenium app to support your mental wellness journey.",
                },
                {
                  question: "Is my personal data secure with Zenium?",
                  answer:
                    "Absolutely. We prioritize your privacy with enterprise-grade security, end-to-end encryption, and strict data protection policies. Your mental health information is never shared without your explicit consent.",
                },
                {
                  question: "Can I use Zenium without the Melify doll?",
                  answer:
                    "Yes! While Melify enhances the experience, Zenium is a fully functional mental wellness platform on its own, offering mood tracking, journaling, motivation, and community features.",
                },
                {
                  question: "How much does Zenium cost?",
                  answer:
                    "Zenium offers flexible pricing plans to suit different needs. We have a free tier with basic features, and premium plans that include advanced AI insights and Melify integration.",
                },
                {
                  question: "Is Zenium a replacement for professional therapy?",
                  answer:
                    "No, Zenium is designed to complement, not replace, professional mental health care. We encourage users to work with licensed therapists and use Zenium as a supportive tool in their wellness journey.",
                },
              ].map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Mental Wellness?</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of users who have already started their journey with Zenium and Melify. Your path to better
              mental health starts today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Start Your Journey
              </Button>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Zap className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">Zenium</span>
              </div>
              <p className="text-muted-foreground">
                Empowering mental wellness through innovative AI technology and compassionate design.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Melify Doll
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Updates
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Community
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Privacy
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Press
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 Zenium. All rights reserved. Built with care for mental wellness.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
