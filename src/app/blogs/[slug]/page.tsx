"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Heart,
  Eye,
  MessageCircle,
  Share2,
  Bookmark,
  Clock,
  Calendar,
  Tag,
  ThumbsUp,
  Reply,
  Send,
  ChevronRight,
  Star,
  BookOpen,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import Link from "next/link"

// Mock data - trong thực tế sẽ fetch từ API dựa trên slug
const blogData = {
  id: "1",
  title: "IELTS Writing Task 2: How to Structure Your Essay for Band 8+",
  slug: "ielts-writing-task-2-structure-band-8",
  content: `
    <div class="prose-content">
      <p class="lead">Writing a high-scoring IELTS essay requires more than just good English skills. It demands a strategic approach to structure, content development, and time management. In this comprehensive guide, we'll explore the proven techniques that have helped thousands of students achieve Band 8+ scores in IELTS Writing Task 2.</p>
      
      <h2>Understanding the Task 2 Structure</h2>
      <p>The key to success in IELTS Writing Task 2 lies in understanding the fundamental structure that examiners expect to see. A well-structured essay typically follows this pattern:</p>
      
      <div class="structure-box">
        <h3>1. Introduction Paragraph (50-60 words)</h3>
        <p>Your introduction should accomplish three main objectives:</p>
        <ul>
          <li>Paraphrase the question to show understanding</li>
          <li>Present your thesis statement clearly</li>
          <li>Outline the main points you'll discuss</li>
        </ul>
      </div>
      
      <div class="structure-box">
        <h3>2. Body Paragraph 1 (100-120 words)</h3>
        <p>Focus on your first main argument with:</p>
        <ul>
          <li>A clear topic sentence</li>
          <li>Supporting evidence or examples</li>
          <li>Analysis and explanation</li>
          <li>A concluding sentence that links to your thesis</li>
        </ul>
      </div>
      
      <div class="structure-box">
        <h3>3. Body Paragraph 2 (100-120 words)</h3>
        <p>Present your second main argument following the same structure as the first body paragraph. Ensure this paragraph complements your first argument while adding new insights to your discussion.</p>
      </div>
      
      <div class="structure-box">
        <h3>4. Conclusion (40-50 words)</h3>
        <p>Summarize your main points and restate your position without introducing new information.</p>
      </div>
      
      <h2>Advanced Techniques for Band 8+ Writing</h2>
      
      <h3>Lexical Resource Enhancement</h3>
      <p>To achieve a high band score, you need to demonstrate sophisticated vocabulary usage. Here are some strategies:</p>
      
      <blockquote class="highlight-quote">
        "The difference between a Band 6 and Band 8 essay often lies not in the ideas presented, but in how those ideas are expressed through precise vocabulary and varied sentence structures."
      </blockquote>
      
      <h3>Coherence and Cohesion</h3>
      <p>Use a variety of linking devices to connect your ideas smoothly:</p>
      
      <div class="linking-grid">
        <div class="linking-category">
          <h4>Addition</h4>
          <p>Furthermore, Moreover, In addition</p>
        </div>
        <div class="linking-category">
          <h4>Contrast</h4>
          <p>However, Nevertheless, On the contrary</p>
        </div>
        <div class="linking-category">
          <h4>Cause and Effect</h4>
          <p>Consequently, As a result, Therefore</p>
        </div>
        <div class="linking-category">
          <h4>Examples</h4>
          <p>For instance, To illustrate, Such as</p>
        </div>
      </div>
      
      <h2>Common Mistakes to Avoid</h2>
      <p>Even advanced students make these critical errors:</p>
      
      <div class="mistake-warning">
        <h3>1. Insufficient Task Response</h3>
        <p>Always ensure you're directly addressing all parts of the question. Many students lose marks by going off-topic or not fully developing their arguments.</p>
      </div>
      
      <div class="mistake-warning">
        <h3>2. Repetitive Language</h3>
        <p>Avoid using the same words and phrases repeatedly. Demonstrate your vocabulary range by using synonyms and varied expressions.</p>
      </div>
      
      <div class="mistake-warning">
        <h3>3. Poor Time Management</h3>
        <p>Allocate your 40 minutes wisely:</p>
        <ul>
          <li><strong>5 minutes:</strong> Planning and brainstorming</li>
          <li><strong>30 minutes:</strong> Writing</li>
          <li><strong>5 minutes:</strong> Reviewing and editing</li>
        </ul>
      </div>
      
      <h2>Practice Exercises</h2>
      <p>To master these techniques, regular practice is essential. Try these exercises:</p>
      
      <div class="exercise-list">
        <div class="exercise-item">
          <h4>Structure Analysis</h4>
          <p>Read high-scoring sample essays and identify the structure elements</p>
        </div>
        <div class="exercise-item">
          <h4>Vocabulary Building</h4>
          <p>Create topic-specific word banks for common IELTS themes</p>
        </div>
        <div class="exercise-item">
          <h4>Timed Writing</h4>
          <p>Practice writing complete essays within the 40-minute time limit</p>
        </div>
        <div class="exercise-item">
          <h4>Peer Review</h4>
          <p>Exchange essays with study partners for feedback</p>
        </div>
      </div>
      
      <div class="conclusion-box">
        <h2>Conclusion</h2>
        <p>Achieving a Band 8+ score in IELTS Writing Task 2 is definitely possible with the right approach. Focus on developing a clear structure, using sophisticated vocabulary appropriately, and practicing regularly under timed conditions. Remember, consistency in applying these techniques is key to success.</p>
        
        <p><strong>Start implementing these strategies in your practice sessions today, and you'll see significant improvement in your writing scores. Good luck with your IELTS preparation!</strong></p>
      </div>
    </div>
  `,
  image: "/placeholder.svg?height=400&width=1200",
  category: "Writing",
  author: {
    name: "Sarah Johnson",
    avatar: "/placeholder.svg?height=80&width=80",
    role: "IELTS Expert & Senior Instructor",
    bio: "Sarah has been teaching IELTS for over 8 years and has helped more than 2,000 students achieve their target scores. She holds a Master's degree in Applied Linguistics and is a certified IELTS trainer.",
    experience: "8+ years",
    students: "2,000+",
    rating: 4.9,
  },
  tags: ["writing", "task2", "structure", "band8", "essay", "ielts", "preparation"],
  is_featured: true,
  like_count: 245,
  view_count: 1250,
  comment_count: 34,
  published_at: "2024-01-15",
  status: "published",
  reading_time: "8 min read",
}

const relatedPosts = [
  {
    id: "2",
    title: "IELTS Writing Task 1: Academic Report Writing Guide",
    slug: "ielts-writing-task-1-academic-guide",
    image: "/placeholder.svg?height=150&width=250",
    category: "Writing",
    reading_time: "6 min read",
    published_at: "2024-01-10",
    views: 890,
    likes: 67,
  },
  {
    id: "3",
    title: "Common Grammar Mistakes in IELTS Writing",
    slug: "common-grammar-mistakes-ielts-writing",
    image: "/placeholder.svg?height=150&width=250",
    category: "Grammar",
    reading_time: "5 min read",
    published_at: "2024-01-08",
    views: 623,
    likes: 45,
  },
  {
    id: "4",
    title: "Top 100 IELTS Vocabulary Words You Must Know",
    slug: "top-100-ielts-vocabulary-words",
    image: "/placeholder.svg?height=150&width=250",
    category: "Vocabulary",
    reading_time: "12 min read",
    published_at: "2024-01-05",
    views: 2100,
    likes: 189,
  },
  {
    id: "5",
    title: "IELTS Speaking Part 2: Cue Card Strategies",
    slug: "ielts-speaking-part-2-strategies",
    image: "/placeholder.svg?height=150&width=250",
    category: "Speaking",
    reading_time: "7 min read",
    published_at: "2024-01-03",
    views: 756,
    likes: 98,
  },
]

const comments = [
  {
    id: "1",
    author: "Alex Chen",
    avatar: "/placeholder.svg?height=40&width=40",
    content:
      "This is exactly what I needed! The structure breakdown is so clear and helpful. I've been struggling with Task 2 for months, but this guide gives me a clear roadmap to follow.",
    published_at: "2024-01-16",
    likes: 12,
    replies: [
      {
        id: "1-1",
        author: "Sarah Johnson",
        avatar: "/placeholder.svg?height=40&width=40",
        content:
          "Thank you, Alex! I'm so glad you found it helpful. Remember to practice the structure with different question types. Good luck with your preparation!",
        published_at: "2024-01-16",
        likes: 5,
        isAuthor: true,
      },
    ],
  },
  {
    id: "2",
    author: "Maria Rodriguez",
    avatar: "/placeholder.svg?height=40&width=40",
    content:
      "The time management tips are gold! I always ran out of time before, but following the 5-30-5 minute structure has improved my writing significantly.",
    published_at: "2024-01-16",
    likes: 8,
    replies: [],
  },
  {
    id: "3",
    author: "David Kim",
    avatar: "/placeholder.svg?height=40&width=40",
    content:
      "Could you provide more examples of advanced vocabulary for different topics? That would be really helpful for achieving Band 8+.",
    published_at: "2024-01-15",
    likes: 15,
    replies: [],
  },
]

export default function BlogDetailPage({ params }: { params: { slug: string } }) {
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [likeCount, setLikeCount] = useState(blogData.like_count)
  const [newComment, setNewComment] = useState("")
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1))
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: blogData.title,
          url: window.location.href,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const handleCommentSubmit = () => {
    if (newComment.trim()) {
      console.log("New comment:", newComment)
      setNewComment("")
    }
  }

  const handleReplySubmit = (commentId: string) => {
    if (replyContent.trim()) {
      console.log("Reply to:", commentId, "Content:", replyContent)
      setReplyContent("")
      setReplyTo(null)
    }
  }

  return (
    <>
      {/* Custom Styles */}
      <style jsx global>{`
        .prose-content {
          line-height: 1.8;
          color: #374151;
        }
        
        .prose-content .lead {
          font-size: 1.25rem;
          font-weight: 400;
          color: #6b7280;
          margin-bottom: 2rem;
          line-height: 1.7;
        }
        
        .prose-content h2 {
          font-size: 1.875rem;
          font-weight: 700;
          color: #111827;
          margin: 2.5rem 0 1.5rem 0;
          border-bottom: 3px solid #3b82f6;
          padding-bottom: 0.5rem;
        }
        
        .prose-content h3 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1f2937;
          margin: 2rem 0 1rem 0;
        }
        
        .prose-content h4 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #374151;
          margin: 1.5rem 0 0.75rem 0;
        }
        
        .prose-content p {
          margin-bottom: 1.5rem;
          font-size: 1.1rem;
        }
        
        .prose-content ul, .prose-content ol {
          margin: 1.5rem 0;
          padding-left: 1.5rem;
        }
        
        .prose-content li {
          margin-bottom: 0.75rem;
          font-size: 1.05rem;
        }
        
        .structure-box {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border: 1px solid #0ea5e9;
          border-radius: 12px;
          padding: 1.5rem;
          margin: 1.5rem 0;
          position: relative;
        }
        
        .structure-box::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: #0ea5e9;
          border-radius: 12px 0 0 12px;
        }
        
        .highlight-quote {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border-left: 4px solid #f59e0b;
          padding: 1.5rem;
          margin: 2rem 0;
          border-radius: 0 12px 12px 0;
          font-style: italic;
          font-size: 1.125rem;
          color: #92400e;
        }
        
        .linking-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin: 1.5rem 0;
        }
        
        .linking-category {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 1rem;
        }
        
        .linking-category h4 {
          color: #3b82f6;
          margin: 0 0 0.5rem 0;
          font-size: 1rem;
        }
        
        .linking-category p {
          margin: 0;
          font-size: 0.9rem;
          color: #64748b;
        }
        
        .mistake-warning {
          background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
          border: 1px solid #f87171;
          border-radius: 12px;
          padding: 1.5rem;
          margin: 1.5rem 0;
          position: relative;
        }
        
        .mistake-warning::before {
          content: '⚠️';
          position: absolute;
          top: 1rem;
          right: 1rem;
          font-size: 1.25rem;
        }
        
        .exercise-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
          margin: 1.5rem 0;
        }
        
        .exercise-item {
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          border: 1px solid #22c55e;
          border-radius: 12px;
          padding: 1.25rem;
        }
        
        .exercise-item h4 {
          color: #15803d;
          margin: 0 0 0.75rem 0;
          font-size: 1.1rem;
        }
        
        .exercise-item p {
          margin: 0;
          font-size: 0.95rem;
          color: #166534;
        }
        
        .conclusion-box {
          background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
          border: 2px solid #a855f7;
          border-radius: 16px;
          padding: 2rem;
          margin: 2rem 0;
          text-align: center;
        }
        
        .conclusion-box h2 {
          color: #7c3aed;
          border: none;
          margin-bottom: 1rem;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-2 text-sm text-gray-500 mb-6"
        >
          <Link href="/blogs" className="hover:text-blue-600 transition-colors">
            Blog
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900">{blogData.category}</span>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900 truncate">{blogData.title}</span>
        </motion.nav>

        {/* Back Button */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
          <Link href="/blogs">
            <Button variant="ghost" className="pl-0 hover:pl-2 transition-all group">
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Blog
            </Button>
          </Link>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Article Header */}
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8"
            >
              {/* Hero Image */}
              <div className="relative h-80 overflow-hidden">
                <Image src={blogData.image || "/placeholder.svg"} alt={blogData.title} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <Badge className="bg-blue-600 text-white mb-4 px-3 py-1">{blogData.category}</Badge>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">{blogData.title}</h1>
                  <div className="flex items-center gap-6 text-white/90 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {blogData.reading_time}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(blogData.published_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      {blogData.view_count.toLocaleString()} views
                    </div>
                  </div>
                </div>
              </div>

              {/* Article Meta & Actions */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  {/* Author Info */}
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16 ring-4 ring-blue-100">
                      <AvatarImage src={blogData.author.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-lg font-semibold">
                        {blogData.author.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{blogData.author.name}</h3>
                      <p className="text-blue-600 font-medium">{blogData.author.role}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        <span>{blogData.author.experience} experience</span>
                        <span>•</span>
                        <span>{blogData.author.students} students</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{blogData.author.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-3">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant={isLiked ? "default" : "outline"}
                        size="sm"
                        onClick={handleLike}
                        className="flex items-center gap-2"
                      >
                        <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                        {likeCount}
                      </Button>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant={isBookmarked ? "default" : "outline"}
                        size="sm"
                        onClick={() => setIsBookmarked(!isBookmarked)}
                      >
                        <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
                      </Button>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button variant="outline" size="sm" onClick={handleShare}>
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Article Body */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-8"
              >
                <div dangerouslySetInnerHTML={{ __html: blogData.content }} />

                {/* Tags */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Tag className="h-5 w-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Tags:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {blogData.tags.map((tag) => (
                      <motion.div key={tag} whileHover={{ scale: 1.05 }}>
                        <Badge variant="secondary" className="hover:bg-blue-50 cursor-pointer transition-colors">
                          {tag}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.article>

            {/* Comments Section */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <Card className="shadow-lg">
                <CardHeader>
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <MessageCircle className="h-6 w-6 text-blue-600" />
                    Comments ({comments.length})
                  </h3>
                </CardHeader>
                <CardContent>
                  {/* Add Comment */}
                  <div className="mb-8">
                    <div className="flex space-x-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-blue-100 text-blue-600">You</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Textarea
                          placeholder="Share your thoughts about this article..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="mb-3"
                          rows={3}
                        />
                        <Button onClick={handleCommentSubmit} disabled={!newComment.trim()}>
                          <Send className="h-4 w-4 mr-2" />
                          Post Comment
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Separator className="mb-6" />

                  {/* Comments List */}
                  <div className="space-y-6">
                    {comments.map((comment) => (
                      <motion.div
                        key={comment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <div className="flex space-x-4">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={comment.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="bg-gray-100">
                              {comment.author
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-gray-900">{comment.author}</h4>
                                <span className="text-xs text-gray-500">
                                  {new Date(comment.published_at).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-gray-700">{comment.content}</p>
                            </div>
                            <div className="flex items-center space-x-4 mt-2">
                              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600">
                                <ThumbsUp className="h-4 w-4 mr-1" />
                                {comment.likes}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-500 hover:text-blue-600"
                                onClick={() => setReplyTo(comment.id)}
                              >
                                <Reply className="h-4 w-4 mr-1" />
                                Reply
                              </Button>
                            </div>

                            {/* Reply Form */}
                            {replyTo === comment.id && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="mt-4 ml-4"
                              >
                                <div className="flex space-x-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">You</AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <Textarea
                                      placeholder={`Reply to ${comment.author}...`}
                                      value={replyContent}
                                      onChange={(e) => setReplyContent(e.target.value)}
                                      className="mb-2"
                                      rows={2}
                                    />
                                    <div className="flex space-x-2">
                                      <Button
                                        size="sm"
                                        onClick={() => handleReplySubmit(comment.id)}
                                        disabled={!replyContent.trim()}
                                      >
                                        Reply
                                      </Button>
                                      <Button variant="ghost" size="sm" onClick={() => setReplyTo(null)}>
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}

                            {/* Replies */}
                            {comment.replies.length > 0 && (
                              <div className="ml-4 mt-4 space-y-4">
                                {comment.replies.map((reply) => (
                                  <div key={reply.id} className="flex space-x-3">
                                    <Avatar className="h-8 w-8">
                                      <AvatarImage src={reply.avatar || "/placeholder.svg"} />
                                      <AvatarFallback className="bg-gray-100 text-xs">
                                        {reply.author
                                          .split(" ")
                                          .map((n) => n[0])
                                          .join("")}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <div className="bg-blue-50 rounded-lg p-3">
                                        <div className="flex items-center justify-between mb-1">
                                          <h5 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                            {reply.author}
                                            {reply.isAuthor && (
                                              <Badge variant="secondary" className="text-xs">
                                                Author
                                              </Badge>
                                            )}
                                          </h5>
                                          <span className="text-xs text-gray-500">
                                            {new Date(reply.published_at).toLocaleDateString()}
                                          </span>
                                        </div>
                                        <p className="text-sm text-gray-700">{reply.content}</p>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-gray-500 hover:text-blue-600 mt-1"
                                      >
                                        <ThumbsUp className="h-3 w-3 mr-1" />
                                        {reply.likes}
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.section>
          </div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-8 space-y-6">
              {/* Author Card */}
              <Card className="border border-gray-200 shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16 ring-4 ring-white/20">
                      <AvatarImage src={blogData.author.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="bg-white/20 text-white text-lg">
                        {blogData.author.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-bold text-lg">{blogData.author.name}</h3>
                      <p className="text-blue-100">{blogData.author.role}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Related Articles */}
              <Card className="border border-gray-200 shadow-lg">
                <CardHeader className="pb-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                    Related Articles
                  </h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  {relatedPosts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className="group"
                    >
                      <Link href={`/blogs/${post.slug}`}>
                        <div className="flex space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-all">
                          <div className="relative flex-shrink-0">
                            <Image
                              src={post.image || "/placeholder.svg"}
                              alt={post.title}
                              width={80}
                              height={60}
                              className="w-20 h-15 object-cover rounded-lg"
                            />
                            <Badge className="absolute -top-1 -right-1 text-xs px-1 py-0 bg-blue-600 text-white">
                              {post.category}
                            </Badge>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                              {post.title}
                            </h4>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>{post.reading_time}</span>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  <Eye className="h-3 w-3" />
                                  {post.views}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Heart className="h-3 w-3" />
                                  {post.likes}
                                </div>
                              </div>
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
    </>
  )
}
