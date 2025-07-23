"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, BookOpen, TrendingUp, Tag, Eye, MessageCircle, ArrowRight, Filter, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Image from "next/image"
import Link from "next/link"

const categories = [
  {
    id: "1",
    name: "Writing",
    slug: "writing",
    description: "IELTS Writing tips and strategies",
    count: 24,
    color: "bg-blue-500",
  },
  {
    id: "2",
    name: "Speaking",
    slug: "speaking",
    description: "Speaking practice and techniques",
    count: 18,
    color: "bg-green-500",
  },
  {
    id: "3",
    name: "Reading",
    slug: "reading",
    description: "Reading comprehension skills",
    count: 32,
    color: "bg-purple-500",
  },
  {
    id: "4",
    name: "Listening",
    slug: "listening",
    description: "Listening practice materials",
    count: 21,
    color: "bg-orange-500",
  },
  {
    id: "5",
    name: "Vocabulary",
    slug: "vocabulary",
    description: "Essential IELTS vocabulary",
    count: 45,
    color: "bg-pink-500",
  },
  {
    id: "6",
    name: "Grammar",
    slug: "grammar",
    description: "Grammar rules and exercises",
    count: 28,
    color: "bg-indigo-500",
  },
]

const blogs = [
  {
    id: "1",
    title: "IELTS Writing Task 2: How to Structure Your Essay for Band 8+",
    slug: "ielts-writing-task-2-structure-band-8",
    content:
      "Master the art of essay writing with proven strategies that have helped thousands of students achieve their target band scores. Learn the essential structure, advanced vocabulary, and time management techniques...",
    image: "/placeholder.svg?height=300&width=500",
    category: "Writing",
    author: { name: "Sarah Johnson", avatar: "/placeholder.svg?height=40&width=40", role: "IELTS Expert" },
    tags: ["writing", "task2", "structure", "band8", "essay"],
    is_featured: true,
    like_count: 245,
    view_count: 1250,
    comment_count: 34,
    published_at: "2024-01-15",
    status: "published",
    reading_time: "8 min read",
  },
  {
    id: "2",
    title: "Top 100 IELTS Vocabulary Words You Must Know",
    slug: "top-100-ielts-vocabulary-words",
    content:
      "Boost your IELTS score across all sections with these essential vocabulary words. Each word comes with examples, synonyms, and practical usage in IELTS contexts...",
    image: "/placeholder.svg?height=300&width=500",
    category: "Vocabulary",
    author: { name: "Michael Chen", avatar: "/placeholder.svg?height=40&width=40", role: "Vocabulary Specialist" },
    tags: ["vocabulary", "wordlist", "essential", "academic"],
    is_featured: true,
    like_count: 189,
    view_count: 2100,
    comment_count: 67,
    published_at: "2024-01-12",
    status: "published",
    reading_time: "12 min read",
  },
  {
    id: "3",
    title: "IELTS Speaking Part 2: Cue Card Strategies That Work",
    slug: "ielts-speaking-part-2-cue-card-strategies",
    content:
      "Effective strategies to tackle any cue card topic with confidence and fluency. Learn how to structure your response, use advanced vocabulary, and manage your time effectively...",
    image: "/placeholder.svg?height=300&width=500",
    category: "Speaking",
    author: { name: "Emma Wilson", avatar: "/placeholder.svg?height=40&width=40", role: "Speaking Coach" },
    tags: ["speaking", "cuecard", "part2", "strategies", "fluency"],
    is_featured: false,
    like_count: 156,
    view_count: 890,
    comment_count: 23,
    published_at: "2024-01-10",
    status: "published",
    reading_time: "6 min read",
  },
  {
    id: "4",
    title: "Reading Comprehension: Skimming and Scanning Techniques",
    slug: "reading-comprehension-skimming-scanning-techniques",
    content:
      "Master the art of quickly finding information in IELTS Reading passages. Learn proven techniques that will help you save time and improve accuracy...",
    image: "/placeholder.svg?height=300&width=500",
    category: "Reading",
    author: { name: "David Brown", avatar: "/placeholder.svg?height=40&width=40", role: "Reading Specialist" },
    tags: ["reading", "skimming", "scanning", "techniques", "speed"],
    is_featured: false,
    like_count: 134,
    view_count: 756,
    comment_count: 19,
    published_at: "2024-01-08",
    status: "published",
    reading_time: "7 min read",
  },
  {
    id: "5",
    title: "Common Grammar Mistakes in IELTS Writing",
    slug: "common-grammar-mistakes-ielts-writing",
    content:
      "Avoid these frequent grammar errors that can lower your IELTS Writing score. Learn how to identify and correct common mistakes with practical examples...",
    image: "/placeholder.svg?height=300&width=500",
    category: "Grammar",
    author: { name: "Lisa Anderson", avatar: "/placeholder.svg?height=40&width=40", role: "Grammar Expert" },
    tags: ["grammar", "mistakes", "writing", "correction", "accuracy"],
    is_featured: false,
    like_count: 98,
    view_count: 623,
    comment_count: 15,
    published_at: "2024-01-05",
    status: "published",
    reading_time: "5 min read",
  },
  {
    id: "6",
    title: "IELTS Listening: Note-Taking Strategies for Success",
    slug: "ielts-listening-note-taking-strategies",
    content:
      "Effective note-taking methods to improve your IELTS Listening performance. Learn symbols, abbreviations, and organizational techniques that work...",
    image: "/placeholder.svg?height=300&width=500",
    category: "Listening",
    author: { name: "James Taylor", avatar: "/placeholder.svg?height=40&width=40", role: "Listening Coach" },
    tags: ["listening", "notetaking", "strategies", "symbols"],
    is_featured: false,
    like_count: 87,
    view_count: 445,
    comment_count: 12,
    published_at: "2024-01-03",
    status: "published",
    reading_time: "9 min read",
  },
]

export default function BlogsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  const featuredBlogs = blogs.filter((blog) => blog.is_featured)
  const regularBlogs = blogs.filter((blog) => !blog.is_featured)

  const filteredBlogs = regularBlogs.filter((blog) => {
    const matchesCategory = selectedCategory === "all" || blog.category === selectedCategory
    return matchesCategory
  })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Featured Posts Section */}
      <motion.section variants={containerVariants} initial="hidden" animate="visible" className="mb-16">
        <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Featured Articles</h2>
              <p className="text-gray-600">Hand-picked content from our expert team</p>
            </div>
          </div>
          <Button variant="outline" className="hidden md:flex items-center gap-2 bg-transparent">
            View All <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {featuredBlogs.map((blog, index) => (
            <motion.div
              key={blog.id}
              variants={itemVariants}
              whileHover={{ y: -8 }}
              onHoverStart={() => setHoveredCard(blog.id)}
              onHoverEnd={() => setHoveredCard(null)}
              className="group cursor-pointer"
            >
              <Link href={`/blogs/${blog.slug}`}>
                <Card className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-white">
                  <div className="relative overflow-hidden">
                    <motion.div animate={{ scale: hoveredCard === blog.id ? 1.1 : 1 }} transition={{ duration: 0.6 }}>
                      <Image
                        src={blog.image || "/placeholder.svg"}
                        alt={blog.title}
                        width={500}
                        height={300}
                        className="w-full h-64 object-cover"
                      />
                    </motion.div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <Badge className="absolute top-4 left-4 bg-blue-600 hover:bg-blue-700 text-white font-medium">
                      {blog.category}
                    </Badge>
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center gap-4 text-white text-sm">
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {blog.view_count}
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          {blog.like_count}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          {blog.comment_count}
                        </div>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary" className="text-xs">
                        {blog.reading_time}
                      </Badge>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-500">{new Date(blog.published_at).toLocaleDateString()}</span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {blog.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">{blog.content}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10 ring-2 ring-blue-100">
                          <AvatarImage src={blog.author.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {blog.author.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{blog.author.name}</p>
                          <p className="text-xs text-gray-500">{blog.author.role}</p>
                        </div>
                      </div>
                      <Button size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        Read More
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                      {blog.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs hover:bg-blue-50">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Browse by Category</h3>
              <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </div>

            <div className="flex flex-wrap gap-3">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  onClick={() => setSelectedCategory("all")}
                  className="rounded-full"
                >
                  All Articles
                  <Badge variant="secondary" className="ml-2">
                    {blogs.length}
                  </Badge>
                </Button>
              </motion.div>
              {categories.map((category) => (
                <motion.div key={category.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant={selectedCategory === category.name ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category.name)}
                    className="rounded-full"
                  >
                    <div className={`w-2 h-2 rounded-full ${category.color} mr-2`} />
                    {category.name}
                    <Badge variant="secondary" className="ml-2">
                      {category.count}
                    </Badge>
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Blog Grid */}
          <AnimatePresence>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid md:grid-cols-2 gap-6"
            >
              {filteredBlogs.map((blog, index) => (
                <motion.div
                  key={blog.id}
                  variants={itemVariants}
                  layout
                  whileHover={{ y: -4 }}
                  onHoverStart={() => setHoveredCard(blog.id)}
                  onHoverEnd={() => setHoveredCard(null)}
                  className="group cursor-pointer"
                >
                  <Link href={`/blogs/${blog.slug}`}>
                    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 bg-white">
                      <div className="relative overflow-hidden">
                        <motion.div
                          animate={{ scale: hoveredCard === blog.id ? 1.05 : 1 }}
                          transition={{ duration: 0.4 }}
                        >
                          <Image
                            src={blog.image || "/placeholder.svg"}
                            alt={blog.title}
                            width={400}
                            height={200}
                            className="w-full h-48 object-cover"
                          />
                        </motion.div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Badge className="absolute top-3 left-3 bg-white/90 text-gray-900 hover:bg-white">
                          {blog.category}
                        </Badge>
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                            <Heart className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <CardContent className="p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="outline" className="text-xs">
                            {blog.reading_time}
                          </Badge>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">
                            {new Date(blog.published_at).toLocaleDateString()}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {blog.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{blog.content}</p>

                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-7 w-7">
                              <AvatarImage src={blog.author.avatar || "/placeholder.svg"} />
                              <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                                {blog.author.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <span className="text-xs font-medium text-gray-700">{blog.author.name}</span>
                              <p className="text-xs text-gray-500">{blog.author.role}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {blog.view_count}
                            </div>
                            <div className="flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              {blog.like_count}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-1">
                            {blog.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 hover:text-blue-700"
                          >
                            Read More <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Pagination */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center mt-12"
          >
            <div className="flex space-x-2">
              <Button variant="outline" disabled className="rounded-full bg-transparent">
                Previous
              </Button>
              <Button variant="default" className="rounded-full">
                1
              </Button>
              <Button variant="outline" className="rounded-full bg-transparent">
                2
              </Button>
              <Button variant="outline" className="rounded-full bg-transparent">
                3
              </Button>
              <Button variant="outline" className="rounded-full bg-transparent">
                Next
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="lg:col-span-1"
        >
          <div className="sticky top-8 space-y-6">
            {/* Categories */}
            <Card className="border border-gray-200 shadow-lg">
              <CardHeader className="pb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                  Categories
                </h3>
              </CardHeader>
              <CardContent className="space-y-2">
                {categories.map((category) => (
                  <motion.div
                    key={category.id}
                    whileHover={{ x: 4 }}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-blue-50 cursor-pointer transition-all group"
                    onClick={() => setSelectedCategory(category.name)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${category.color}`} />
                      <span className="text-sm text-gray-700 group-hover:text-blue-600 font-medium">
                        {category.name}
                      </span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {category.count}
                    </Badge>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Popular Posts */}
            <Card className="border border-gray-200 shadow-lg">
              <CardHeader className="pb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <Star className="h-5 w-5 mr-2 text-blue-600" />
                  Popular Posts
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                {blogs.slice(0, 3).map((blog, index) => (
                  <motion.div
                    key={blog.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="flex space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-all group"
                  >
                    <Link href={`/blogs/${blog.slug}`} className="flex space-x-3 w-full">
                      <div className="relative">
                        <Image
                          src={blog.image || "/placeholder.svg"}
                          alt={blog.title}
                          width={60}
                          height={60}
                          className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="absolute inset-0 bg-black/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
                          {blog.title}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {blog.like_count}
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {blog.view_count}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
