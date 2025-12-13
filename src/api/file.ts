import api from "@/utils/interceptor";
import { API_URL } from "@/constants/api";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const uploadAvatar = async (file: File, id: string) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.patch(`${BASE_URL}/profile/${id}/avatar`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  console.log("Image upload response:", response);
  return response.data;
};

export const uploadAudio = async (file: File): Promise<{ url: string; fileName: string; etag: string }> => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post(`${BASE_URL}/files/upload/audio`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  
  console.log('Upload audio response:', JSON.stringify(response.data, null, 2));
  
  let result: { url: string; fileName: string; etag: string };
  
  if (response.data?.data?.data) {
    result = response.data.data.data;
  } else if (response.data?.data?.url) {
    result = response.data.data;
  } else if (response.data?.url) {
    result = response.data;
  } else {
    console.error('Unexpected response structure:', response.data);
    throw new Error('Invalid response structure from upload audio API');
  }
  
  console.log('Extracted result:', result);
  
  if (!result.url) {
    console.error('Invalid url in response:', result);
    throw new Error('Invalid URL in upload response');
  }
  
  const finalResult = {
    url: String(result.url),
    fileName: String(result.fileName || ''),
    etag: String(result.etag || ''),
  };
  
  console.log('Final upload result:', finalResult);
  
  return finalResult;
};

export const uploadExerciseImage = async (file: File): Promise<{ url: string; fileName: string; etag: string }> => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post(`${BASE_URL}/files/upload/exercise-image`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  
  console.log('Upload exercise image response:', JSON.stringify(response.data, null, 2));
  
  let result: { url: string; fileName: string; etag: string };
  
  if (response.data?.data?.data) {
    result = response.data.data.data;
  } else if (response.data?.data?.url) {
    result = response.data.data;
  } else if (response.data?.url) {
    result = response.data;
  } else {
    console.error('Unexpected response structure:', response.data);
    throw new Error('Invalid response structure from upload exercise image API');
  }
  
  if (!result.url) {
    console.error('Invalid url in response:', result);
    throw new Error('Invalid URL in upload response');
  }
  
  return {
    url: String(result.url),
    fileName: String(result.fileName || ''),
    etag: String(result.etag || ''),
  };
};

// Get video stream URL (HLS or original) from fileName
export const getVideoStreamUrl = async (fileName: string): Promise<{
  fileName: string;
  hlsUrl: string | null;
  originalUrl: string | null;
  preferredUrl: string | null;
  streamType: 'hls' | 'progressive';
}> => {
  const response = await api.get(`${BASE_URL}/media/${encodeURIComponent(fileName)}/stream-url`);
  const innerData = response.data.data;
  const result = (innerData?.data && typeof innerData.data === 'object') ? innerData.data : innerData;
  return result;
};