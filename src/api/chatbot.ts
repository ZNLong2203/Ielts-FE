/**
 * Chatbot RAG API Client
 */

const CHATBOT_API_URL = process.env.NEXT_PUBLIC_CHATBOT_API_URL || 'http://localhost:2222';

export interface ChatRequest {
  message: string;
  use_rag?: boolean;
}

export interface ChatResponse {
  response: string;
  sources?: Array<{
    text: string;
    source_file: string;
    chunk_index: number;
    metadata?: string;
    score: number;
  }>;
}

export interface PDFUploadResponse {
  message: string;
  file_name: string;
  chunks_processed: number;
  collection_stats: {
    num_entities: number;
    collection_name: string;
  };
}

export interface DocumentSearchRequest {
  query: string;
  top_k?: number;
}

export interface DocumentSearchResponse {
  results: Array<{
    text: string;
    source_file: string;
    chunk_index: number;
    metadata?: string;
    score: number;
  }>;
  query: string;
}

export interface CollectionStatsResponse {
  num_entities: number;
  collection_name: string;
}

/**
 * Send a chat message to the chatbot
 */
export const chatWithBot = async (data: ChatRequest): Promise<ChatResponse> => {
  const response = await fetch(`${CHATBOT_API_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    mode: 'cors',
    credentials: 'omit',
    body: JSON.stringify({
      message: data.message,
      use_rag: data.use_rag ?? true,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || 'Failed to get response from chatbot');
  }

  return response.json();
};

/**
 * Upload a PDF file for RAG
 */
export const uploadPDF = async (file: File): Promise<PDFUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${CHATBOT_API_URL}/rag/upload-pdf`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to upload PDF' }));
    throw new Error(error.detail || 'Failed to upload PDF');
  }

  return response.json();
};

/**
 * Search documents in the knowledge base
 */
export const searchDocuments = async (data: DocumentSearchRequest): Promise<DocumentSearchResponse> => {
  const response = await fetch(`${CHATBOT_API_URL}/rag/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: data.query,
      top_k: data.top_k ?? 5,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to search documents' }));
    throw new Error(error.detail || 'Failed to search documents');
  }

  return response.json();
};

/**
 * Get collection statistics
 */
export const getCollectionStats = async (): Promise<CollectionStatsResponse> => {
  const response = await fetch(`${CHATBOT_API_URL}/rag/stats`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to get stats' }));
    throw new Error(error.detail || 'Failed to get collection stats');
  }

  return response.json();
};

/**
 * Delete documents by source file
 */
export const deleteDocumentsBySource = async (sourceFile: string): Promise<{ message: string }> => {
  const response = await fetch(`${CHATBOT_API_URL}/rag/documents/${encodeURIComponent(sourceFile)}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to delete documents' }));
    throw new Error(error.detail || 'Failed to delete documents');
  }

  return response.json();
};

/**
 * Health check
 */
export const healthCheck = async (): Promise<{
  status: string;
  ollama_connected: boolean;
  translation_available: boolean;
  version: string;
}> => {
  const response = await fetch(`${CHATBOT_API_URL}/health`);

  if (!response.ok) {
    throw new Error('Health check failed');
  }

  return response.json();
};

