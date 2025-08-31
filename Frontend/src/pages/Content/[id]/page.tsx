/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Clock, User, Calendar, Share2, Bookmark, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useParams, useNavigate } from "react-router-dom"

// Mock article data
const getArticleById = (id: string) => {
  const articles = {
    "1": {
      id: 1,
      title: "Understanding Anxiety: A Comprehensive Guide",
      excerpt: "Learn about the different types of anxiety disorders and effective coping strategies to manage daily stress and worry.",
      category: "Mental Health",
      author: "Dr. Sarah Johnson",
      readTime: "8 min read",
      publishedAt: "2024-01-15",
      image: "/Images/article/anxiety.png",
      content: [
        { type: "heading", text: "What is Anxiety?" },
        { type: "paragraph", text: "Anxiety is a natural human response to stress and potential threats. It's characterized by feelings of worry, nervousness, or unease about something with an uncertain outcome. While occasional anxiety is normal and even helpful, persistent anxiety that interferes with daily life may indicate an anxiety disorder." },
        
        { type: "heading", text: "Types of Anxiety Disorders" },
        { type: "paragraph", text: "There are several types of anxiety disorders, each with unique characteristics:" },
        { type: "list", items: [
          "Generalized Anxiety Disorder (GAD): Persistent, excessive worry about various aspects of life",
          "Social Anxiety Disorder: Intense fear of social situations and being judged by others",
          "Panic Disorder: Recurring panic attacks with physical symptoms like rapid heartbeat",
          "Specific Phobias: Intense fear of specific objects or situations"
        ] },
        
        { type: "heading", text: "Coping Strategies" },
        { type: "paragraph", text: "Managing anxiety effectively requires a combination of strategies:" },
        { type: "list", items: [
          "Deep Breathing: Practice diaphragmatic breathing to activate your body's relaxation response",
          "Mindfulness Meditation: Stay present and observe thoughts without judgment",
          "Regular Exercise: Physical activity releases endorphins and reduces stress hormones",
          "Healthy Sleep Habits: Maintain a consistent sleep schedule for better emotional regulation",
          "Professional Support: Consider therapy or counseling when anxiety becomes overwhelming"
        ], ordered: true },
        
        { type: "heading", text: "When to Seek Help" },
        { type: "paragraph", text: "It's important to seek professional help if anxiety:" },
        { type: "list", items: [
          "Interferes with daily activities or relationships",
          "Causes physical symptoms like chest pain or difficulty breathing",
          "Leads to avoidance of important situations",
          "Persists for weeks or months without improvement"
        ] },
        
        { type: "paragraph", text: "Remember, anxiety is treatable, and with the right support and strategies, you can learn to manage it effectively and live a fulfilling life." }
      ],
      tags: ["anxiety", "mental health", "coping strategies", "wellness"],
      featured: true,
    },
    "2": {
      id: 2,
      title: "The Science of Mindfulness Meditation",
      excerpt: "Discover how mindfulness meditation affects your brain and learn practical techniques to incorporate it into your daily routine.",
      category: "Mindfulness",
      author: "Dr. Michael Chen",
      readTime: "6 min read",
      publishedAt: "2024-01-12",
      image: "/Images/article/meditation.png",
      content: [
        { type: "heading", text: "The Neuroscience Behind Mindfulness" },
        { type: "paragraph", text: "Recent neuroscientific research has revealed fascinating insights into how mindfulness meditation affects the brain. Regular practice leads to measurable changes in brain structure and function, particularly in areas associated with attention, emotional regulation, and self-awareness." },
        
        { type: "heading", text: "Brain Changes from Meditation" },
        { type: "paragraph", text: "Studies using MRI scans have shown that mindfulness meditation can:" },
        { type: "list", items: [
          "Increase gray matter density in the hippocampus, associated with learning and memory",
          "Reduce amygdala reactivity, leading to better emotional regulation",
          "Strengthen the prefrontal cortex, improving focus and decision-making",
          "Enhance connectivity between different brain regions"
        ] },
        
        { type: "heading", text: "Getting Started with Mindfulness" },
        { type: "paragraph", text: "Here's a simple 5-minute mindfulness practice for beginners:" },
        { type: "list", items: [
          "Find a comfortable, quiet space",
          "Sit with your back straight but relaxed",
          "Close your eyes or soften your gaze",
          "Focus on your breath without trying to change it",
          "When your mind wanders, gently return attention to your breath"
        ], ordered: true },
        
        { type: "heading", text: "Building a Daily Practice" },
        { type: "paragraph", text: "Consistency is more important than duration. Start with just 5 minutes daily and gradually increase as you become more comfortable with the practice." }
      ],
      tags: ["mindfulness", "meditation", "neuroscience", "brain health"],
      featured: false,
    },
    "3": {
      id: 3,
      title: "Building Emotional Resilience",
      excerpt: "Practical strategies to develop emotional strength and bounce back from life's challenges with greater confidence.",
      category: "Emotional Wellness",
      author: "Dr. Emily Rodriguez",
      readTime: "10 min read",
      publishedAt: "2024-01-10",
      image: "/Images/article/emotional.png",
      content: [
        { type: "heading", text: "Understanding Emotional Resilience" },
        { type: "paragraph", text: "Emotional resilience is the ability to adapt and bounce back when things don't go as planned. It's not about avoiding difficult emotions, but rather learning to navigate them effectively and emerge stronger from challenging experiences." },
        
        { type: "heading", text: "Key Components of Resilience" },
        { type: "paragraph", text: "Research has identified several key factors that contribute to emotional resilience:" },
        { type: "list", items: [
          "Self-awareness: Understanding your emotions, triggers, and patterns",
          "Emotional regulation: Managing intense emotions in healthy ways",
          "Optimism: Maintaining hope and focusing on possibilities",
          "Social support: Building and maintaining meaningful relationships",
          "Problem-solving skills: Approaching challenges with creativity and flexibility"
        ] },
        
        { type: "heading", text: "Building Resilience Strategies" },
        { type: "paragraph", text: "Here are practical ways to strengthen your emotional resilience:" },
        { type: "list", items: [
          "Practice self-compassion: Treat yourself with kindness during difficult times",
          "Develop a growth mindset: View challenges as opportunities to learn and grow",
          "Build strong relationships: Invest in connections with supportive people",
          "Take care of your physical health: Exercise, eat well, and get adequate sleep",
          "Practice mindfulness: Stay present and avoid getting caught up in worry"
        ], ordered: true },
        
        { type: "paragraph", text: "Remember, building resilience is a gradual process. Be patient with yourself as you develop these skills." }
      ],
      tags: ["resilience", "emotional wellness", "mental strength", "coping"],
      featured: true,
    },
    "4": {
      id: 4,
      title: "Sleep and Mental Health Connection",
      excerpt: "Explore the vital relationship between quality sleep and mental wellbeing, plus tips for better sleep hygiene.",
      category: "Sleep Health",
      author: "Dr. James Wilson",
      readTime: "7 min read",
      publishedAt: "2024-01-08",
      image: "/Images/article/mental-health.png",
      content: [
        { type: "heading", text: "The Sleep-Mental Health Connection" },
        { type: "paragraph", text: "Sleep and mental health are intimately connected. Poor sleep can contribute to mental health problems, while mental health issues can make it harder to sleep well. Understanding this relationship is crucial for overall wellbeing." },
        
        { type: "heading", text: "How Sleep Affects Mental Health" },
        { type: "paragraph", text: "Quality sleep is essential for:" },
        { type: "list", items: [
          "Emotional regulation: Processing and managing emotions effectively",
          "Stress management: Reducing cortisol levels and stress response",
          "Cognitive function: Maintaining focus, memory, and decision-making abilities",
          "Mood stability: Preventing irritability and mood swings"
        ] },
        
        { type: "heading", text: "Sleep Hygiene Tips" },
        { type: "paragraph", text: "Improve your sleep quality with these evidence-based strategies:" },
        { type: "list", items: [
          "Maintain a consistent schedule: Go to bed and wake up at the same time daily",
          "Create a bedtime routine: Develop calming pre-sleep activities",
          "Optimize your environment: Keep your bedroom cool, dark, and quiet",
          "Limit screen time: Avoid devices 1-2 hours before bedtime",
          "Watch your diet: Avoid caffeine and large meals before sleep"
        ], ordered: true },
        
        { type: "paragraph", text: "If sleep problems persist, consider consulting with a healthcare provider or sleep specialist." }
      ],
      tags: ["sleep", "mental health", "sleep hygiene", "wellness"],
      featured: false,
    },
    "5": {
      id: 5,
      title: "Managing Stress in the Digital Age",
      excerpt: "Learn how to maintain mental balance while navigating social media, work emails, and constant connectivity.",
      category: "Digital Wellness",
      author: "Dr. Lisa Park",
      readTime: "9 min read",
      publishedAt: "2024-01-05",
      image: "/Images/article/stress.png",
      content: [
        { type: "heading", text: "Digital Overwhelm in Modern Life" },
        { type: "paragraph", text: "In our hyperconnected world, we're constantly bombarded with notifications, emails, and social media updates. This digital overwhelm can significantly impact our mental health and stress levels." },
        
        { type: "heading", text: "Signs of Digital Stress" },
        { type: "paragraph", text: "You might be experiencing digital stress if you notice:" },
        { type: "list", items: [
          "Feeling anxious when separated from your devices",
          "Constantly checking notifications throughout the day",
          "Difficulty concentrating on tasks without digital distractions",
          "Sleep disruption from late-night screen use",
          "Comparing yourself to others on social media"
        ] },
        
        { type: "heading", text: "Digital Wellness Strategies" },
        { type: "paragraph", text: "Here are practical ways to manage digital stress:" },
        { type: "list", items: [
          "Set boundaries: Establish specific times for checking emails and social media",
          "Use focus modes: Turn off non-essential notifications during work or personal time",
          "Practice digital detox: Take regular breaks from all devices",
          "Curate your feeds: Unfollow accounts that make you feel negative",
          "Create tech-free zones: Keep bedrooms and dining areas device-free"
        ], ordered: true },
        
        { type: "paragraph", text: "Remember, technology should enhance your life, not control it. Finding the right balance is key to digital wellness." }
      ],
      tags: ["digital wellness", "stress management", "technology", "balance"],
      featured: false,
    },
    "6": {
      id: 6,
      title: "The Power of Gratitude Practice",
      excerpt: "Discover how daily gratitude exercises can transform your mindset and improve overall mental health.",
      category: "Positive Psychology",
      author: "Dr. Robert Kim",
      readTime: "5 min read",
      publishedAt: "2024-01-03",
      image: "/Images/article/gratitude.png",
      content: [
        { type: "heading", text: "The Science of Gratitude" },
        { type: "paragraph", text: "Gratitude is more than just saying 'thank you.' Research shows that regular gratitude practice can rewire your brain for positivity, improve relationships, and boost overall mental health." },
        
        { type: "heading", text: "Benefits of Gratitude Practice" },
        { type: "paragraph", text: "Studies have shown that gratitude can:" },
        { type: "list", items: [
          "Improve mood: Increase feelings of happiness and life satisfaction",
          "Reduce stress: Lower cortisol levels and anxiety",
          "Enhance relationships: Strengthen social bonds and empathy",
          "Boost immune function: Improve physical health and energy levels",
          "Improve sleep: Promote better rest and recovery"
        ] },
        
        { type: "heading", text: "Simple Gratitude Practices" },
        { type: "paragraph", text: "Try these easy ways to incorporate gratitude into your daily routine:" },
        { type: "list", items: [
          "Gratitude journaling: Write down 3 things you're grateful for each day",
          "Gratitude meditation: Spend 5 minutes focusing on appreciation",
          "Thank you notes: Express appreciation to people in your life",
          "Gratitude walks: Notice and appreciate your surroundings",
          "Bedtime reflection: End each day by thinking of positive moments"
        ], ordered: true },
        
        { type: "paragraph", text: "Start small and be consistent. Even a few minutes of gratitude practice daily can make a significant difference in your mental wellbeing." }
      ],
      tags: ["gratitude", "positive psychology", "happiness", "mindfulness"],
      featured: false,
    },
  }

  return articles[id as keyof typeof articles] || null
}

// Component to render article content
const ArticleContent = ({ content }: { content: any[] }) => {
  return (
    <div className="space-y-6">
      {content.map((item, index) => {
        if (item.type === "heading") {
          return <h2 key={index} className="text-2xl font-bold text-white mt-8 mb-4">{item.text}</h2>
        } else if (item.type === "paragraph") {
          return <p key={index} className="text-white leading-relaxed">{item.text}</p>
        } else if (item.type === "list") {
          if (item.ordered) {
            return (
              <ol key={index} className="list-decimal list-inside text-white space-y-2 pl-4">
                {item.items.map((listItem: string, i: number) => (
                  <li key={i} className="leading-relaxed">{listItem}</li>
                ))}
              </ol>
            )
          } else {
            return (
              <ul key={index} className="list-disc list-inside text-white space-y-2 pl-4">
                {item.items.map((listItem: string, i: number) => (
                  <li key={i} className="leading-relaxed">{listItem}</li>
                ))}
              </ul>
            )
          }
        }
        return null
      })}
    </div>
  )
}

export default function ArticlePage() {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<any>(null)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isLiked, setIsLiked] = useState(false)

  useEffect(() => {
    if (params.id) {
      const articleData = getArticleById(params.id)
      setArticle(articleData)
    }
  }, [params.id])

  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Article not found</h1>
          <Button 
            onClick={() => navigate('/content')}
            className="bg-yellow-500 text-black hover:bg-yellow-400"
          >
            Back to Library
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-yellow-500/20 bg-black/50 backdrop-blur-sm sticky top-0 z-50"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/content')}
              className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Library
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`${isBookmarked ? "text-yellow-400" : "text-slate-400"} hover:text-yellow-300`}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsLiked(!isLiked)}
                className={`${isLiked ? "text-red-400" : "text-slate-400"} hover:text-red-300`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
              </Button>
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-yellow-300">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      <article className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Article Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Badge className="mb-4 bg-yellow-500 text-black">{article.category}</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">{article.title}</h1>
          <p className="text-xl text-white mb-6 leading-relaxed">{article.excerpt}</p>

          <div className="flex flex-wrap items-center gap-6 text-white text-sm">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{article.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date(article.publishedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{article.readTime}</span>
            </div>
          </div>
        </motion.div>

        {/* Featured Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <img
            src={article.image || "/placeholder.svg"}
            alt={article.title}
            className="w-full h-64 md:h-96 object-cover rounded-xl"
          />
        </motion.div>

        {/* Article Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-white"
        >
          <ArticleContent content={article.content} />
        </motion.div>

        {/* Tags */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 pt-8 border-t border-slate-700"
        >
          <h3 className="text-white font-semibold mb-4">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag: string) => (
              <Badge key={tag} variant="outline" className="border-slate-600 text-white hover:border-yellow-500">
                #{tag}
              </Badge>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 p-6 bg-slate-800/50 rounded-xl border border-slate-700 text-center"
        >
          <h3 className="text-xl font-semibold text-white mb-2">Ready to start your wellness journey?</h3>
          <p className="text-slate-400 mb-4">Discover more resources and connect with Melify, your AI companion.</p>
          <Button 
            onClick={() => navigate('/')}
            className="bg-yellow-500 text-black hover:bg-yellow-400"
          >
            Explore Zenium
          </Button>
        </motion.div>
      </article>
    </div>
  )
}