"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PDFUploader from "@/components/student/chatbot/PDFUploader";
import ChatInterface from "@/components/student/chatbot/ChatInterface";
import { MessageSquare, FileText, Database } from "lucide-react";
import Link from "next/link";

export default function ChatbotPage() {
  const [activeTab, setActiveTab] = useState("chat");

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">IELTS AI Assistant</h1>
        <p className="text-gray-600">
          Chat with AI-powered assistant enhanced with RAG (Retrieval-Augmented Generation)
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-2xl">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Upload Documents
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            View Documents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-4">
          <ChatInterface useRAG={true} />
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <PDFUploader
            onUploadSuccess={() => {
              // Optionally switch to chat tab after successful upload
              setTimeout(() => setActiveTab("chat"), 2000);
            }}
          />
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardContent className="py-12 text-center">
              <Database className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">View Documents</h3>
              <p className="text-gray-600 mb-4">
                View and manage documents in the knowledge base
              </p>
              <Link href="/student/chatbot/documents">
                <Button>
                  <Database className="h-4 w-4 mr-2" />
                  Open Documents Page
                </Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

