"use client";
import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  RotateCcw,
  Eye,
  Clock,
  Loader2,
  AlertCircle,
  Wifi,
  WifiOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface HlsVideoPlayerProps {
  hlsUrl: string;
  title?: string;
  description?: string;
  duration?: number;
  isPreview?: boolean;
  autoPlay?: boolean;
  onProgress?: (currentTime: number, duration: number) => void;
  onComplete?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

declare global {
  interface Window {
    Hls: any;
  }
}

const HlsVideoPlayer = ({
  hlsUrl,
  title = "Video Lesson",
  description,
  duration,
  isPreview = false,
  autoPlay = false,
  onProgress,
  onComplete,
  onError,
  className = "",
}: HlsVideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Video state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(duration || 0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState<'good' | 'poor' | 'offline'>('good');

  // Quality levels
  const [qualityLevels, setQualityLevels] = useState<any[]>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1);

  // Format time helper
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Load HLS script dynamically
  useEffect(() => {
    const loadHlsScript = async () => {
      if (typeof window !== 'undefined' && !window.Hls) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
        script.async = true;
        
        return new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }
    };

    loadHlsScript().catch(console.error);
  }, []);

  // Initialize HLS player
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hlsUrl) return;

    const initializeHlsPlayer = () => {
      // Check if browser supports HLS natively (Safari)
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        console.log(" Using native HLS support (Safari)");
        video.src = hlsUrl;
        setIsLoading(false);
        return;
      }

      // Use HLS.js for other browsers
      if (typeof window !== 'undefined' && window.Hls && window.Hls.isSupported()) {
        console.log(" Initializing HLS.js player");
        
        // Destroy existing instance
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }

        const hls = new window.Hls({
          debug: process.env.NODE_ENV === 'development',
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90,
        });

        hlsRef.current = hls;

        // Load source
        hls.loadSource(hlsUrl);
        hls.attachMedia(video);

        // Event listeners
        hls.on(window.Hls.Events.MANIFEST_PARSED, (event: any, data: any) => {
          console.log(" HLS manifest loaded, found levels:", data.levels.length);
          setQualityLevels(data.levels);
          setIsLoading(false);
          
          if (autoPlay) {
            video.play().catch(console.error);
          }
        });

        hls.on(window.Hls.Events.LEVEL_SWITCHED, (event: any, data: any) => {
          console.log(" Quality switched to level:", data.level);
          setCurrentQuality(data.level);
        });

        hls.on(window.Hls.Events.ERROR, (event: any, data: any) => {
          console.error(" HLS Error:", data);
          
          if (data.fatal) {
            switch (data.type) {
              case window.Hls.ErrorTypes.NETWORK_ERROR:
                setError("Network error. Please check your connection.");
                setConnectionQuality('offline');
                break;
              case window.Hls.ErrorTypes.MEDIA_ERROR:
                setError("Media error. Video format not supported.");
                break;
              default:
                setError("Fatal error occurred while loading video.");
                break;
            }
            setIsLoading(false);
            onError?.(data.details || "HLS playback error");
          }
        });

        hls.on(window.Hls.Events.BUFFER_APPENDING, () => {
          setIsBuffering(false);
        });

        hls.on(window.Hls.Events.BUFFER_STALLED, () => {
          setIsBuffering(true);
        });

        return () => {
          hls.destroy();
        };
      } else {
        console.error(" HLS not supported in this browser");
        setError("HLS streaming not supported in this browser. Please use a modern browser.");
        setIsLoading(false);
      }
    };

    // Small delay to ensure HLS.js is loaded
    const timer = setTimeout(initializeHlsPlayer, 100);
    
    return () => {
      clearTimeout(timer);
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [hlsUrl, autoPlay]);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const current = video.currentTime;
      const total = video.duration;
      
      setCurrentTime(current);
      
      if (!isNaN(total) && total > 0) {
        setVideoDuration(total);
        onProgress?.(current, total);
        
        // Check completion (95% threshold)
        if (current / total >= 0.95) {
          onComplete?.();
        }
      }
    };

    const handleLoadedMetadata = () => {
      setVideoDuration(video.duration);
      setIsLoading(false);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleWaiting = () => setIsBuffering(true);
    const handleCanPlay = () => setIsBuffering(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [onProgress, onComplete]);

  // Control functions
  const togglePlayPause = async () => {
    if (!videoRef.current) return;
    
    try {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        await videoRef.current.play();
      }
    } catch (error) {
      console.error("Playback error:", error);
      toast.error("Failed to play video");
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !videoDuration) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = clickX / width;
    const newTime = percentage * videoDuration;
    
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (newVolume: number) => {
    if (!videoRef.current) return;
    
    setVolume(newVolume);
    videoRef.current.volume = newVolume;
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    videoRef.current.muted = newMuted;
  };

  const skipTime = (seconds: number) => {
    if (!videoRef.current) return;
    
    const newTime = Math.max(0, Math.min(videoDuration, currentTime + seconds));
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const changePlaybackRate = (rate: number) => {
    if (!videoRef.current) return;
    
    setPlaybackRate(rate);
    videoRef.current.playbackRate = rate;
  };

  const changeQuality = (levelIndex: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
      setCurrentQuality(levelIndex);
      
      if (levelIndex === -1) {
        toast.success("Auto quality enabled");
      } else {
        const level = qualityLevels[levelIndex];
        toast.success(`Quality changed to ${level.height}p`);
      }
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // Auto-hide controls
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (isPlaying && showControls) {
      timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    
    return () => clearTimeout(timeout);
  }, [isPlaying, showControls]);

  const progressPercentage = videoDuration ? (currentTime / videoDuration) * 100 : 0;

  // Error state
  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold text-red-700 mb-2">Video Playback Error</h3>
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Play className="h-5 w-5 text-blue-600" />
            <span className="truncate">{title}</span>
            {isPreview && (
              <Badge variant="outline" className="bg-green-50 text-green-700">
                <Eye className="h-3 w-3 mr-1" />
                Preview
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {/* Connection quality indicator */}
            <div className="flex items-center space-x-1">
              {connectionQuality === 'good' && <Wifi className="h-4 w-4 text-green-500" />}
              {connectionQuality === 'poor' && <Wifi className="h-4 w-4 text-yellow-500" />}
              {connectionQuality === 'offline' && <WifiOff className="h-4 w-4 text-red-500" />}
            </div>
            
            {videoDuration > 0 && (
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {formatTime(videoDuration)}
              </Badge>
            )}
          </div>
        </CardTitle>
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}
      </CardHeader>

      <CardContent className="p-0">
        <div
          ref={containerRef}
          className="relative bg-black group"
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => !isPlaying && setShowControls(true)}
        >
          {/* Video Element */}
          <video
            ref={videoRef}
            className="w-full aspect-video"
            onClick={togglePlayPause}
            onDoubleClick={toggleFullscreen}
            crossOrigin="anonymous"
            playsInline
            preload="metadata"
          />

          {/* Loading Overlay */}
          {(isLoading || isBuffering) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50">
              <Loader2 className="h-8 w-8 text-white animate-spin mb-2" />
              <span className="text-white text-sm">
                {isLoading ? "Loading video..." : "Buffering..."}
              </span>
            </div>
          )}

          {/* Play Button Overlay */}
          {!isPlaying && !isLoading && !isBuffering && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                onClick={togglePlayPause}
                size="lg"
                className="h-16 w-16 rounded-full bg-white bg-opacity-90 hover:bg-opacity-100 text-black"
              >
                <Play className="h-8 w-8 ml-1" />
              </Button>
            </div>
          )}

          {/* Video Controls */}
          <div
            className={cn(
              "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/70 to-transparent p-4 transition-opacity duration-300",
              showControls ? "opacity-100" : "opacity-0"
            )}
          >
            {/* Progress Bar */}
            <div className="mb-3">
              <div
                className="h-1 bg-white bg-opacity-30 rounded-full cursor-pointer"
                onClick={handleProgressClick}
              >
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-100"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {/* Play/Pause */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePlayPause}
                  className="text-white hover:bg-white hover:bg-opacity-20"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>

                {/* Skip Controls */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => skipTime(-10)}
                  className="text-white hover:bg-white hover:bg-opacity-20"
                >
                  <SkipBack className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => skipTime(10)}
                  className="text-white hover:bg-white hover:bg-opacity-20"
                >
                  <SkipForward className="h-4 w-4" />
                </Button>

                {/* Volume Control */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleMute}
                    className="text-white hover:bg-white hover:bg-opacity-20"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </Button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-20 accent-blue-500"
                  />
                </div>

                {/* Time Display */}
                <span className="text-white text-sm font-mono">
                  {formatTime(currentTime)} / {formatTime(videoDuration)}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                {/* Playback Speed */}
                <select
                  value={playbackRate}
                  onChange={(e) => changePlaybackRate(parseFloat(e.target.value))}
                  className="bg-transparent text-white text-sm border border-white border-opacity-30 rounded px-2 py-1"
                >
                  <option value={0.5} className="bg-black">0.5x</option>
                  <option value={0.75} className="bg-black">0.75x</option>
                  <option value={1} className="bg-black">1x</option>
                  <option value={1.25} className="bg-black">1.25x</option>
                  <option value={1.5} className="bg-black">1.5x</option>
                  <option value={2} className="bg-black">2x</option>
                </select>

                {/* Quality Selector */}
                {qualityLevels.length > 0 && (
                  <select
                    value={currentQuality}
                    onChange={(e) => changeQuality(parseInt(e.target.value))}
                    className="bg-transparent text-white text-sm border border-white border-opacity-30 rounded px-2 py-1"
                  >
                    <option value={-1} className="bg-black">Auto</option>
                    {qualityLevels.map((level, index) => (
                      <option key={index} value={index} className="bg-black">
                        {level.height}p
                      </option>
                    ))}
                  </select>
                )}

                {/* Fullscreen */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="text-white hover:bg-white hover:bg-opacity-20"
                >
                  {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HlsVideoPlayer;