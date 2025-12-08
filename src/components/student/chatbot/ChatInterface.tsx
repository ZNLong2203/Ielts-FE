"use client";

import { useState, useRef, useEffect } from "react";
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

  const chatMutation = useMutation({
    mutationFn: (message: string) =>
      chatWithBot({
        message,
        use_rag: isRAGEnabled,
      }),
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

  const scrollToBottom = (instant = false) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: instant ? "auto" : "smooth",
        block: "end"
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-scroll continuously while generating response (like ChatGPT)
  useEffect(() => {
    if (chatMutation.isPending) {
      // Scroll immediately when generation starts
      setTimeout(() => scrollToBottom(true), 50);
      
      // Then scroll continuously every 100ms to follow the response
      const interval = setInterval(() => {
        scrollToBottom(true); // Instant scroll during generation
      }, 100);
      
      return () => clearInterval(interval);
    }
  }, [chatMutation.isPending]);

  // Auto-scroll when generating response
  useEffect(() => {
    if (chatMutation.isPending) {
      const interval = setInterval(() => {
        scrollToBottom(true); // Instant scroll during generation
      }, 100); // Scroll every 100ms while generating
      
      return () => clearInterval(interval);
    }
  }, [chatMutation.isPending]);

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
    
    // Scroll to bottom immediately after sending
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
    <Card className="flex flex-col h-[600px]">
      <CardContent className="flex flex-col flex-1 p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
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
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
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
                  "max-w-[80%] min-w-0 rounded-lg px-4 py-2",
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-900"
                )}
              >
                <div className="whitespace-pre-wrap break-words text-sm leading-relaxed" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                  {message.content}
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
        <div className="p-4 border-t bg-white">
          <div className="flex gap-2">
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
              className="min-h-[60px] max-h-[120px] resize-none"
              disabled={chatMutation.isPending}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || chatMutation.isPending}
              className="self-end"
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

