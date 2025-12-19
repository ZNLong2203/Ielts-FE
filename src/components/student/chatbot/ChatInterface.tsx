"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Send, Loader2, Bot, User, FileText, Sparkles } from "lucide-react";
import { chatWithBot, ChatResponse } from "@/api/chatbot";
import { useMutation } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: ChatResponse["sources"];
  timestamp: Date;
}

interface ChatInterfaceProps {
  useRAG?: boolean;
}

// Simple markdown formatter for assistant messages
const formatMarkdown = (text: string) => {
  if (!text) return text;
  
  // Split by lines to process block-level elements
  const lines = text.split('\n');
  const formatted: (JSX.Element | string)[] = [];
  let i = 0;
  
  // Parse markdown table
  const parseTable = (startIndex: number): { table: JSX.Element; endIndex: number } | null => {
    if (startIndex >= lines.length) return null;
    
    // Check if this line looks like a table row (contains |)
    const firstLine = lines[startIndex].trim();
    if (!firstLine.includes('|') || firstLine.length < 3) return null;
    
    // Parse header row
    const headerCells = firstLine.split('|').map(c => c.trim()).filter(c => c);
    if (headerCells.length === 0) return null;
    
    // Check if next line is a separator (e.g., |------|--------|)
    if (startIndex + 1 >= lines.length) return null;
    const separatorLine = lines[startIndex + 1].trim();
    if (!separatorLine.includes('|') || !separatorLine.match(/^\|[\s\-:]+\|/)) return null;
    
    // Parse data rows
    const dataRows: string[][] = [];
    let currentIndex = startIndex + 2;
    
    while (currentIndex < lines.length) {
      const line = lines[currentIndex].trim();
      // Stop if line doesn't look like a table row
      if (!line.includes('|') || line.length < 3) break;
      
      const cells = line.split('|').map(c => c.trim()).filter(c => c);
      if (cells.length === 0) break;
      
      dataRows.push(cells);
      currentIndex++;
    }
    
    // Build table element
    const table = (
      <div key={`table-${startIndex}`} className="my-4 overflow-x-auto">
        <table className="min-w-full border border-gray-300 rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              {headerCells.map((cell, idx) => (
                <th key={`header-${idx}`} className="border border-gray-300 px-4 py-2 text-left font-semibold">
                  {formatInlineMarkdown(cell, `table-header-${startIndex}-${idx}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataRows.map((row, rowIdx) => (
              <tr key={`row-${rowIdx}`} className={rowIdx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                {row.map((cell, cellIdx) => (
                  <td key={`cell-${rowIdx}-${cellIdx}`} className="border border-gray-300 px-4 py-2">
                    {formatInlineMarkdown(cell, `table-cell-${startIndex}-${rowIdx}-${cellIdx}`)}
                  </td>
                ))}
                {/* Fill empty cells if row has fewer cells than header */}
                {Array.from({ length: Math.max(0, headerCells.length - row.length) }).map((_, emptyIdx) => (
                  <td key={`empty-${rowIdx}-${emptyIdx}`} className="border border-gray-300 px-4 py-2"></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    
    return { table, endIndex: currentIndex };
  };
  
  while (i < lines.length) {
    const line = lines[i];
    const key = `line-${i}`;
    
    // Check for table
    const tableResult = parseTable(i);
    if (tableResult) {
      formatted.push(tableResult.table);
      i = tableResult.endIndex;
      continue;
    }
    
    // Horizontal rule
    if (line.trim() === '---' || line.trim() === '***') {
      formatted.push(<hr key={key} className="my-4 border-gray-300" />);
      i++;
      continue;
    }
    
    // Headings
    if (line.startsWith('### ')) {
      formatted.push(
        <h3 key={key} className="text-base font-semibold mt-4 mb-2">
          {formatInlineMarkdown(line.substring(4), `${key}-inline`)}
        </h3>
      );
      i++;
      continue;
    }
    if (line.startsWith('## ')) {
      formatted.push(
        <h2 key={key} className="text-lg font-semibold mt-4 mb-2">
          {formatInlineMarkdown(line.substring(3), `${key}-inline`)}
        </h2>
      );
      i++;
      continue;
    }
    if (line.startsWith('# ')) {
      formatted.push(
        <h1 key={key} className="text-xl font-bold mt-4 mb-2">
          {formatInlineMarkdown(line.substring(2), `${key}-inline`)}
        </h1>
      );
      i++;
      continue;
    }
    
    // Regular paragraph with inline markdown
    if (line.trim()) {
      formatted.push(
        <p key={key} className="mb-2">
          {formatInlineMarkdown(line, `${key}-inline`)}
        </p>
      );
    } else {
      formatted.push(<br key={key} />);
    }
    
    i++;
  }
  
  return <>{formatted}</>;
};

// Format inline markdown (bold, italic, etc.)
const formatInlineMarkdown = (text: string, baseKey: string): (JSX.Element | string)[] => {
  if (!text) return [text];
  
  const parts: (JSX.Element | string)[] = [];
  const processed = text;
  let partIndex = 0;
  
  // Process bold **text** first (before italic to avoid conflicts)
  const boldRegex = /\*\*([^*]+?)\*\*/g;
  const boldMatches: Array<{ start: number; end: number; content: string }> = [];
  let boldMatch: RegExpExecArray | null;
  
  while ((boldMatch = boldRegex.exec(processed)) !== null) {
    boldMatches.push({
      start: boldMatch.index,
      end: boldMatch.index + boldMatch[0].length,
      content: boldMatch[1]
    });
  }
  
  const italicRegex = /\*([^*\n]+?)\*/g;
  const italicMatches: Array<{ start: number; end: number; content: string }> = [];
  let italicMatch: RegExpExecArray | null;
  
  // Reset regex lastIndex
  italicRegex.lastIndex = 0;
  
  while ((italicMatch = italicRegex.exec(processed)) !== null) {
    const matchStart = italicMatch.index;
    const matchEnd = matchStart + italicMatch[0].length;
    
    // Check if this is part of a bold match 
    const isPartOfBold = boldMatches.some(bold => 
      matchStart >= bold.start && matchEnd <= bold.end
    );
    
    // Check if there's a * immediately before or after 
    const charBefore = matchStart > 0 ? processed[matchStart - 1] : '';
    const charAfter = matchEnd < processed.length ? processed[matchEnd] : '';
    const isPartOfDoubleStar = charBefore === '*' || charAfter === '*';
    
    // Also check if the previous match was a bold that ends right before this
    const isAdjacentToBold = boldMatches.some(bold => 
      bold.end === matchStart || matchEnd === bold.start
    );
    
    if (!isPartOfBold && !isPartOfDoubleStar && !isAdjacentToBold) {
      italicMatches.push({
        start: matchStart,
        end: matchEnd,
        content: italicMatch[1]
      });
    }
  }
  
  // Combine and sort all matches by position
  type MatchType = { start: number; end: number; content: string; type: 'bold' | 'italic' };
  const allMatches: MatchType[] = [
    ...boldMatches.map(m => ({ ...m, type: 'bold' as const })),
    ...italicMatches.map(m => ({ ...m, type: 'italic' as const }))
  ].sort((a, b) => a.start - b.start);
  
  // Remove overlapping matches (keep bold over italic)
  const filteredMatches: MatchType[] = [];
  for (const match of allMatches) {
    const overlaps = filteredMatches.some(existing => 
      (match.start < existing.end && match.end > existing.start)
    );
    if (!overlaps) {
      filteredMatches.push(match);
    }
  }
  
  // Build parts array
  let lastIndex = 0;
  for (const match of filteredMatches) {
    // Add text before match
    if (match.start > lastIndex) {
      const beforeText = processed.substring(lastIndex, match.start);
      if (beforeText) {
        parts.push(beforeText);
      }
    }
    
    // Add formatted text
    if (match.type === 'bold') {
      parts.push(
        <strong key={`${baseKey}-bold-${partIndex}`} className="font-semibold">
          {match.content}
        </strong>
      );
    } else {
      parts.push(
        <em key={`${baseKey}-italic-${partIndex}`} className="italic">
          {match.content}
        </em>
      );
    }
    
    lastIndex = match.end;
    partIndex++;
  }
  
  // Add remaining text
  if (lastIndex < processed.length) {
    parts.push(processed.substring(lastIndex));
  }
  
  // If no matches, return original text
  if (parts.length === 0) {
    return [text];
  }
  
  return parts;
};

export default function ChatInterface({ useRAG = true }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your IELTS preparation assistant. I can help you with reading, writing, listening, and speaking. How can I assist you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isRAGEnabled, setIsRAGEnabled] = useState(useRAG);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  const chatMutation = useMutation({
    mutationFn: (message: string) => {
      // Prepare conversation history (last 4 messages for context)
      const history = messages.slice(-4).map(msg => ({
        role: msg.role,
        content: msg.content,
      }));
      
      return chatWithBot({
        message,
        use_rag: isRAGEnabled,
        conversation_history: history.length > 0 ? history : undefined,
      });
    },
    onSuccess: (data: ChatResponse) => {
      const newMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.response,
        sources: data.sources,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, newMessage]);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to get response");
    },
  });

  // Check if user is near bottom of chat
  const checkIfNearBottom = useCallback(() => {
    if (!messagesContainerRef.current) return true;
    const container = messagesContainerRef.current;
    const threshold = 100; // pixels from bottom
    const isNearBottom = 
      container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
    setShouldAutoScroll(isNearBottom);
    return isNearBottom;
  }, []);

  const scrollToBottom = useCallback((instant = false) => {
    if (!messagesContainerRef.current || !messagesEndRef.current) return;
    
    const container = messagesContainerRef.current;
    if (instant) {
      // Instant scroll
      container.scrollTop = container.scrollHeight;
    } else {
      // Smooth scroll
      messagesEndRef.current.scrollIntoView({ 
        behavior: "smooth",
        block: "end"
      });
    }
  }, []);

  // Handle scroll events to detect if user is manually scrolling
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      checkIfNearBottom();
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [checkIfNearBottom]);

  // Scroll to bottom when new messages arrive (only if user is near bottom)
  useEffect(() => {
    if (shouldAutoScroll) {
      scrollToBottom();
    }
  }, [messages, shouldAutoScroll, scrollToBottom]);

  // Auto-scroll continuously while generating response (only if user is near bottom)
  useEffect(() => {
    if (chatMutation.isPending && shouldAutoScroll) {
      // Scroll immediately when generation starts
      setTimeout(() => scrollToBottom(true), 50);
      
      // Then scroll continuously every 100ms to follow the response
      const interval = setInterval(() => {
        if (shouldAutoScroll) {
          scrollToBottom(true); // Instant scroll during generation
        }
      }, 100);
      
      return () => clearInterval(interval);
    }
  }, [chatMutation.isPending, shouldAutoScroll, scrollToBottom]);

  const handleSend = () => {
    if (!input.trim() || chatMutation.isPending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    
    // Always scroll to bottom when user sends a message
    setShouldAutoScroll(true);
    setTimeout(() => scrollToBottom(true), 100);
    
    chatMutation.mutate(input.trim());

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="flex flex-col md:h-[calc(100vh-280px)] md:min-h-[600px] md:max-h-[800px] h-auto">
      <CardContent className="flex flex-col flex-1 p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">IELTS Assistant</h3>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={isRAGEnabled ? "default" : "secondary"}
              className="cursor-pointer"
              onClick={() => setIsRAGEnabled(!isRAGEnabled)}
            >
              <Sparkles className="h-3 w-3 mr-1" />
              {isRAGEnabled ? "RAG Enabled" : "RAG Disabled"}
            </Badge>
          </div>
        </div>

        {/* Messages */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth min-h-0"
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 items-start",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.role === "assistant" && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-blue-600" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[80%] min-w-0 rounded-lg px-4 py-3",
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-900"
                )}
              >
                <div className="whitespace-pre-wrap break-words text-sm leading-relaxed overflow-wrap-anywhere prose prose-sm max-w-none">
                  {message.role === "assistant" ? (
                    <div className="markdown-content">
                      {formatMarkdown(message.content)}
                    </div>
                  ) : (
                    message.content
                  )}
                </div>
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-300">
                    <p className="text-xs font-medium mb-1 flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      Sources ({message.sources.length}):
                    </p>
                    <div className="space-y-1">
                      {message.sources.map((source, idx) => (
                        <div key={idx} className="text-xs text-gray-600">
                          <span className="font-medium">{source.source_file}</span>
                          {" "}
                          <span className="text-gray-500">
                            (relevance: {(source.score * 100).toFixed(1)}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {message.role === "user" && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
              )}
            </div>
          ))}
          {chatMutation.isPending && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Bot className="h-4 w-4 text-blue-600" />
              </div>
              <div className="bg-gray-100 rounded-lg px-4 py-2">
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t bg-white flex-shrink-0">
          <div className="flex gap-2 items-end">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about IELTS..."
              className="min-h-[60px] max-h-[120px] resize-none flex-1"
              disabled={chatMutation.isPending}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || chatMutation.isPending}
              className="h-[60px] px-4"
            >
              {chatMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

