"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, RefreshCw, Trash2, Database } from "lucide-react";
import { getCollectionStats, deleteDocumentsBySource } from "@/api/chatbot";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function DocumentsPage() {
  const [limit] = useState(50);
  const [offset, setOffset] = useState(0);
  const queryClient = useQueryClient();

  // Fetch documents
  const { data: documentsData, isLoading, refetch } = useQuery({
    queryKey: ["rag-documents", limit, offset],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_CHATBOT_API_URL || 'http://localhost:2222'}/rag/documents?limit=${limit}&offset=${offset}`
      );
      if (!response.ok) throw new Error("Failed to fetch documents");
      return response.json();
    },
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ["rag-stats"],
    queryFn: getCollectionStats,
    refetchInterval: 30000,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteDocumentsBySource,
    onSuccess: () => {
      toast.success("Documents deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["rag-documents"] });
      queryClient.invalidateQueries({ queryKey: ["rag-stats"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete documents");
    },
  });

  const handleDelete = (sourceFile: string) => {
    if (confirm(`Delete all documents from "${sourceFile}"?`)) {
      deleteMutation.mutate(sourceFile);
    }
  };

  const documents = documentsData?.documents || [];
  const total = documentsData?.total || 0;

  // Group by source file
  const groupedBySource = documents.reduce((acc: Record<string, any[]>, doc: any) => {
    const source = doc.source_file || "Unknown";
    if (!acc[source]) acc[source] = [];
    acc[source].push(doc);
    return acc;
  }, {});

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Knowledge Base Documents</h1>
        <p className="text-gray-600">View and manage documents in Milvus vector database</p>
      </div>

      {/* Stats */}
      {stats && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Collection Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Documents</p>
                <p className="text-2xl font-bold text-blue-600">{stats.num_entities.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Collection Name</p>
                <p className="text-lg font-semibold">{stats.collection_name}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documents by Source */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
            <p className="mt-4 text-gray-600">Loading documents...</p>
          </div>
        ) : Object.keys(groupedBySource).length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No documents found. Upload PDF files to get started.</p>
            </CardContent>
          </Card>
        ) : (
          Object.entries(groupedBySource).map(([sourceFile, docs]) => (
            <Card key={sourceFile}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {sourceFile}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {docs.length} chunk{docs.length !== 1 ? "s" : ""}
                    </CardDescription>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(sourceFile)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {docs.map((doc: any, idx: number) => (
                    <div
                      key={doc.id || idx}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          Chunk #{doc.chunk_index}
                        </Badge>
                        <span className="text-xs text-gray-500">ID: {doc.id}</span>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-3">{doc.text}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {total > limit && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {offset + 1}-{Math.min(offset + limit, total)} of {total}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setOffset(Math.max(0, offset - limit))}
              disabled={offset === 0}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setOffset(offset + limit)}
              disabled={offset + limit >= total}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <div className="mt-6 flex justify-center">
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
    </div>
  );
}

