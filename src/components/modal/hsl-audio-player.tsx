import React, { useEffect, useState, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Volume1,
  Volume2,
  VolumeX,
  Mic,
  Loader2,
  RefreshCw,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

const HLSAudioPlayer = ({ src, title }: { src: string; title?: string }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const hlsRef = useRef<any>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playerType, setPlayerType] = useState<"native" | "hls" | "fallback">(
    "fallback"
  );
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

  // Reset audio element and all states
  const resetAudio = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio.src = "";
      // Remove all existing event listeners by cloning and replacing the element
      const newAudio = audio.cloneNode() as HTMLAudioElement;
      audio.parentNode?.replaceChild(newAudio, audio);
      // Update the ref to point to the new element
      (audioRef as any).current = newAudio;
    }
    
    // Reset all states
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setError(null);
    setIsLoading(true);
    setPlayerType("fallback");
    
    // Cleanup HLS
    cleanup();
  };

  const tryNativeFallback = () => {
    const audio = audioRef.current;
    if (!audio) return;

    console.log("🔄 Trying native HLS fallback...");
    cleanup();

    if (
      audio.canPlayType("application/vnd.apple.mpegurl") ||
      audio.canPlayType("application/x-mpegURL")
    ) {
      console.log("✅ Native HLS supported");
      audio.src = src;
      setPlayerType("native");
    } else {
      setError("HLS streaming not supported in this browser.");
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

    console.log("🎯 Initializing audio:", { src, isHLSUrl });
    setIsLoading(true);
    setError(null);

    try {
      if (isHLSUrl) {
        try {
          const { default: Hls } = await import("hls.js");

          if (Hls.isSupported()) {
            console.log("✅ Using HLS.js");
            cleanup();

            const hls = new Hls({
              debug: false,
              enableWorker: true,
              maxBufferLength: 30,
            });

            hlsRef.current = hls;

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              console.log("✅ HLS MANIFEST_PARSED");
              setPlayerType("hls");
              setIsLoading(false);
              setRetryCount(0);
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
              console.error("❌ HLS ERROR:", data);

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
          console.error("❌ HLS.js load failed:", hlsError);
          tryNativeFallback();
        }
      } else {
        console.log("✅ Using native audio");
        audio.src = src;
        setPlayerType("native");
      }
    } catch (err) {
      console.error("❌ Audio initialization error:", err);
      setError(
        `Failed to initialize: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!src) {
      setError("No audio source provided");
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
      console.log("✅ Audio loadedmetadata", audio.duration);
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
        setIsLoading(false);
        setError(null);
      }
    };

    const handleCanPlay = () => {
      console.log("✅ Audio canplay");
      setIsLoading(false);
      setError(null);
    };

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handlePlay = () => {
      console.log("▶️ Audio playing");
      setIsPlaying(true);
    };
    const handlePause = () => {
      console.log("⏸️ Audio paused");
      setIsPlaying(false);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = () => {
      const errorCode = audio.error?.code;
      let userMessage = "Audio playback failed";
      console.error("❌ Audio error:", errorCode, audio.error);

      if (
        errorCode === MediaError.MEDIA_ERR_DECODE &&
        isHLSUrl &&
        playerType === "native"
      ) {
        console.log("🔄 Native decode failed, switching to HLS.js...");
        setTimeout(() => {
          setRetryCount(0);
          initializeAudio();
        }, 1000);
        return;
      }

      switch (errorCode) {
        case MediaError.MEDIA_ERR_NETWORK:
          userMessage = "Network error - check your connection";
          break;
        case MediaError.MEDIA_ERR_DECODE:
          userMessage = "Audio format not supported";
          break;
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
          userMessage = "Audio format not supported by browser";
          break;
      }

      setError(userMessage);
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
  }, [playerType, isHLSUrl, retryCount]); // Add retryCount as dependency

  const togglePlayPause = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const audio = audioRef.current;
    if (!audio || isLoading || error) {
      console.warn("Cannot play: audio not ready", { 
        audioExists: !!audio, 
        isLoading, 
        error, 
        duration 
      });
      return;
    }

    try {
      if (isPlaying) {
        console.log("⏸️ Pausing audio");
        audio.pause();
      } else {
        console.log("▶️ Attempting to play audio");
        await audio.play();
      }
    } catch (err) {
      console.error("❌ Playback error:", err);
      setError(
        `Playback failed: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
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
    
    console.log("🔄 Manual retry triggered - Full reset");
    setRetryCount(0);
    resetAudio(); // Complete reset
    
    // Wait a bit then reinitialize
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

  // Error State
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center space-x-2 text-red-700 mb-3">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm font-medium">Audio Player Error</span>
        </div>

        <p className="text-red-600 text-sm mb-4">{error}</p>

        <div className="flex flex-wrap gap-3 mb-4">
          <Button variant="outline" size="sm" onClick={retry}>
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.open(src, "_blank");
            }}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Test Direct
          </Button>
        </div>

        <details className="text-xs text-gray-600">
          <summary className="cursor-pointer hover:text-gray-800 mb-2">
            Debug Information
          </summary>
          <div className="bg-gray-100 p-2 rounded text-xs font-mono">
            <p>
              <strong>Source:</strong> {src}
            </p>
            <p>
              <strong>Type:</strong> {isHLSUrl ? "HLS Stream" : "Regular Audio"}
            </p>
            <p>
              <strong>Player:</strong> {playerType}
            </p>
            <p>
              <strong>Retries:</strong> {retryCount}
            </p>
            <p>
              <strong>Loading:</strong> {isLoading ? "Yes" : "No"}
            </p>
            <p>
              <strong>Duration:</strong> {duration}
            </p>
          </div>
        </details>

        <div className="mt-4 p-3 bg-gray-50 rounded border-t">
          <p className="text-xs text-gray-600 mb-2">Browser fallback:</p>
          <audio 
            src={src} 
            controls 
            preload="metadata" 
            className="w-full"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>
    );
  }

  // Main Player UI
  return (
    <div
      className="bg-white rounded-lg p-6 shadow-sm border"
      onClick={(e) => e.stopPropagation()}
    >
      <audio
        ref={audioRef}
        preload="metadata"
        className="hidden"
        crossOrigin="anonymous"
        playsInline
      />

      {title && (
        <div className="mb-4">
          <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
            <Volume2 className="h-4 w-4 text-purple-600" />
            <span>{title}</span>
            {isHLSUrl && (
              <Badge variant="outline" className="text-xs">
                {playerType === "hls" ? "HLS.js" : "Native HLS"}
              </Badge>
            )}
            {/* Debug info */}
            <Badge variant="outline" className="text-xs bg-blue-50">
              {isLoading ? "Loading" : duration > 0 ? "Ready" : "No Duration"}
            </Badge>
          </h4>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
          <span className="ml-2 text-sm text-gray-600">
            Loading {isHLSUrl ? "HLS stream" : "audio"}...
            {retryCount > 0 && ` (attempt ${retryCount + 1})`}
          </span>
        </div>
      )}

      {!isLoading && !error && (
        <div className="space-y-4">
          {/* Main Controls */}
          <div className="flex items-center space-x-4">
            <Button
              onClick={togglePlayPause}
              disabled={!duration || isLoading}
              className="bg-purple-600 hover:bg-purple-700 min-w-[50px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </Button>

            <div className="flex items-center space-x-2 text-sm text-gray-600 min-w-[100px]">
              <span className="font-mono">{formatTime(currentTime)}</span>
              {duration > 0 && (
                <>
                  <span>/</span>
                  <span className="font-mono">{formatTime(duration)}</span>
                </>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={retry}
              className="ml-auto"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={restart}
              disabled={!duration}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress Bar */}
          {duration > 0 && (
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max={duration}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${
                    (currentTime / duration) * 100
                  }%, #e5e7eb ${
                    (currentTime / duration) * 100
                  }%, #e5e7eb 100%)`,
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 font-mono">
                <span>0:00</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          )}

          {/* Volume Control */}
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={toggleMute}>
              {isMuted || volume === 0 ? (
                <VolumeX className="h-4 w-4" />
              ) : volume < 0.5 ? (
                <Volume1 className="h-4 w-4" />
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
              onChange={handleVolumeChange}
              className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />

            <span className="text-xs text-gray-500 w-8 text-right font-mono">
              {Math.round((isMuted ? 0 : volume) * 100)}%
            </span>
          </div>

          {/* Audio Info */}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
            <div className="flex items-center space-x-2">
              <Mic className="h-3 w-3" />
              <span>
                {isHLSUrl ? "HLS Audio Stream" : "Audio File"} ({playerType})
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.open(src, "_blank");
              }}
              className="text-xs p-1 h-auto opacity-50 hover:opacity-100"
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HLSAudioPlayer;