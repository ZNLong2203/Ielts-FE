"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { 
  Heart, 
  Bookmark, 
  Share2, 
  Calendar, 
  Clock, 
  Eye, 
  MessageCircle,
  User,
  Star,
  ArrowLeft,
  Tag,
  ThumbsUp,
  Reply,
  Send,
  ChevronRight,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPublicBlogBySlug, getPublicPublishedBlogs } from "@/api/blog";
import { getBlogComments, createBlogComment, createReplyInComment } from "@/api/blogComment";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";

interface BlogDetailPageProps {
  params: { slug: string };
}

export default function BlogDetailPage({ params }: BlogDetailPageProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const queryClient = useQueryClient();

  // Fetch blog detail
  const { data: blogData, isLoading: isBlogLoading, error: blogError } = useQuery({
    queryKey: ["blog", params.slug],
    queryFn: () => getPublicBlogBySlug(params.slug),
    retry: 1,
  });

  // Fetch blog comments
  const { data: comments = [], isLoading: isCommentsLoading } = useQuery({
    queryKey: ["blog-comments", params.slug],
    queryFn: () => getBlogComments(params.slug),
    enabled: !!blogData,
    retry: 1,
  });

  // Fetch related blogs
  const { data: relatedBlogs = [], isLoading: isRelatedLoading } = useQuery({
    queryKey: ["related-blogs"],
    queryFn: () => getPublicPublishedBlogs({ page: 1, limit: 4 }),
    retry: 1,
  });

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: (content: string) => createBlogComment(params.slug, { content }),
    onSuccess: () => {
      toast.success("Comment added successfully!");
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ["blog-comments", params.slug] });
    },
    onError: () => {
      toast.error("Failed to add comment. Please try again.");
    },
  });

  // Create reply mutation
  const createReplyMutation = useMutation({
    mutationFn: ({ commentId, content }: { commentId: string; content: string }) =>
      createReplyInComment(params.slug, commentId, { content }),
    onSuccess: () => {
      toast.success("Reply added successfully!");
      setReplyContent("");
      setReplyTo(null);
      queryClient.invalidateQueries({ queryKey: ["blog-comments", params.slug] });
    },
    onError: () => {
      toast.error("Failed to add reply. Please try again.");
    },
  });

  const handleLike = () => {
    setIsLiked(!isLiked);
    // TODO: Call like API
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // TODO: Call bookmark API
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: blogData?.title || "IELTS Blog",
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleCommentSubmit = () => {
    if (newComment.trim()) {
      createCommentMutation.mutate(newComment);
    }
  };

  const handleReplySubmit = (commentId: string) => {
    if (replyContent.trim()) {
      createReplyMutation.mutate({ commentId, content: replyContent });
    }
  };

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  if (isBlogLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (blogError || !blogData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="text-center py-12">
          <CardContent>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Blog not found</h2>
            <p className="text-gray-600 mb-6">Sorry, the blog post you're looking for doesn't exist.</p>
            <Button asChild>
              <Link href="/blogs">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blogs
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      {/* Custom Styles */}
      <style jsx global>{`
        .prose-content {
          max-width: none;
          color: #374151;
          line-height: 1.7;
        }
        
        .prose-content h1,
        .prose-content h2,
        .prose-content h3,
        .prose-content h4,
        .prose-content h5,
        .prose-content h6 {
          color: #1f2937;
          font-weight: 600;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }
        
        .prose-content h2 {
          font-size: 1.875rem;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 0.5rem;
        }
        
        .prose-content h3 {
          font-size: 1.5rem;
        }
        
        .prose-content h4 {
          font-size: 1.25rem;
        }
        
        .prose-content p {
          margin-bottom: 1.5rem;
        }
        
        .prose-content .lead {
          font-size: 1.25rem;
          font-weight: 400;
          color: #6b7280;
          margin-bottom: 2rem;
          line-height: 1.6;
        }
        
        .prose-content ul,
        .prose-content ol {
          margin: 1.5rem 0;
          padding-left: 1.5rem;
        }
        
        .prose-content li {
          margin-bottom: 0.5rem;
        }
        
        .prose-content blockquote {
          border-left: 4px solid #3b82f6;
          background: #f8fafc;
          padding: 1.5rem;
          margin: 2rem 0;
          font-style: italic;
          color: #475569;
        }
        
        .prose-content .structure-box,
        .prose-content .mistake-warning,
        .prose-content .exercise-item,
        .prose-content .conclusion-box {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          padding: 1.5rem;
          margin: 1.5rem 0;
        }
        
        .prose-content .structure-box h3,
        .prose-content .mistake-warning h3 {
          color: #1e40af;
          margin-top: 0;
        }
        
        .prose-content .linking-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin: 1.5rem 0;
        }
        
        .prose-content .linking-category {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          padding: 1rem;
        }
        
        .prose-content .linking-category h4 {
          color: #059669;
          margin-bottom: 0.5rem;
          margin-top: 0;
        }
        
        .prose-content .exercise-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
          margin: 1.5rem 0;
        }
        
        .prose-content .exercise-item h4 {
          color: #7c3aed;
          margin-top: 0;
          margin-bottom: 0.5rem;
        }
        
        .prose-content strong {
          font-weight: 600;
          color: #1f2937;
        }
        
        .prose-content code {
          background: #f3f4f6;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
        }
        
        .prose-content a {
          color: #3b82f6;
          text-decoration: underline;
        }
        
        .prose-content a:hover {
          color: #1d4ed8;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button variant="ghost" asChild className="text-gray-600 hover:text-gray-800">
            <Link href="/blogs">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blogs
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-lg shadow-sm border overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b">
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {blogData.category?.name || "Blog"}
                  </Badge>
                  {blogData.is_featured && (
                    <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>

                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                  {blogData.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(blogData.created_at)}</span>
                  </div>
                  {blogData.reading_time && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{blogData.reading_time}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{blogData.view_count || 0} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>{comments.length} comments</span>
                  </div>
                </div>

                {/* Author Info */}
                {blogData.users && (
                  <div className="flex items-center gap-3 mb-6">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={blogData.users.avatar || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iI2Y5ZmFmYiIvPgogIDxjaXJjbGUgY3g9IjIwIiBjeT0iMTUiIHI9IjUiIGZpbGw9IiM5Y2EzYWYiLz4KICA8cGF0aCBkPSJNMTAgMzBjMC01LjUgNC41LTEwIDEwLTEwczEwIDQuNSAxMCAxMCIgZmlsbD0iIzljYTNhZiIvPgo8L3N2Zz4="}
                        alt={blogData.users.full_name}
                      />
                      <AvatarFallback>
                        {blogData.users.full_name?.split(" ").map((n: string) => n[0]).join("") || "AU"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900">{blogData.users.full_name}</p>
                      <p className="text-sm text-gray-600">{blogData.users.role || "Author"}</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLike}
                    className={`${isLiked ? "text-red-600 border-red-600" : ""}`}
                  >
                    <Heart className={`h-4 w-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
                    {blogData.like_count || 0}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBookmark}
                    className={`${isBookmarked ? "text-blue-600 border-blue-600" : ""}`}
                  >
                    <Bookmark className={`h-4 w-4 mr-2 ${isBookmarked ? "fill-current" : ""}`} />
                    Save
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>

              {/* Featured Image */}
              {blogData.image && (
                <div className="relative h-64 lg:h-80">
                  <Image
                    src={blogData.image || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNmOWZhZmIiLz4KICA8cmVjdCB4PSIxNTAiIHk9IjEwMCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNlNWU3ZWIiLz4KICA8Y2lyY2xlIGN4PSIxNzAiIGN5PSIxMzAiIHI9IjEwIiBmaWxsPSIjOWNhM2FmIi8+CiAgPHBhdGggZD0ibTE1MCAyMDBsNTAtNTAgNTAgNTB6IiBmaWxsPSIjOWNhM2FmIi8+CiAgPHRleHQgeD0iMjAwIiB5PSIyNDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2Yjc0ODEiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiI+Tm8gSW1hZ2U8L3RleHQ+Cjwvc3ZnPg=="}
                    alt={blogData.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Content */}
              <div className="p-6">
                <div 
                  className="prose-content"
                  dangerouslySetInnerHTML={{ __html: blogData.content }} 
                />
              </div>

              {/* Tags */}
              {blogData.tags && blogData.tags.length > 0 && (
                <div className="p-6 border-t">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-600">Tags:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {blogData.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </motion.article>

            {/* Comments Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-8 bg-white rounded-lg shadow-sm border p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Comments ({comments.length})
              </h3>

              {/* Add Comment */}
              <div className="mb-8">
                <Textarea
                  placeholder="Share your thoughts about this blog post..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="mb-3"
                  rows={3}
                />
                <Button 
                  onClick={handleCommentSubmit}
                  disabled={!newComment.trim() || createCommentMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {createCommentMutation.isPending ? "Posting..." : "Post Comment"}
                </Button>
              </div>

              {/* Comments List */}
              {isCommentsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex gap-3">
                        <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : comments.length > 0 ? (
                <div className="space-y-6">
                  {comments.map((comment: any) => (
                    <div key={comment.id} className="border-b border-gray-100 pb-6 last:border-b-0">
                      <div className="flex gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage 
                            src={comment.author?.avatar || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iI2Y5ZmFmYiIvPgogIDxjaXJjbGUgY3g9IjIwIiBjeT0iMTUiIHI9IjUiIGZpbGw9IiM5Y2EzYWYiLz4KICA8cGF0aCBkPSJNMTAgMzBjMC01LjUgNC41LTEwIDEwLTEwczEwIDQuNSAxMCAxMCIgZmlsbD0iIzljYTNhZiIvPgo8L3N2Zz4="} 
                            alt={comment.author?.name || "User"}
                          />
                          <AvatarFallback>
                            {comment.author?.name?.split(" ").map((n: string) => n[0]).join("") || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-gray-900">
                              {comment.author?.name || "Anonymous"}
                            </span>
                            <span className="text-sm text-gray-500">
                              {formatDate(comment.created_at)}
                            </span>
                          </div>
                          <p className="text-gray-700 mb-3">{comment.content}</p>
                          <div className="flex items-center gap-3 text-sm">
                            <Button variant="ghost" size="sm" className="h-auto p-0">
                              <ThumbsUp className="h-3 w-3 mr-1" />
                              {comment.like_count || 0}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-auto p-0"
                              onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                            >
                              <Reply className="h-3 w-3 mr-1" />
                              Reply
                            </Button>
                          </div>

                          {/* Reply Form */}
                          {replyTo === comment.id && (
                            <div className="mt-4">
                              <Textarea
                                placeholder="Write a reply..."
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                className="mb-3"
                                rows={2}
                              />
                              <div className="flex gap-2">
                                <Button 
                                  size="sm"
                                  onClick={() => handleReplySubmit(comment.id)}
                                  disabled={!replyContent.trim() || createReplyMutation.isPending}
                                >
                                  {createReplyMutation.isPending ? "Posting..." : "Reply"}
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setReplyTo(null)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* Replies */}
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="mt-4 ml-6 space-y-4">
                              {comment.replies.map((reply: any) => (
                                <div key={reply.id} className="flex gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage 
                                      src={reply.author?.avatar || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iI2Y5ZmFmYiIvPgogIDxjaXJjbGUgY3g9IjIwIiBjeT0iMTUiIHI9IjUiIGZpbGw9IiM5Y2EzYWYiLz4KICA8cGF0aCBkPSJNMTAgMzBjMC01LjUgNC41LTEwIDEwLTEwczEwIDQuNSAxMCAxMCIgZmlsbD0iIzljYTNhZiIvPgo8L3N2Zz4="} 
                                      alt={reply.author?.name || "User"}
                                    />
                                    <AvatarFallback>
                                      {reply.author?.name?.split(" ").map((n: string) => n[0]).join("") || "U"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-medium text-gray-900 text-sm">
                                        {reply.author?.name || "Anonymous"}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        {formatDate(reply.created_at)}
                                      </span>
                                    </div>
                                    <p className="text-gray-700 text-sm">{reply.content}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No comments yet. Be the first to share your thoughts!</p>
                </div>
              )}
            </motion.section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Author Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    About the Author
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {blogData.users ? (
                    <>
                      <div className="flex items-center gap-3 mb-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage 
                            src={blogData.users.avatar || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iI2Y5ZmFmYiIvPgogIDxjaXJjbGUgY3g9IjIwIiBjeT0iMTUiIHI9IjUiIGZpbGw9IiM5Y2EzYWYiLz4KICA8cGF0aCBkPSJNMTAgMzBjMC01LjUgNC41LTEwIDEwLTEwczEwIDQuNSAxMCAxMCIgZmlsbD0iIzljYTNhZiIvPgo8L3N2Zz4="} 
                            alt={blogData.users.full_name}
                          />
                          <AvatarFallback>
                            {blogData.users.full_name?.split(" ").map((n: string) => n[0]).join("") || "AU"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-gray-900">{blogData.users.full_name}</p>
                          <p className="text-sm text-gray-600">{blogData.users.role || "Author"}</p>
                        </div>
                      </div>
                      {/* {blogData.users.bio && (
                        <p className="text-sm text-gray-700 mb-4">{blogData.users.bio}</p>
                      )} */}
                      {/* Uncomment these if your API returns experience/students data */}
                      {/* <div className="grid grid-cols-2 gap-4 text-center">
                        {blogData.users.experience && (
                          <div>
                            <p className="text-xl font-bold text-blue-600">{blogData.users.experience}</p>
                            <p className="text-xs text-gray-600">Experience</p>
                          </div>
                        )}
                        {blogData.users.students && (
                          <div>
                            <p className="text-xl font-bold text-green-600">{blogData.users.students}</p>
                            <p className="text-xs text-gray-600">Students</p>
                          </div>
                        )}
                      </div> */}
                      
                      {/* Add some basic author stats if available */}
                      {blogData.users.email && (
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <User className="h-3 w-3" />
                            Contact: {blogData.users.email}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <Avatar className="h-16 w-16 mx-auto mb-3">
                        <AvatarFallback>
                          <User className="h-8 w-8" />
                        </AvatarFallback>
                      </Avatar>
                      <p className="font-semibold text-gray-900">Anonymous</p>
                      <p className="text-sm text-gray-600">Author</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Related Posts */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Related Posts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isRelatedLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse flex gap-3">
                          <div className="w-16 h-16 bg-gray-200 rounded"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : relatedBlogs?.result && relatedBlogs.result.length > 0 ? (
                    <div className="space-y-4">
                      {relatedBlogs.result.slice(0, 4).map((post: any) => (
                        <Link 
                          key={post.id} 
                          href={`/blogs/${post.id}`}
                          className="block group"
                        >
                          <div className="flex gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="relative w-16 h-16 flex-shrink-0">
                              <Image
                                src={post.image || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNmOWZhZmIiLz4KICA8cmVjdCB4PSIxNTAiIHk9IjEwMCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNlNWU3ZWIiLz4KICA8Y2lyY2xlIGN4PSIxNzAiIGN5PSIxMzAiIHI9IjEwIiBmaWxsPSIjOWNhM2FmIi8+CiAgPHBhdGggZD0ibTE1MCAyMDBsNTAtNTAgNTAgNTB6IiBmaWxsPSIjOWNhM2FmIi8+CiAgPHRleHQgeD0iMjAwIiB5PSIyNDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2Yjc0ODEiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiI+Tm8gSW1hZ2U8L3RleHQ+Cjwvc3ZnPg=="}
                                alt={post.title}
                                fill
                                className="object-cover rounded"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">
                                {post.title}
                              </h4>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span>{post.category?.name}</span>
                                <span>•</span>
                                <span>{formatDate(post.created_at)}</span>
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">No related posts found.</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
