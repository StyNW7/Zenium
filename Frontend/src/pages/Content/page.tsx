"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, ArrowLeft, Clock, User, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

// Mock data for articles
const articles = [
  {
    id: 1,
    title: "Understanding Anxiety: A Comprehensive Guide",
    excerpt:
      "Learn about the different types of anxiety disorders and effective coping strategies to manage daily stress and worry.",
    category: "Mental Health",
    author: "Dr. Sarah Johnson",
    readTime: "8 min read",
    publishedAt: "2024-01-15",
    image: "/Images/article/anxiety.png",
    featured: true,
  },
  {
    id: 2,
    title: "The Science of Mindfulness Meditation",
    excerpt:
      "Discover how mindfulness meditation affects your brain and learn practical techniques to incorporate it into your daily routine.",
    category: "Mindfulness",
    author: "Dr. Michael Chen",
    readTime: "6 min read",
    publishedAt: "2024-01-12",
    image: "/Images/article/meditation.png",
    featured: false,
  },
  {
    id: 3,
    title: "Building Emotional Resilience",
    excerpt:
      "Practical strategies to develop emotional strength and bounce back from life's challenges with greater confidence.",
    category: "Emotional Wellness",
    author: "Dr. Emily Rodriguez",
    readTime: "10 min read",
    publishedAt: "2024-01-10",
    image: "/Images/article/emotional.png",
    featured: true,
  },
  {
    id: 4,
    title: "Sleep and Mental Health Connection",
    excerpt:
      "Explore the vital relationship between quality sleep and mental wellbeing, plus tips for better sleep hygiene.",
    category: "Sleep Health",
    author: "Dr. James Wilson",
    readTime: "7 min read",
    publishedAt: "2024-01-08",
    image: "/Images/article/mental-health.png",
    featured: false,
  },
  {
    id: 5,
    title: "Managing Stress in the Digital Age",
    excerpt:
      "Learn how to maintain mental balance while navigating social media, work emails, and constant connectivity.",
    category: "Digital Wellness",
    author: "Dr. Lisa Park",
    readTime: "9 min read",
    publishedAt: "2024-01-05",
    image: "/Images/article/stress.png",
    featured: false,
  },
  {
    id: 6,
    title: "The Power of Gratitude Practice",
    excerpt: "Discover how daily gratitude exercises can transform your mindset and improve overall mental health.",
    category: "Positive Psychology",
    author: "Dr. Robert Kim",
    readTime: "5 min read",
    publishedAt: "2024-01-03",
    image: "/Images/article/gratitude.png",
    featured: false,
  },
]

const categories = [
  "All",
  "Mental Health",
  "Mindfulness",
  "Emotional Wellness",
  "Sleep Health",
  "Digital Wellness",
  "Positive Psychology",
]

export default function ContentLibrary() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [sortBy, setSortBy] = useState("newest")
  const [currentPage, setCurrentPage] = useState(1)
  const articlesPerPage = 6

  const filteredAndSortedArticles = useMemo(() => {
    const filtered = articles.filter((article) => {
      const matchesSearch =
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "All" || article.category === selectedCategory
      return matchesSearch && matchesCategory
    })

    // Sort articles
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        case "oldest":
          return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
        case "readTime":
          return Number.parseInt(a.readTime) - Number.parseInt(b.readTime)
        default:
          return 0
      }
    })

    return filtered
  }, [searchQuery, selectedCategory, sortBy])

  const totalPages = Math.ceil(filteredAndSortedArticles.length / articlesPerPage)
  const paginatedArticles = filteredAndSortedArticles.slice(
    (currentPage - 1) * articlesPerPage,
    currentPage * articlesPerPage,
  )

  return (
    <div className="min-h-screen bg-gradient-to-br bg-black">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-yellow-500/20 bg-black/50 backdrop-blur-sm sticky top-0 z-50"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a href="/">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </a>
              <div>
                <h1 className="text-2xl font-bold text-white">Mindful Content Library</h1>
                <p className="text-white text-sm">Discover articles to support your mental wellness journey</p>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 space-y-6"
        >
          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-400 focus:border-yellow-500"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={
                  selectedCategory === category
                    ? "bg-yellow-500 text-black hover:bg-yellow-400"
                    : "border-slate-600 text- hover:border-yellow-500 hover:text-yellow-400"
                }
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-4">
            <span className="text-white text-sm">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-md px-3 py-1 text-sm focus:border-yellow-500 focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="readTime">Reading Time</option>
            </select>
          </div>
        </motion.div>

        {/* Articles Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedCategory}-${searchQuery}-${sortBy}-${currentPage}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
          >
            {paginatedArticles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <a href={`/content/${article.id}`}>
                  <div className="bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700 hover:border-yellow-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/10">
                    {/* Article Image */}
                    <div className="relative overflow-hidden">
                      <img
                        src={article.image || "/placeholder.svg"}
                        alt={article.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {article.featured && (
                        <Badge className="absolute top-3 left-3 bg-yellow-500 text-black">Featured</Badge>
                      )}
                      <Badge className="absolute top-3 right-3 bg-black/70 text-yellow-400 border-yellow-500/30">
                        {article.category}
                      </Badge>
                    </div>

                    {/* Article Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-yellow-400 transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-slate-400 text-sm mb-4 line-clamp-3">{article.excerpt}</p>

                      {/* Article Meta */}
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>{article.author}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{article.readTime}</span>
                          </div>
                        </div>
                        <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </a>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* No Results */}
        {paginatedArticles.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <div className="text-slate-400 mb-4">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No articles found</h3>
              <p>Try adjusting your search terms or filters</p>
            </div>
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-2"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="border-slate-600 text-slate-300 hover:border-yellow-500 hover:text-yellow-400 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className={
                  currentPage === page
                    ? "bg-yellow-500 text-black hover:bg-yellow-400"
                    : "border-slate-600 text-slate-300 hover:border-yellow-500 hover:text-yellow-400"
                }
              >
                {page}
              </Button>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="border-slate-600 text-slate-300 hover:border-yellow-500 hover:text-yellow-400 disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
