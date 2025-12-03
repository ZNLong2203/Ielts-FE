"use client";
import React, { useEffect, useState, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Loader2,
  RefreshCw,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

interface CompactAudioPlayerProps {
  src: string;
  title?: string;
  showTitle?: boolean;
  showProgress?: boolean;
  showVolume?: boolean;
  className?: string;
}

const CompactAudioPlayer = ({ 
  src, 
  title,
  showTitle = false,
  showProgress = true,
  showVolume = false,
  className = ""
}: CompactAudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const hlsRef = useRef<any>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playerType, setPlayerType] = useState<"native" | "hls" | "fallback">("fallback");
  const [retryCount, setRetryCount] = useState(0);

  const isHLSUrl = src?.includes(".m3u8");

  const cleanup = () => {
    if (hlsRef.current) {
      try {
        hlsRef.current.destroy();
        hlsRef.current = null;
      } catch (err) {
        console.warn("HLS cleanup error:", err);
      }
    }
  };

  const resetAudio = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio.src = "";
      const newAudio = audio.cloneNode() as HTMLAudioElement;
      audio.parentNode?.replaceChild(newAudio, audio);
      (audioRef as any).current = newAudio;
    }
    
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setError(null);
    setIsLoading(true);
    setPlayerType("fallback");
    cleanup();
  };

  const tryNativeFallback = () => {
    const audio = audioRef.current;
    if (!audio) return;

    cleanup();
    if (
      audio.canPlayType("application/vnd.apple.mpegurl") ||
      audio.canPlayType("application/x-mpegURL")
    ) {
      audio.src = src;
      setPlayerType("native");
    } else {
      setError("Audio format not supported");
      setIsLoading(false);
    }
  };

  const initializeAudio = async () => {
    const audio = audioRef.current;
    if (!audio || !src) {
      setError("No audio source");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (isHLSUrl) {
        try {
          const { default: Hls } = await import("hls.js");

          if (Hls.isSupported()) {
            cleanup();
            const hls = new Hls({
              debug: false,
              enableWorker: true,
              maxBufferLength: 30,
            });

            hlsRef.current = hls;

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              setPlayerType("hls");
              setIsLoading(false);
              setRetryCount(0);
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
              if (data.fatal) {
                if (retryCount < 2) {
                  setTimeout(() => {
                    if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                      hls.startLoad();
                    } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                      hls.recoverMediaError();
                    }
                    setRetryCount((prev) => prev + 1);
                  }, 1000);
                } else {
                  tryNativeFallback();
                }
              }
            });

            hls.loadSource(src);
            hls.attachMedia(audio);
          } else {
            tryNativeFallback();
          }
        } catch (hlsError) {
          tryNativeFallback();
        }
      } else {
        audio.src = src;
        setPlayerType("native");
      }
    } catch (err) {
      setError("Failed to load audio");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!src) {
      setError("No audio source");
      setIsLoading(false);
      return;
    }
    initializeAudio();
    return cleanup;
  }, [src]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
        setIsLoading(false);
        setError(null);
      }
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      setError(null);
    };

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = () => {
      const errorCode = audio.error?.code;
      if (
        errorCode === MediaError.MEDIA_ERR_DECODE &&
        isHLSUrl &&
        playerType === "native"
      ) {
        setTimeout(() => {
          setRetryCount(0);
          initializeAudio();
        }, 1000);
        return;
      }
      setError("Audio playback failed");
      setIsLoading(false);
    };

    const events = [
      ["loadedmetadata", handleLoadedMetadata],
      ["canplay", handleCanPlay],
      ["timeupdate", handleTimeUpdate],
      ["play", handlePlay],
      ["pause", handlePause],
      ["ended", handleEnded],
      ["error", handleError],
    ] as const;

    events.forEach(([event, handler]) => {
      audio.addEventListener(event, handler);
    });

    return () => {
      events.forEach(([event, handler]) => {
        audio.removeEventListener(event, handler);
      });
    };
  }, [playerType, isHLSUrl, retryCount]);

  const togglePlayPause = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const audio = audioRef.current;
    if (!audio || isLoading || error) return;

    try {
      if (isPlaying) {
        audio.pause();
      } else {
        await audio.play();
      }
    } catch (err) {
      setError("Playback failed");
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (!audioRef.current || !duration) return;
    const time = parseFloat(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!audioRef.current) return;
    const vol = parseFloat(e.target.value);
    audioRef.current.volume = vol;
    setVolume(vol);
    setIsMuted(vol === 0);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!audioRef.current) return;

    if (isMuted) {
      audioRef.current.volume = volume > 0 ? volume : 0.5;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const restart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
  };

  const retry = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setRetryCount(0);
    resetAudio();
    setTimeout(() => {
      initializeAudio();
    }, 100);
  };

  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Error State - Compact
  if (error) {
    return (
      <div 
        className={`bg-red-50 border border-red-200 rounded-lg p-3 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
            <span className="text-sm text-red-700">Audio Error</span>
          </div>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm" onClick={retry} className="h-6 w-6 p-0">
              <RefreshCw className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.open(src, "_blank");
              }}
              className="h-6 w-6 p-0"
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        {/* Fallback native audio */}
        <div className="mt-2">
          <audio 
            src={src} 
            controls 
            preload="metadata" 
            className="w-full h-8"
            onClick={(e) => e.stopPropagation()}
            style={{ height: '32px' }}
          />
        </div>
      </div>
    );
  }

  // Main Compact Player UI
  return (
    <div
      className={`bg-purple-50 border border-purple-200 rounded-lg p-3 ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      <audio
        ref={audioRef}
        preload="metadata"
        className="hidden"
        crossOrigin="anonymous"
        playsInline
      />

      {/* Title (optional) */}
      {showTitle && title && (
        <div className="flex items-center space-x-2 mb-2">
          <Volume2 className="h-3 w-3 text-black" />
          <span className="text-xs font-medium text-black">{title}</span>
          {isHLSUrl && (
            <Badge variant="outline" className="text-xs bg-purple-100">
              HLS
            </Badge>
          )}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-2">
          <Loader2 className="h-4 w-4 animate-spin text-black mr-2" />
          <span className="text-xs text-black">Loading...</span>
        </div>
      )}

      {/* Main Controls */}
      {!isLoading && !error && (
        <div className="space-y-2">
          {/* Control Row */}
          <div className="flex items-center space-x-2">
            {/* Play/Pause */}
            <Button
              onClick={togglePlayPause}
              disabled={!duration}
              size="sm"
              className="h-8 w-8 p-0 bg-black disabled:opacity-50"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4 ml-0.5" />
              )}
            </Button>

            {/* Time Display */}
            <div className="flex items-center space-x-1 text-xs text-black font-mono min-w-[80px]">
              <span>{formatTime(currentTime)}</span>
              {duration > 0 && (
                <>
                  <span>/</span>
                  <span>{formatTime(duration)}</span>
                </>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-1 ml-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={restart}
                disabled={!duration}
                className="h-6 w-6 p-0 text-black hover:bg-gray-100"
              >
                <RotateCcw className="h-3 w-3" />
              </Button>

              {/* Volume (optional) */}
              {showVolume && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className="h-6 w-6 p-0 text-black hover:bg-gray-100"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="h-3 w-3" />
                  ) : (
                    <Volume2 className="h-3 w-3" />
                  )}
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.open(src, "_blank");
                }}
                className="h-6 w-6 p-0 text-black hover:bg-gray-100"
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Progress Bar (optional) */}
          {showProgress && duration > 0 && (
            <div className="space-y-1">
              <input
                type="range"
                min="0"
                max={duration}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-black rounded-lg appearance-none cursor-pointer slider-black"
               style={{
                  background: `linear-gradient(to right, #ffffff 0%, #ffffff ${
                    (currentTime / duration) * 100
                  }%, #374151 ${
                    (currentTime / duration) * 100
                  }%, #374151 100%)`,
                }}
              />
            </div>
          )}

          {/* Volume Control (optional) */}
          {showVolume && (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={toggleMute} className="h-6 w-6 p-0">
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-3 w-3" />
                ) : (
                  <Volume2 className="h-3 w-3" />
                )}
              </Button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="flex-1 h-1 bg-black rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs text-black w-8 text-right font-mono">
                {Math.round((isMuted ? 0 : volume) * 100)}%
              </span>
            </div>
          )}
        </div>
      )}

      {/* Add custom styles */}
      <style jsx>{`
        .slider-blue::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #9333ea;
          cursor: pointer;
        }
        .slider-blue::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #9333ea;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
};

export default CompactAudioPlayer;