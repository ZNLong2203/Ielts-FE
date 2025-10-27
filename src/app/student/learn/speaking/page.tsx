'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { 
  transcribeAndGrade,
} from '@/api/speaking';
import { 
  Loader2, 
  Mic, 
  CheckCircle, 
  AlertCircle, 
  Upload,
  Pause,
  X
} from 'lucide-react';

export default function SpeakingPage() {
  const router = useRouter();
  const [partType, setPartType] = useState<'part_1' | 'part_2' | 'part_3'>('part_1');
  const [question, setQuestion] = useState('');
  const [context, setContext] = useState('');
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAudioBlob(file);
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
    }
  };

  const clearAudio = () => {
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
  };

  const handleSubmit = async () => {
    if (!audioBlob) {
      setError('Please record or upload an audio file first');
      return;
    }

    if (!question.trim()) {
      setError('Please enter a question');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const audioFile = new File([audioBlob], 'speaking-recording.webm', {
        type: audioBlob.type,
      });

      const response = await transcribeAndGrade(audioFile, {
        partType,
        questions: [{
          question: question.trim(),
          context: context.trim() || undefined,
        }],
        targetDuration: partType === 'part_1' ? '4-5 minutes' : partType === 'part_2' ? '1-2 minutes' : '4-5 minutes',
        additionalInstructions: additionalInstructions.trim() || undefined,
      });

      localStorage.setItem('speakingResult', JSON.stringify(response));
      router.push('/student/learn/speaking/results');
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while processing the audio');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 container mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-6">
        <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
          <Mic className="h-8 w-8" />
          IELTS Speaking Practice
        </h1>
        <p className="text-blue-100">Practice and evaluate your Speaking skills with AI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Test Setup */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>IELTS Speaking Test Configuration</CardTitle>
              <CardDescription>Select the speaking part and add your questions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Part Selection */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Speaking Part</label>
                <div className="grid grid-cols-3 gap-4">
                  <Button
                    type="button"
                    variant={partType === 'part_1' ? 'default' : 'outline'}
                    className="h-20 flex-col"
                  onClick={() => {
                    setPartType('part_1');
                  }}
                  >
                    <div className="font-bold text-lg">Part 1</div>
                    <div className="text-xs text-center">Introduction<br />4-5 minutes</div>
                  </Button>
                  <Button
                    type="button"
                    variant={partType === 'part_2' ? 'default' : 'outline'}
                    className="h-20 flex-col"
                    onClick={() => {
                      setPartType('part_2');
                    }}
                  >
                    <div className="font-bold text-lg">Part 2</div>
                    <div className="text-xs text-center">Long Turn<br />1-2 minutes</div>
                  </Button>
                  <Button
                    type="button"
                    variant={partType === 'part_3' ? 'default' : 'outline'}
                    className="h-20 flex-col"
                    onClick={() => {
                      setPartType('part_3');
                    }}
                  >
                    <div className="font-bold text-lg">Part 3</div>
                    <div className="text-xs text-center">Discussion<br />4-5 minutes</div>
                  </Button>
                </div>
              </div>

              {/* Question Input */}
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Question</label>
                  <Textarea
                    placeholder="Enter the speaking question..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Context (Optional)</label>
                  <Textarea
                    placeholder="Enter context or additional information..."
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    className="min-h-[60px]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Additional Instructions (Optional)</label>
                  <Textarea
                    placeholder="Enter any special instructions..."
                    value={additionalInstructions}
                    onChange={(e) => setAdditionalInstructions(e.target.value)}
                    className="min-h-[60px]"
                  />
                </div>
              </div>

              {/* Audio Controls */}
              <div className="space-y-4">
                <label className="text-sm font-semibold text-gray-700">Record Your Answer</label>
                
                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={isRecording ? stopRecording : startRecording}
                    variant={isRecording ? 'destructive' : 'default'}
                    className="flex-1"
                    disabled={isLoading}
                  >
                    {isRecording ? (
                      <>
                        <Pause className="mr-2 h-4 w-4" />
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <Mic className="mr-2 h-4 w-4" />
                        Start Recording
                      </>
                    )}
                  </Button>
                  
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="flex-1"
                    disabled={isLoading}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Audio
                  </Button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {audioUrl && (
                  <div className="p-4 bg-gray-50 rounded-lg border space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Recorded Audio:</div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clearAudio}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Clear
                      </Button>
                    </div>
                    <audio controls src={audioUrl} className="w-full" />
                  </div>
                )}

                <Button
                  onClick={handleSubmit}
                  disabled={!audioBlob || isLoading || !question.trim()}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Submit & Get Results
                    </>
                  )}
                </Button>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-700">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">{error}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Instructions */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <div className="font-semibold text-blue-600 mb-1">Part 1 - Introduction</div>
                <p className="text-gray-600">Answer questions about yourself, hometown, work, hobbies...</p>
              </div>
              <div>
                <div className="font-semibold text-blue-600 mb-1">Part 2 - Long Turn</div>
                <p className="text-gray-600">Speak about a given topic for 1-2 minutes. You have 1 minute to prepare.</p>
              </div>
              <div>
                <div className="font-semibold text-blue-600 mb-1">Part 3 - Discussion</div>
                <p className="text-gray-600">Discuss extended questions related to Part 2 topic.</p>
              </div>
              <div className="pt-3 border-t">
                <div className="font-semibold text-gray-900 mb-1">Grading Criteria:</div>
                <ul className="space-y-1 text-gray-600">
                  <li>• Fluency & Coherence (0-9)</li>
                  <li>• Lexical Resource (0-9)</li>
                  <li>• Grammar Range & Accuracy (0-9)</li>
                  <li>• Pronunciation (0-9)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-600">
              <p>1. Select a speaking part (1, 2, or 3)</p>
              <p>2. Add the questions for that part</p>
              <p>3. Record or upload your audio answer</p>
              <p>4. AI will transcribe your speech</p>
              <p>5. Get detailed IELTS grading and feedback</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
