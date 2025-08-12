"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, BookOpen, TrendingUp, Tag, Eye, MessageCircle, ArrowRight, Filter, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Image from "next/image"
import Link from "next/link"

// API imports
import { getPublicBlogCategories, getPublicPublishedBlogs } from "@/api/blog"
import { IBlog, IBlogCategory } from "@/interface/blog"

export default function BlogsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  // Fetch blog categories
  const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: () => getPublicBlogCategories(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Fetch blogs
  const { data: blogsData, isLoading: blogsLoading, error: blogsError } = useQuery({
    queryKey: ['published-blogs', currentPage],
    queryFn: () => getPublicPublishedBlogs({ 
      page: currentPage, 
      limit: 12
    }),
    staleTime: 1 * 60 * 1000, // 1 minute
  })

  const categories = Array.isArray(categoriesData?.result) ? categoriesData.result : []
  const blogs = Array.isArray(blogsData?.result) ? blogsData.result : []
  const meta = blogsData?.meta

  // Calculate blog counts for each category
  const categoriesWithCounts = categories.map((category: IBlogCategory) => ({
    ...category,
    count: blogs.filter((blog: IBlog) => blog.category_id === category.id).length
  }))

  const featuredBlogs = blogs.filter((blog: IBlog) => blog.is_featured) || []
  const regularBlogs = blogs.filter((blog: IBlog) => !blog.is_featured) || []

  const filteredBlogs = selectedCategory === "all" 
    ? regularBlogs 
    : regularBlogs.filter((blog: IBlog) => {
        return blog.category_id === selectedCategory;
      })

  // Loading state
  if (categoriesLoading || blogsLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading blogs...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (categoriesError || blogsError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading blogs. Please try again.</p>
            <Button onClick={() => window.location.reload()}>Reload Page</Button>
          </div>
        </div>
      </div>
    )
  }

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

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Featured Posts Section */}
      {featuredBlogs.length > 0 && (
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
            {Array.isArray(featuredBlogs) && featuredBlogs.map((blog: IBlog) => (
              <motion.div
                key={blog.id}
                variants={itemVariants}
                whileHover={{ y: -8 }}
                onHoverStart={() => setHoveredCard(blog.id)}
                onHoverEnd={() => setHoveredCard(null)}
                className="group cursor-pointer"
              >
                <Link href={`/blogs/${blog.id}`}>
                  <Card className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-white">
                    <div className="relative overflow-hidden">
                      <motion.div animate={{ scale: hoveredCard === blog.id ? 1.1 : 1 }} transition={{ duration: 0.6 }}>
                        <Image
                          src={blog.image || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNmM2Y0ZjYiLz4KICA8cmVjdCB4PSIxNTAiIHk9IjEwMCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHJ4PSI4IiBmaWxsPSIjZTVlN2ViIi8+CiAgPHBhdGggZD0iTTE3NSAxMjUgTDE3NSAxMzUgTDE4NSAxMzUgTDE4NSAxMjUgWiBNMTc1IDE0MCBMMTU1IDE1MCBMMTQ1IDE1MCBMMDU1IDE0MCBaIE0xOTAgMTI1IEwxOTAgMTM1IEwyMDAgMTM1IEwyMDAgMTI1IFogTTE5MCAxNDAgTDE5MCAxNTAgTDIwMCAxNTAgTDIwMCAxNDAgWiIgZmlsbD0iIzljYTNhZiIvPgogIDxjaXJjbGUgY3g9IjE4MCIgY3k9IjEzMCIgcj0iMyIgZmlsbD0iIzljYTNhZiIvPgogIDxjaXJjbGUgY3g9IjE5NSIgY3k9IjEzMCIgcj0iMyIgZmlsbD0iIzljYTNhZiIvPgogIDx0ZXh0IHg9IjIwMCIgeT0iMTU1IiBmaWxsPSIjNmI3MjgwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4="}
                          alt={blog.title}
                          width={500}
                          height={300}
                          className="w-full h-64 object-cover"
                        />
                      </motion.div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <Badge className="absolute top-4 left-4 bg-blue-600 hover:bg-blue-700 text-white font-medium">
                        {categoriesWithCounts.find(cat => cat.id === blog.category_id)?.name || blog.category || "Uncategorized"}
                      </Badge>
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center gap-4 text-white text-sm">
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {blog.view_count || 0}
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            {blog.like_count || 0}
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4" />
                            {blog.comment_count || 0}
                          </div>
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary" className="text-xs">
                          {blog.reading_time || "5 min read"}
                        </Badge>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500">
                          {new Date(blog.published_at || new Date()).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {blog.title}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {blog.content?.replace(/<[^>]*>/g, '').substring(0, 200) || 'No content available'}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10 ring-2 ring-blue-100">
                            <AvatarImage src={blog.users?.avatar || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iI2Y5ZmFmYiIvPgogIDxjaXJjbGUgY3g9IjIwIiBjeT0iMTUiIHI9IjUiIGZpbGw9IiM5Y2EzYWYiLz4KICA8cGF0aCBkPSJNMTAgMzBjMC01LjUgNC41LTEwIDEwLTEwczEwIDQuNSAxMCAxMCIgZmlsbD0iIzljYTNhZiIvPgo8L3N2Zz4="} />
                            <AvatarFallback className="bg-blue-100 text-blue-600">
                              {blog.users?.full_name
                                ?.split(" ")
                                .map((n: string) => n[0])
                                .join("") || "AU"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{blog.users?.full_name || "Unknown Author"}</p>
                            <p className="text-xs text-gray-500">{blog.users?.role || "Writer"}</p>
                          </div>
                        </div>
                        <Button size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          Read More
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-4">
                        {blog.tags?.slice(0, 3).map((tag: string) => (
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
      )}

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
              {Array.isArray(categoriesWithCounts) && categoriesWithCounts.map((category: IBlogCategory) => (
                <motion.div key={category.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category.id)}
                    className="rounded-full"
                  >
                    <div className={`w-2 h-2 rounded-full ${category.color || 'bg-blue-500'} mr-2`} />
                    {category.name}
                    <Badge variant="secondary" className="ml-2">
                      {category.count || 0}
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
              {Array.isArray(filteredBlogs) && filteredBlogs.map((blog: IBlog) => (
                <motion.div
                  key={blog.id}
                  variants={itemVariants}
                  layout
                  whileHover={{ y: -4 }}
                  onHoverStart={() => setHoveredCard(blog.id)}
                  onHoverEnd={() => setHoveredCard(null)}
                  className="group cursor-pointer"
                >
                  <Link href={`/blogs/${blog.id}`}>
                    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 bg-white">
                      <div className="relative overflow-hidden">
                        <motion.div
                          animate={{ scale: hoveredCard === blog.id ? 1.05 : 1 }}
                          transition={{ duration: 0.4 }}
                        >
                          <Image
                            src={blog.image || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDQwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmM2Y0ZjYiLz4KICA8cmVjdCB4PSIxNTAiIHk9IjUwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgcng9IjgiIGZpbGw9IiNlNWU3ZWIiLz4KICA8Y2lyY2xlIGN4PSIxODAiIGN5PSI4MCIgcj0iMyIgZmlsbD0iIzljYTNhZiIvPgogIDxjaXJjbGUgY3g9IjE5NSIgY3k9IjgwIiByPSIzIiBmaWxsPSIjOWNhM2FmIi8+CiAgPHRleHQgeD0iMjAwIiB5PSIxMjAiIGZpbGw9IiM2YjcyODAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Tm8gSW1hZ2U8L3RleHQ+Cjwvc3ZnPg=="}
                            alt={blog.title}
                            width={400}
                            height={200}
                            className="w-full h-48 object-cover"
                          />
                        </motion.div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Badge className="absolute top-3 left-3 bg-white/90 text-gray-900 hover:bg-white">
                          {categoriesWithCounts.find(cat => cat.id === blog.category_id)?.name || blog.category || "Uncategorized"}
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
                            {blog.reading_time || "5 min read"}
                          </Badge>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">
                            {new Date(blog.published_at || new Date()).toLocaleDateString()}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {blog.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {blog.content?.replace(/<[^>]*>/g, '').substring(0, 150) || 'No content available'}
                        </p>

                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-7 w-7">
                              <AvatarImage src={blog.users?.avatar || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iI2Y5ZmFmYiIvPgogIDxjaXJjbGUgY3g9IjIwIiBjeT0iMTUiIHI9IjUiIGZpbGw9IiM5Y2EzYWYiLz4KICA8cGF0aCBkPSJNMTAgMzBjMC01LjUgNC41LTEwIDEwLTEwczEwIDQuNSAxMCAxMCIgZmlsbD0iIzljYTNhZiIvPgo8L3N2Zz4="} />
                              <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                                {blog.users?.full_name
                                  ?.split(" ")
                                  .map((n: string) => n[0])
                                  .join("") || "AU"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <span className="text-xs font-medium text-gray-700">{blog.users?.full_name || "Unknown Author"}</span>
                              <p className="text-xs text-gray-500">{blog.users?.role || "Writer"}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {blog.view_count || 0}
                            </div>
                            <div className="flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              {blog.like_count || 0}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-1">
                            {blog.tags?.slice(0, 2).map((tag: string) => (
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
          {meta && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center mt-12"
            >
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="rounded-full bg-transparent"
                >
                  Previous
                </Button>
                {meta?.pages && Array.from({ length: meta.pages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => handlePageChange(page)}
                    className="rounded-full"
                  >
                    {page}
                  </Button>
                ))}
                <Button 
                  variant="outline" 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === (meta?.pages || 1)}
                  className="rounded-full bg-transparent"
                >
                  Next
                </Button>
              </div>
            </motion.div>
          )}
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
                {Array.isArray(categoriesWithCounts) && categoriesWithCounts.map((category: IBlogCategory) => (
                  <motion.div
                    key={category.id}
                    whileHover={{ x: 4 }}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-blue-50 cursor-pointer transition-all group"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${category.color || 'bg-blue-500'}`} />
                      <span className="text-sm text-gray-700 group-hover:text-blue-600 font-medium">
                        {category.name}
                      </span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {category.count || 0}
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
                {Array.isArray(blogs) && blogs.slice(0, 3).map((blog: IBlog, index: number) => (
                  <motion.div
                    key={blog.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="flex space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-all group"
                  >
                    <Link href={`/blogs/${blog.id}`} className="flex space-x-3 w-full">
                      <div className="relative">
                        <Image
                          src={blog.image || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNmOWZhZmIiLz4KICA8cmVjdCB4PSIxNTAiIHk9IjEwMCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNlNWU3ZWIiLz4KICA8Y2lyY2xlIGN4PSIxNzAiIGN5PSIxMzAiIHI9IjEwIiBmaWxsPSIjOWNhM2FmIi8+CiAgPHBhdGggZD0ibTE1MCAyMDBsNTAtNTAgNTAgNTB6IiBmaWxsPSIjOWNhM2FmIi8+CiAgPHRleHQgeD0iMjAwIiB5PSIyNDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2Yjc0ODEiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiI+Tm8gSW1hZ2U8L3RleHQ+Cjwvc3ZnPg=="}
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
                            {blog.like_count || 0}
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {blog.view_count || 0}
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
