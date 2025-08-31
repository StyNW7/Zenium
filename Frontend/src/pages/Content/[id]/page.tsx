/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Clock, User, Calendar, Share2, Bookmark, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useParams } from "react-router-dom"

// Mock article data (in a real app, this would come from an API or CMS)
const getArticleById = (id: string) => {
  const articles = {
    "1": {
      id: 1,
      title: "Understanding Anxiety: A Comprehensive Guide",
      excerpt:
        "Learn about the different types of anxiety disorders and effective coping strategies to manage daily stress and worry.",
      category: "Mental Health",
      author: "Dr. Sarah Johnson",
      readTime: "8 min read",
      publishedAt: "2024-01-15",
      image: "/peaceful-meditation.png",
      content: `
        <h2>What is Anxiety?</h2>
        <p>Anxiety is a natural human response to stress and potential threats. It's characterized by feelings of worry, nervousness, or unease about something with an uncertain outcome. While occasional anxiety is normal and even helpful, persistent anxiety that interferes with daily life may indicate an anxiety disorder.</p>
        
        <h2>Types of Anxiety Disorders</h2>
        <p>There are several types of anxiety disorders, each with unique characteristics:</p>
        <ul>
          <li><strong>Generalized Anxiety Disorder (GAD):</strong> Persistent, excessive worry about various aspects of life</li>
          <li><strong>Social Anxiety Disorder:</strong> Intense fear of social situations and being judged by others</li>
          <li><strong>Panic Disorder:</strong> Recurring panic attacks with physical symptoms like rapid heartbeat</li>
          <li><strong>Specific Phobias:</strong> Intense fear of specific objects or situations</li>
        </ul>
        
        <h2>Coping Strategies</h2>
        <p>Managing anxiety effectively requires a combination of strategies:</p>
        <ol>
          <li><strong>Deep Breathing:</strong> Practice diaphragmatic breathing to activate your body's relaxation response</li>
          <li><strong>Mindfulness Meditation:</strong> Stay present and observe thoughts without judgment</li>
          <li><strong>Regular Exercise:</strong> Physical activity releases endorphins and reduces stress hormones</li>
          <li><strong>Healthy Sleep Habits:</strong> Maintain a consistent sleep schedule for better emotional regulation</li>
          <li><strong>Professional Support:</strong> Consider therapy or counseling when anxiety becomes overwhelming</li>
        </ol>
        
        <h2>When to Seek Help</h2>
        <p>It's important to seek professional help if anxiety:</p>
        <ul>
          <li>Interferes with daily activities or relationships</li>
          <li>Causes physical symptoms like chest pain or difficulty breathing</li>
          <li>Leads to avoidance of important situations</li>
          <li>Persists for weeks or months without improvement</li>
        </ul>
        
        <p>Remember, anxiety is treatable, and with the right support and strategies, you can learn to manage it effectively and live a fulfilling life.</p>
      `,
      tags: ["anxiety", "mental health", "coping strategies", "wellness"],
      featured: true,
    },
    "2": {
      id: 2,
      title: "The Science of Mindfulness Meditation",
      excerpt:
        "Discover how mindfulness meditation affects your brain and learn practical techniques to incorporate it into your daily routine.",
      category: "Mindfulness",
      author: "Dr. Michael Chen",
      readTime: "6 min read",
      publishedAt: "2024-01-12",
      image: "/brain-meditation-science.png",
      content: `
        <h2>The Neuroscience Behind Mindfulness</h2>
        <p>Recent neuroscientific research has revealed fascinating insights into how mindfulness meditation affects the brain. Regular practice leads to measurable changes in brain structure and function, particularly in areas associated with attention, emotional regulation, and self-awareness.</p>
        
        <h2>Brain Changes from Meditation</h2>
        <p>Studies using MRI scans have shown that mindfulness meditation can:</p>
        <ul>
          <li><strong>Increase gray matter density</strong> in the hippocampus, associated with learning and memory</li>
          <li><strong>Reduce amygdala reactivity</strong>, leading to better emotional regulation</li>
          <li><strong>Strengthen the prefrontal cortex</strong>, improving focus and decision-making</li>
          <li><strong>Enhance connectivity</strong> between different brain regions</li>
        </ul>
        
        <h2>Getting Started with Mindfulness</h2>
        <p>Here's a simple 5-minute mindfulness practice for beginners:</p>
        <ol>
          <li>Find a comfortable, quiet space</li>
          <li>Sit with your back straight but relaxed</li>
          <li>Close your eyes or soften your gaze</li>
          <li>Focus on your breath without trying to change it</li>
          <li>When your mind wanders, gently return attention to your breath</li>
        </ol>
        
        <h2>Building a Daily Practice</h2>
        <p>Consistency is more important than duration. Start with just 5 minutes daily and gradually increase as you become more comfortable with the practice.</p>
      `,
      tags: ["mindfulness", "meditation", "neuroscience", "brain health"],
      featured: false,
    },
    "3": {
      id: 3,
      title: "Building Emotional Resilience",
      excerpt:
        "Practical strategies to develop emotional strength and bounce back from life's challenges with greater confidence.",
      category: "Emotional Wellness",
      author: "Dr. Emily Rodriguez",
      readTime: "10 min read",
      publishedAt: "2024-01-10",
      image: "/emotional-strength-resilience.png",
      content: `
        <h2>Understanding Emotional Resilience</h2>
        <p>Emotional resilience is the ability to adapt and bounce back when things don't go as planned. It's not about avoiding difficult emotions, but rather learning to navigate them effectively and emerge stronger from challenging experiences.</p>
        
        <h2>Key Components of Resilience</h2>
        <p>Research has identified several key factors that contribute to emotional resilience:</p>
        <ul>
          <li><strong>Self-awareness:</strong> Understanding your emotions, triggers, and patterns</li>
          <li><strong>Emotional regulation:</strong> Managing intense emotions in healthy ways</li>
          <li><strong>Optimism:</strong> Maintaining hope and focusing on possibilities</li>
          <li><strong>Social support:</strong> Building and maintaining meaningful relationships</li>
          <li><strong>Problem-solving skills:</strong> Approaching challenges with creativity and flexibility</li>
        </ul>
        
        <h2>Building Resilience Strategies</h2>
        <p>Here are practical ways to strengthen your emotional resilience:</p>
        <ol>
          <li><strong>Practice self-compassion:</strong> Treat yourself with kindness during difficult times</li>
          <li><strong>Develop a growth mindset:</strong> View challenges as opportunities to learn and grow</li>
          <li><strong>Build strong relationships:</strong> Invest in connections with supportive people</li>
          <li><strong>Take care of your physical health:</strong> Exercise, eat well, and get adequate sleep</li>
          <li><strong>Practice mindfulness:</strong> Stay present and avoid getting caught up in worry</li>
        </ol>
        
        <p>Remember, building resilience is a gradual process. Be patient with yourself as you develop these skills.</p>
      `,
      tags: ["resilience", "emotional wellness", "mental strength", "coping"],
      featured: true,
    },
    "4": {
      id: 4,
      title: "Sleep and Mental Health Connection",
      excerpt:
        "Explore the vital relationship between quality sleep and mental wellbeing, plus tips for better sleep hygiene.",
      category: "Sleep Health",
      author: "Dr. James Wilson",
      readTime: "7 min read",
      publishedAt: "2024-01-08",
      image: "/peaceful-sleep-bedroom.png",
      content: `
        <h2>The Sleep-Mental Health Connection</h2>
        <p>Sleep and mental health are intimately connected. Poor sleep can contribute to mental health problems, while mental health issues can make it harder to sleep well. Understanding this relationship is crucial for overall wellbeing.</p>
        
        <h2>How Sleep Affects Mental Health</h2>
        <p>Quality sleep is essential for:</p>
        <ul>
          <li><strong>Emotional regulation:</strong> Processing and managing emotions effectively</li>
          <li><strong>Stress management:</strong> Reducing cortisol levels and stress response</li>
          <li><strong>Cognitive function:</strong> Maintaining focus, memory, and decision-making abilities</li>
          <li><strong>Mood stability:</strong> Preventing irritability and mood swings</li>
        </ul>
        
        <h2>Sleep Hygiene Tips</h2>
        <p>Improve your sleep quality with these evidence-based strategies:</p>
        <ol>
          <li><strong>Maintain a consistent schedule:</strong> Go to bed and wake up at the same time daily</li>
          <li><strong>Create a bedtime routine:</strong> Develop calming pre-sleep activities</li>
          <li><strong>Optimize your environment:</strong> Keep your bedroom cool, dark, and quiet</li>
          <li><strong>Limit screen time:</strong> Avoid devices 1-2 hours before bedtime</li>
          <li><strong>Watch your diet:</strong> Avoid caffeine and large meals before sleep</li>
        </ol>
        
        <p>If sleep problems persist, consider consulting with a healthcare provider or sleep specialist.</p>
      `,
      tags: ["sleep", "mental health", "sleep hygiene", "wellness"],
      featured: false,
    },
    "5": {
      id: 5,
      title: "Managing Stress in the Digital Age",
      excerpt:
        "Learn how to maintain mental balance while navigating social media, work emails, and constant connectivity.",
      category: "Digital Wellness",
      author: "Dr. Lisa Park",
      readTime: "9 min read",
      publishedAt: "2024-01-05",
      image: "/digital-detox-wellness.png",
      content: `
        <h2>Digital Overwhelm in Modern Life</h2>
        <p>In our hyperconnected world, we're constantly bombarded with notifications, emails, and social media updates. This digital overwhelm can significantly impact our mental health and stress levels.</p>
        
        <h2>Signs of Digital Stress</h2>
        <p>You might be experiencing digital stress if you notice:</p>
        <ul>
          <li>Feeling anxious when separated from your devices</li>
          <li>Constantly checking notifications throughout the day</li>
          <li>Difficulty concentrating on tasks without digital distractions</li>
          <li>Sleep disruption from late-night screen use</li>
          <li>Comparing yourself to others on social media</li>
        </ul>
        
        <h2>Digital Wellness Strategies</h2>
        <p>Here are practical ways to manage digital stress:</p>
        <ol>
          <li><strong>Set boundaries:</strong> Establish specific times for checking emails and social media</li>
          <li><strong>Use focus modes:</strong> Turn off non-essential notifications during work or personal time</li>
          <li><strong>Practice digital detox:</strong> Take regular breaks from all devices</li>
          <li><strong>Curate your feeds:</strong> Unfollow accounts that make you feel negative</li>
          <li><strong>Create tech-free zones:</strong> Keep bedrooms and dining areas device-free</li>
        </ol>
        
        <p>Remember, technology should enhance your life, not control it. Finding the right balance is key to digital wellness.</p>
      `,
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
      image: "/gratitude-journal-happiness.png",
      content: `
        <h2>The Science of Gratitude</h2>
        <p>Gratitude is more than just saying "thank you." Research shows that regular gratitude practice can rewire your brain for positivity, improve relationships, and boost overall mental health.</p>
        
        <h2>Benefits of Gratitude Practice</h2>
        <p>Studies have shown that gratitude can:</p>
        <ul>
          <li><strong>Improve mood:</strong> Increase feelings of happiness and life satisfaction</li>
          <li><strong>Reduce stress:</strong> Lower cortisol levels and anxiety</li>
          <li><strong>Enhance relationships:</strong> Strengthen social bonds and empathy</li>
          <li><strong>Boost immune function:</strong> Improve physical health and energy levels</li>
          <li><strong>Improve sleep:</strong> Promote better rest and recovery</li>
        </ul>
        
        <h2>Simple Gratitude Practices</h2>
        <p>Try these easy ways to incorporate gratitude into your daily routine:</p>
        <ol>
          <li><strong>Gratitude journaling:</strong> Write down 3 things you're grateful for each day</li>
          <li><strong>Gratitude meditation:</strong> Spend 5 minutes focusing on appreciation</li>
          <li><strong>Thank you notes:</strong> Express appreciation to people in your life</li>
          <li><strong>Gratitude walks:</strong> Notice and appreciate your surroundings</li>
          <li><strong>Bedtime reflection:</strong> End each day by thinking of positive moments</li>
        </ol>
        
        <p>Start small and be consistent. Even a few minutes of gratitude practice daily can make a significant difference in your mental wellbeing.</p>
      `,
      tags: ["gratitude", "positive psychology", "happiness", "mindfulness"],
      featured: false,
    },
  }

  return articles[id as keyof typeof articles] || null
}

export default function ArticlePage() {

  const params = useParams<{ id: string }>();
  const [article, setArticle] = useState<any>(null)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isLiked, setIsLiked] = useState(false)

  useEffect(() => {
    if (params.id) {
      const articleData = getArticleById(params.id as string)
      setArticle(articleData)
    }
  }, [params.id])

  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Article not found</h1>
          <a href="/content">
            <Button className="bg-yellow-500 text-black hover:bg-yellow-400">Back to Library</Button>
          </a>
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
            <a href="/content">
              <Button
                variant="ghost"
                size="sm"
                className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Library
              </Button>
            </a>

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
          {/* Category Badge */}
          <Badge className="mb-4 bg-yellow-500 text-black">{article.category}</Badge>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">{article.title}</h1>

          {/* Excerpt */}
          <p className="text-xl text-slate-300 mb-6 leading-relaxed">{article.excerpt}</p>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 text-slate-400 text-sm">
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
          className="prose prose-lg prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

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
              <Badge key={tag} variant="outline" className="border-slate-600 text-slate-300 hover:border-yellow-500">
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
          <a href="/">
            <Button className="bg-yellow-500 text-black hover:bg-yellow-400">Explore Zenium</Button>
          </a>
        </motion.div>
      </article>
    </div>
  )
}
