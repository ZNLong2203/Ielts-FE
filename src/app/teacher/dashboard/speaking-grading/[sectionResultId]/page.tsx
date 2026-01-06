"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import {
  getSpeakingSubmissionForGrading,
  submitSpeakingGrading,
  SubmitSpeakingGradingDto,
  SpeakingSubmissionDetail,
} from "@/api/mockTest";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, User, BookOpen, Mic, Play, Pause } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

const SpeakingGradingDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const sectionResultId = params.sectionResultId as string;

  const [overallScore, setOverallScore] = useState<number>(0);
  const [fluencyCoherence, setFluencyCoherence] = useState<number>(0);
  const [lexicalResource, setLexicalResource] = useState<number>(0);
  const [grammaticalRange, setGrammaticalRange] = useState<number>(0);
  const [pronunciation, setPronunciation] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>("");
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [audioDurations, setAudioDurations] = useState<Record<string, number>>({});

  const { data: submission, isLoading, error } = useQuery({
    queryKey: ["speakingSubmission", sectionResultId],
    queryFn: () => getSpeakingSubmissionForGrading(sectionResultId),
  });

  const submitMutation = useMutation({
    mutationFn: (gradingData: SubmitSpeakingGradingDto) =>
      submitSpeakingGrading(sectionResultId, gradingData),
    onSuccess: () => {
      toast.success("Grading submitted successfully!");
      queryClient.invalidateQueries({ queryKey: ["pendingSpeakingSubmissions"] });
      queryClient.invalidateQueries({ queryKey: ["gradedSpeakingSubmissions"] });
      router.push("/teacher/dashboard/speaking-grading");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Failed to submit grading");
    },
  });

  // Parse response - backend returns {success: true, data: {...}}
  const submissionData = submission 
    ? ((submission as { data?: SpeakingSubmissionDetail } & SpeakingSubmissionDetail)?.data || (submission as SpeakingSubmissionDetail))
    : null;

  // Parse detailed_answers
  interface DetailedAnswers {
    all_questions?: Array<{
      question_id: string;
      question_text: string;
      audio_url: string;
      part_type: 'part_1' | 'part_2' | 'part_3';
    }>;
    overall_score?: number;
    fluency_coherence?: number;
    lexical_resource?: number;
    grammatical_range_accuracy?: number;
    pronunciation?: number;
    teacher_feedback?: string;
  }

  let detailedAnswers: DetailedAnswers | null = null;
  if (submissionData?.detailed_answers) {
    if (typeof submissionData.detailed_answers === 'string') {
      try {
        detailedAnswers = JSON.parse(submissionData.detailed_answers) as DetailedAnswers;
      } catch (e) {
        console.error("Failed to parse detailed_answers:", e);
      }
    } else {
      detailedAnswers = submissionData.detailed_answers as DetailedAnswers;
    }
  }

  const questions = detailedAnswers?.all_questions || [];

  // Check if submission is already graded
  const isGraded = submissionData?.graded_at != null;
  const bandScore = submissionData?.band_score || submissionData?.teacher_score;
  const feedbackText = submissionData?.teacher_feedback || detailedAnswers?.teacher_feedback;

  // Load existing scores and feedback if already graded
  useEffect(() => {
    if (isGraded && detailedAnswers) {
      setOverallScore(detailedAnswers.overall_score || 0);
      setFluencyCoherence(detailedAnswers.fluency_coherence || 0);
      setLexicalResource(detailedAnswers.lexical_resource || 0);
      setGrammaticalRange(detailedAnswers.grammatical_range_accuracy || 0);
      setPronunciation(detailedAnswers.pronunciation || 0);
      if (feedbackText) {
        setFeedback(feedbackText);
      }
    }
  }, [isGraded, detailedAnswers, feedbackText]);

  const handleSubmit = () => {
    if (!overallScore) {
      toast.error("Please provide an overall score");
      return;
    }

    const gradingData: SubmitSpeakingGradingDto = {
      overall_score: overallScore,
      fluency_coherence: fluencyCoherence || undefined,
      lexical_resource: lexicalResource || undefined,
      grammatical_range_accuracy: grammaticalRange || undefined,
      pronunciation: pronunciation || undefined,
      feedback: feedback || undefined,
    };

    submitMutation.mutate(gradingData);
  };

  const handleAudioPlay = (questionId: string, audioUrl: string) => {
    if (playingAudioId === questionId) {
      // Stop audio
      const audio = document.getElementById(`audio-${questionId}`) as HTMLAudioElement;
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      setPlayingAudioId(null);
    } else {
      // Stop any currently playing audio
      if (playingAudioId) {
        const prevAudio = document.getElementById(`audio-${playingAudioId}`) as HTMLAudioElement;
        if (prevAudio) {
          prevAudio.pause();
          prevAudio.currentTime = 0;
        }
      }
      // Play new audio
      const audio = document.getElementById(`audio-${questionId}`) as HTMLAudioElement;
      if (audio) {
        // Track duration while playing if not already known
        if (!audioDurations[questionId]) {
          const checkDuration = () => {
            if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration) && audio.duration > 0) {
              handleAudioMetadataLoaded(questionId, audio.duration);
              audio.removeEventListener('timeupdate', checkDuration);
            }
          };
          audio.addEventListener('timeupdate', checkDuration);
        }
        
        audio.play();
        setPlayingAudioId(questionId);
      }
    }
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (playingAudioId) {
        const audio = document.getElementById(`audio-${playingAudioId}`) as HTMLAudioElement;
        if (audio) {
          audio.pause();
        }
      }
    };
  }, [playingAudioId]);

  // Handler for audio metadata loaded
  const handleAudioMetadataLoaded = (questionId: string, duration: number) => {
    if (duration && !isNaN(duration) && isFinite(duration) && duration > 0) {
      setAudioDurations((prev) => {
        if (!prev[questionId]) {
          return {
            ...prev,
            [questionId]: duration,
          };
        }
        return prev;
      });
    }
  };

  // Fetch audio duration using fetch API as fallback
  const fetchAudioDuration = async (audioUrl: string, questionId: string) => {
    try {
      const response = await fetch(audioUrl, { method: 'HEAD' });
      const contentLength = response.headers.get('content-length');
      
      if (contentLength) {
        // Try to estimate duration from file size (rough estimate)
        // This is not accurate but better than nothing
        // For better accuracy, we need to actually decode the audio
        const audioElement = new Audio(audioUrl);
        audioElement.preload = 'metadata';
        
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('Timeout')), 5000);
          
          audioElement.addEventListener('loadedmetadata', () => {
            clearTimeout(timeout);
            const duration = audioElement.duration;
            if (duration && !isNaN(duration) && isFinite(duration) && duration > 0) {
              handleAudioMetadataLoaded(questionId, duration);
            }
            resolve();
          });
          
          audioElement.addEventListener('error', () => {
            clearTimeout(timeout);
            reject(new Error('Failed to load audio'));
          });
          
          audioElement.load();
        });
      }
    } catch (error) {
      console.warn(`Failed to fetch audio duration for ${questionId}:`, error);
    }
  };

  // Force load audio metadata when questions change
  useEffect(() => {
    if (questions.length === 0) return;

    // Wait for DOM to be ready
    const timer = setTimeout(() => {
      questions.forEach((q) => {
        if (!audioDurations[q.question_id]) {
          const audio = document.getElementById(`audio-${q.question_id}`) as HTMLAudioElement;
          if (audio) {
            // Try to load metadata
            audio.load();
            
            // Retry getting duration multiple times from DOM audio element
            const retryGetDuration = (attempt: number = 0) => {
              if (attempt > 5) {
                // If still no duration after retries, try fetch method
                fetchAudioDuration(q.audio_url, q.question_id);
                return;
              }
              
              setTimeout(() => {
                if (audio.readyState >= 2 && audio.duration && !isNaN(audio.duration) && isFinite(audio.duration) && audio.duration > 0) {
                  handleAudioMetadataLoaded(q.question_id, audio.duration);
                } else if (attempt < 5) {
                  retryGetDuration(attempt + 1);
                } else {
                  // Last attempt failed, try fetch method
                  fetchAudioDuration(q.audio_url, q.question_id);
                }
              }, 500 * (attempt + 1)); // Increasing delay: 500ms, 1000ms, 1500ms...
            };
            
            retryGetDuration();
          } else {
            // Audio element not found, try fetch method directly
            fetchAudioDuration(q.audio_url, q.question_id);
          }
        }
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [questions]);

  // Format duration helper
  const formatDuration = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return "Loading...";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading submission...</p>
        </div>
      </div>
    );
  }

  if (error || !submission || !submissionData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>Failed to load submission</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Group questions by part type
  const part1Questions = questions.filter(q => q.part_type === 'part_1');
  const part2Questions = questions.filter(q => q.part_type === 'part_2');
  const part3Questions = questions.filter(q => q.part_type === 'part_3');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isGraded ? "View Speaking Submission" : "Grade Speaking Submission"}
        </h1>
        {isGraded && bandScore != null && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-sm text-gray-600">Overall Band Score:</span>
                <span className="ml-2 text-2xl font-bold text-green-600">
                  {typeof bandScore === 'number' 
                    ? bandScore.toFixed(1)
                    : parseFloat(String(bandScore)).toFixed(1)}
                </span>
              </div>
              {submissionData.graded_at && (
                <div className="text-sm text-gray-600">
                  Graded on: {format(new Date(submissionData.graded_at), "MMM dd, yyyy 'at' HH:mm")}
                </div>
              )}
            </div>
          </div>
        )}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>{submissionData.test_results?.users?.full_name}</span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>{submissionData.test_results?.mock_tests?.title}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mic className="h-4 w-4" />
            <span>
              {submissionData.created_at
                ? `Submitted ${format(new Date(submissionData.created_at), "MMM dd, yyyy 'at' HH:mm")}`
                : "Submitted recently"}
            </span>
          </div>
        </div>
      </div>

      {/* Student Audio Recordings */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Student Audio Recordings</CardTitle>
          <CardDescription>Listen to the student's speaking responses</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Part 1 Questions */}
          {part1Questions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Part 1: Introduction & Interview</h3>
              <div className="space-y-4">
                {part1Questions.map((q, index) => (
                  <div key={q.question_id} className="p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-gray-600 mb-1">Question {index + 1}</div>
                        <p className="text-gray-800">{q.question_text}</p>
                      </div>
                    </div>
                    <audio
                      id={`audio-${q.question_id}`}
                      src={q.audio_url}
                      onEnded={(e) => {
                        const audio = e.currentTarget;
                        // Try to get duration when audio ends (sometimes duration is only available after playing)
                        if (!audioDurations[q.question_id] && audio.duration && !isNaN(audio.duration) && isFinite(audio.duration) && audio.duration > 0) {
                          handleAudioMetadataLoaded(q.question_id, audio.duration);
                        }
                        setPlayingAudioId(null);
                      }}
                      onLoadedMetadata={(e) => {
                        const audio = e.currentTarget;
                        // Wait a bit for duration to be available
                        setTimeout(() => {
                          const duration = audio.duration;
                          console.log(`Audio metadata loaded for question ${q.question_id}:`, {
                            duration,
                            readyState: audio.readyState,
                            networkState: audio.networkState
                          });
                          
                          if (duration && !isNaN(duration) && isFinite(duration) && duration > 0) {
                            handleAudioMetadataLoaded(q.question_id, duration);
                          }
                        }, 100);
                      }}
                      onCanPlay={(e) => {
                        const audio = e.currentTarget;
                        const duration = audio.duration;
                        // Try to get duration when audio can play
                        if (duration && !isNaN(duration) && isFinite(duration) && duration > 0 && !audioDurations[q.question_id]) {
                          handleAudioMetadataLoaded(q.question_id, duration);
                        }
                      }}
                      onLoadedData={(e) => {
                        const audio = e.currentTarget;
                        const duration = audio.duration;
                        // Try again when data is loaded
                        if (duration && !isNaN(duration) && isFinite(duration) && duration > 0 && !audioDurations[q.question_id]) {
                          handleAudioMetadataLoaded(q.question_id, duration);
                        }
                      }}
                      onError={(e) => {
                        console.error(`Error loading audio for question ${q.question_id}:`, e);
                      }}
                      preload="metadata"
                      crossOrigin="anonymous"
                      className="hidden"
                    />
                    <div className="flex items-center justify-between gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleAudioPlay(q.question_id, q.audio_url)}
                        className="flex-1"
                      >
                        {playingAudioId === q.question_id ? (
                          <>
                            <Pause className="mr-2 h-4 w-4" />
                            Pause Audio
                          </>
                        ) : (
                          <>
                            <Play className="mr-2 h-4 w-4" />
                            Play Audio
                          </>
                        )}
                      </Button>
                      <div className="text-sm text-gray-600 font-medium min-w-[80px] text-right">
                        {audioDurations[q.question_id] 
                          ? formatDuration(audioDurations[q.question_id])
                          : "Loading..."}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Part 2 Questions */}
          {part2Questions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Part 2: Long Turn</h3>
              <div className="space-y-4">
                {part2Questions.map((q, index) => (
                  <div key={q.question_id} className="p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-gray-600 mb-1">Question {index + 1}</div>
                        <p className="text-gray-800">{q.question_text}</p>
                      </div>
                    </div>
                    <audio
                      id={`audio-${q.question_id}`}
                      src={q.audio_url}
                      onEnded={(e) => {
                        const audio = e.currentTarget;
                        // Try to get duration when audio ends (sometimes duration is only available after playing)
                        if (!audioDurations[q.question_id] && audio.duration && !isNaN(audio.duration) && isFinite(audio.duration) && audio.duration > 0) {
                          handleAudioMetadataLoaded(q.question_id, audio.duration);
                        }
                        setPlayingAudioId(null);
                      }}
                      onLoadedMetadata={(e) => {
                        const audio = e.currentTarget;
                        // Wait a bit for duration to be available
                        setTimeout(() => {
                          const duration = audio.duration;
                          console.log(`Audio metadata loaded for question ${q.question_id}:`, {
                            duration,
                            readyState: audio.readyState,
                            networkState: audio.networkState
                          });
                          
                          if (duration && !isNaN(duration) && isFinite(duration) && duration > 0) {
                            handleAudioMetadataLoaded(q.question_id, duration);
                          }
                        }, 100);
                      }}
                      onCanPlay={(e) => {
                        const audio = e.currentTarget;
                        const duration = audio.duration;
                        // Try to get duration when audio can play
                        if (duration && !isNaN(duration) && isFinite(duration) && duration > 0 && !audioDurations[q.question_id]) {
                          handleAudioMetadataLoaded(q.question_id, duration);
                        }
                      }}
                      onLoadedData={(e) => {
                        const audio = e.currentTarget;
                        const duration = audio.duration;
                        // Try again when data is loaded
                        if (duration && !isNaN(duration) && isFinite(duration) && duration > 0 && !audioDurations[q.question_id]) {
                          handleAudioMetadataLoaded(q.question_id, duration);
                        }
                      }}
                      onError={(e) => {
                        console.error(`Error loading audio for question ${q.question_id}:`, e);
                      }}
                      preload="metadata"
                      crossOrigin="anonymous"
                      className="hidden"
                    />
                    <div className="flex items-center justify-between gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleAudioPlay(q.question_id, q.audio_url)}
                        className="flex-1"
                      >
                        {playingAudioId === q.question_id ? (
                          <>
                            <Pause className="mr-2 h-4 w-4" />
                            Pause Audio
                          </>
                        ) : (
                          <>
                            <Play className="mr-2 h-4 w-4" />
                            Play Audio
                          </>
                        )}
                      </Button>
                      <div className="text-sm text-gray-600 font-medium min-w-[80px] text-right">
                        {audioDurations[q.question_id] 
                          ? formatDuration(audioDurations[q.question_id])
                          : "Loading..."}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Part 3 Questions */}
          {part3Questions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Part 3: Discussion</h3>
              <div className="space-y-4">
                {part3Questions.map((q, index) => (
                  <div key={q.question_id} className="p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-gray-600 mb-1">Question {index + 1}</div>
                        <p className="text-gray-800">{q.question_text}</p>
                      </div>
                    </div>
                    <audio
                      id={`audio-${q.question_id}`}
                      src={q.audio_url}
                      onEnded={(e) => {
                        const audio = e.currentTarget;
                        // Try to get duration when audio ends (sometimes duration is only available after playing)
                        if (!audioDurations[q.question_id] && audio.duration && !isNaN(audio.duration) && isFinite(audio.duration) && audio.duration > 0) {
                          handleAudioMetadataLoaded(q.question_id, audio.duration);
                        }
                        setPlayingAudioId(null);
                      }}
                      onLoadedMetadata={(e) => {
                        const audio = e.currentTarget;
                        // Wait a bit for duration to be available
                        setTimeout(() => {
                          const duration = audio.duration;
                          console.log(`Audio metadata loaded for question ${q.question_id}:`, {
                            duration,
                            readyState: audio.readyState,
                            networkState: audio.networkState
                          });
                          
                          if (duration && !isNaN(duration) && isFinite(duration) && duration > 0) {
                            handleAudioMetadataLoaded(q.question_id, duration);
                          }
                        }, 100);
                      }}
                      onCanPlay={(e) => {
                        const audio = e.currentTarget;
                        const duration = audio.duration;
                        // Try to get duration when audio can play
                        if (duration && !isNaN(duration) && isFinite(duration) && duration > 0 && !audioDurations[q.question_id]) {
                          handleAudioMetadataLoaded(q.question_id, duration);
                        }
                      }}
                      onLoadedData={(e) => {
                        const audio = e.currentTarget;
                        const duration = audio.duration;
                        // Try again when data is loaded
                        if (duration && !isNaN(duration) && isFinite(duration) && duration > 0 && !audioDurations[q.question_id]) {
                          handleAudioMetadataLoaded(q.question_id, duration);
                        }
                      }}
                      onError={(e) => {
                        console.error(`Error loading audio for question ${q.question_id}:`, e);
                      }}
                      preload="metadata"
                      crossOrigin="anonymous"
                      className="hidden"
                    />
                    <div className="flex items-center justify-between gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleAudioPlay(q.question_id, q.audio_url)}
                        className="flex-1"
                      >
                        {playingAudioId === q.question_id ? (
                          <>
                            <Pause className="mr-2 h-4 w-4" />
                            Pause Audio
                          </>
                        ) : (
                          <>
                            <Play className="mr-2 h-4 w-4" />
                            Play Audio
                          </>
                        )}
                      </Button>
                      <div className="text-sm text-gray-600 font-medium min-w-[80px] text-right">
                        {audioDurations[q.question_id] 
                          ? formatDuration(audioDurations[q.question_id])
                          : "Loading..."}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {questions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No audio recordings found
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grading Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Grading</CardTitle>
          <CardDescription>Provide scores and feedback</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isGraded ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-3">Scores</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-600">Overall Score</Label>
                    <div className="text-lg font-bold text-green-600">
                      {overallScore ? (typeof overallScore === 'number' ? overallScore.toFixed(1) : parseFloat(String(overallScore)).toFixed(1)) : "N/A"}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Fluency & Coherence</Label>
                    <div className="text-lg font-semibold">
                      {fluencyCoherence || "N/A"}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Lexical Resource</Label>
                    <div className="text-lg font-semibold">
                      {lexicalResource || "N/A"}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Grammatical Range & Accuracy</Label>
                    <div className="text-lg font-semibold">
                      {grammaticalRange || "N/A"}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Pronunciation</Label>
                    <div className="text-lg font-semibold">
                      {pronunciation || "N/A"}
                    </div>
                  </div>
                </div>
              </div>
              {feedback && (
                <div>
                  <Label className="text-base font-semibold mb-2 block">Feedback</Label>
                  <div className="p-4 bg-gray-50 rounded-lg border min-h-[100px] whitespace-pre-wrap text-gray-800">
                    {feedback}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Overall Score (0-9) *</Label>
                  <Input
                    type="number"
                    min="0"
                    max="9"
                    step="0.5"
                    value={overallScore || ""}
                    onChange={(e) => setOverallScore(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label>Fluency & Coherence</Label>
                  <Input
                    type="number"
                    min="0"
                    max="9"
                    step="0.5"
                    value={fluencyCoherence || ""}
                    onChange={(e) => setFluencyCoherence(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label>Lexical Resource</Label>
                  <Input
                    type="number"
                    min="0"
                    max="9"
                    step="0.5"
                    value={lexicalResource || ""}
                    onChange={(e) => setLexicalResource(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label>Grammatical Range & Accuracy</Label>
                  <Input
                    type="number"
                    min="0"
                    max="9"
                    step="0.5"
                    value={grammaticalRange || ""}
                    onChange={(e) => setGrammaticalRange(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label>Pronunciation</Label>
                  <Input
                    type="number"
                    min="0"
                    max="9"
                    step="0.5"
                    value={pronunciation || ""}
                    onChange={(e) => setPronunciation(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div>
                <Label>Feedback</Label>
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={6}
                  placeholder="Provide detailed feedback for the speaking test..."
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Submit Button - Only show if not graded */}
      {!isGraded && (
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitMutation.isPending || !overallScore}
            className="bg-green-600 hover:bg-green-700"
          >
            {submitMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Submit Grading
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default SpeakingGradingDetailPage;

