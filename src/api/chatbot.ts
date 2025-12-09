import axios from 'axios';

const CHATBOT_API_URL = process.env.NEXT_PUBLIC_CHATBOT_API_URL || 'http://localhost:2222';

const apiClient = axios.create({
  baseURL: CHATBOT_API_URL,
  timeout: 180000, // 3 minutes timeout 
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

const uploadClient = axios.create({
  baseURL: CHATBOT_API_URL,
  timeout: 600000, // 10 minutes timeout for PDF upload/processing
  headers: {
    'Content-Type': 'multipart/form-data',
  },
  withCredentials: false,
});

export interface ChatRequest {
  message: string;
  use_rag?: boolean;
  conversation_history?: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
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
  try {
    const response = await apiClient.post<ChatResponse>('/chat', {
      message: data.message,
      use_rag: data.use_rag ?? true,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message;
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout - the response is taking too long. Please try again.');
      }
      throw new Error(errorMessage || 'Failed to get response from chatbot');
    }
    throw error instanceof Error ? error : new Error('Network error - please check your connection and try again.');
  }
};

/**
 * Upload a PDF file for RAG
 */
export const uploadPDF = async (file: File): Promise<PDFUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await uploadClient.post<PDFUploadResponse>('/rag/upload-pdf', formData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message;
      if (error.code === 'ECONNABORTED') {
        throw new Error('Upload timeout - PDF is too large or processing is taking too long. Please try a smaller file.');
      }
      throw new Error(errorMessage || 'Failed to upload PDF');
    }
    throw error instanceof Error ? error : new Error('Failed to upload PDF');
  }
};

/**
 * Search documents in the knowledge base
 */
export const searchDocuments = async (data: DocumentSearchRequest): Promise<DocumentSearchResponse> => {
  try {
    const response = await apiClient.post<DocumentSearchResponse>('/rag/search', {
      query: data.query,
      top_k: data.top_k ?? 5,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message;
      throw new Error(errorMessage || 'Failed to search documents');
    }
    throw error instanceof Error ? error : new Error('Failed to search documents');
  }
};

/**
 * Get collection statistics
 */
export const getCollectionStats = async (): Promise<CollectionStatsResponse> => {
  try {
    const response = await apiClient.get<CollectionStatsResponse>('/rag/stats');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message;
      throw new Error(errorMessage || 'Failed to get collection stats');
    }
    throw error instanceof Error ? error : new Error('Failed to get collection stats');
  }
};

/**
 * Delete documents by source file
 */
export const deleteDocumentsBySource = async (sourceFile: string): Promise<{ message: string }> => {
  try {
    const response = await apiClient.delete<{ message: string }>(`/rag/documents/${encodeURIComponent(sourceFile)}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message;
      throw new Error(errorMessage || 'Failed to delete documents');
    }
    throw error instanceof Error ? error : new Error('Failed to delete documents');
  }
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
  try {
    const response = await apiClient.get<{
      status: string;
      ollama_connected: boolean;
      translation_available: boolean;
      version: string;
    }>('/health');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.detail || 'Health check failed');
    }
    throw error instanceof Error ? error : new Error('Health check failed');
  }
};

