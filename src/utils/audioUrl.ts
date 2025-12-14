import { getVideoStreamUrl } from "@/api/file";

export const processAudioUrl = async (
  audioUrl: string | null | undefined
): Promise<string | null> => {
  if (!audioUrl) return null;

  // If it's already a full URL (http/https), return as is
  if (audioUrl.startsWith("http://") || audioUrl.startsWith("https://")) {
    return audioUrl;
  }

  // If it's a public test URL, keep it as fallback
  const isPublicTestUrl = audioUrl.startsWith("/test/");

  // Check if it's a MinIO filename (starts with 'audio-' or doesn't start with '/')
  const isMinioFilename =
    audioUrl.startsWith("audio-") ||
    (!audioUrl.startsWith("/") && !audioUrl.startsWith("http"));

  if (isMinioFilename) {
    try {
      // Try to get stream URL from MinIO
      const streamInfo = await getVideoStreamUrl(audioUrl);
      
      // Priority: preferredUrl > hlsUrl > originalUrl
      if (streamInfo.preferredUrl) {
        return streamInfo.preferredUrl;
      }
      if (streamInfo.hlsUrl) {
        return streamInfo.hlsUrl;
      }
      if (streamInfo.originalUrl) {
        return streamInfo.originalUrl;
      }
    } catch (error) {
      console.warn("Failed to get MinIO audio URL:", error);
      // Fall through to fallback
    }
  }

  // Fallback to public URL if it exists, otherwise return null
  return isPublicTestUrl ? audioUrl : null;
};

