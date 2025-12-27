/**
 * Section 8: Voice Input Component
 * مكون الإدخال الصوتي والتحويل إلى نص
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Mic, MicOff, Square, Play, Pause, Download, Trash2, Volume2, VolumeX } from 'lucide-react';
import { speechService } from '../services/speechService';
import {
  SpeechLanguage,
  SpeechRecognitionResult,
  RecordingState,
  SpeechRecognitionError
} from '../types/speech.types';

/**
 * خصائص المكون
 */
interface VoiceInputProps {
  language?: SpeechLanguage;
  onTranscriptChange?: (transcript: string) => void;
  onComplete?: (transcript: string) => void;
  placeholder?: string;
  className?: string;
  autoInsert?: boolean;        // إدراج تلقائي في الحقل
  saveRecording?: boolean;     // حفظ التسجيل الصوتي
  showWaveform?: boolean;      // عرض موجة الصوت
  continuous?: boolean;        // تسجيل مستمر
}

/**
 * مكون الإدخال الصوتي
 */
export const VoiceInput: React.FC<VoiceInputProps> = ({
  language = 'en-US',
  onTranscriptChange,
  onComplete,
  placeholder,
  className = '',
  autoInsert = true,
  saveRecording = false,
  showWaveform = true,
  continuous = false
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [soundLevel, setSoundLevel] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<number | null>(null);

  /**
   * التحقق من الدعم
   */
  const isSupported = speechService.isSupported();

  /**
   * بدء التسجيل
   */
  const startRecording = useCallback(async () => {
    if (!isSupported) {
      setError('Speech recognition is not supported in your browser');
      return;
    }

    try {
      setError(null);
      setTranscript('');
      setInterimTranscript('');
      setConfidence(0);
      setRecordingDuration(0);

      await speechService.start({
        language,
        continuous,
        interimResults: true,
        maxAlternatives: 3,
        autoStop: !continuous,
        autoStopDelay: 2000,
        saveRecording,
        callbacks: {
          onStart: () => {
            setIsRecording(true);
            setRecordingState('recording');
            startTimer();
            if (showWaveform) {
              startWaveformAnimation();
            }
          },
          onResult: (result: SpeechRecognitionResult) => {
            if (result.isFinal) {
              const newTranscript = transcript + result.transcript + ' ';
              setTranscript(newTranscript);
              setInterimTranscript('');
              setConfidence(result.confidence);

              if (autoInsert && onTranscriptChange) {
                onTranscriptChange(newTranscript);
              }
            } else {
              setInterimTranscript(result.transcript);
            }
          },
          onEnd: (finalTranscript: string) => {
            setIsRecording(false);
            setRecordingState('completed');
            stopTimer();
            stopWaveformAnimation();

            if (onComplete) {
              onComplete(finalTranscript);
            }

            // الحصول على التسجيل الصوتي
            if (saveRecording) {
              const state = speechService.getState();
              if (state.audioRecording?.url) {
                setAudioUrl(state.audioRecording.url);
              }
            }
          },
          onError: (err: SpeechRecognitionError) => {
            setError(err.message);
            setIsRecording(false);
            setRecordingState('error');
            stopTimer();
            stopWaveformAnimation();
          },
          onSoundStart: () => {
            setSoundLevel(Math.random() * 100); // محاكاة مستوى الصوت
          },
          onSoundEnd: () => {
            setSoundLevel(0);
          }
        }
      });
    } catch (err: any) {
      setError(err.message || 'Failed to start recording');
      setRecordingState('error');
    }
  }, [isSupported, language, continuous, saveRecording, autoInsert, showWaveform, transcript, onTranscriptChange, onComplete]);

  /**
   * إيقاف التسجيل
   */
  const stopRecording = useCallback(() => {
    speechService.stop();
    setIsRecording(false);
    stopTimer();
    stopWaveformAnimation();
  }, []);

  /**
   * إلغاء التسجيل
   */
  const cancelRecording = useCallback(() => {
    speechService.abort();
    setIsRecording(false);
    setRecordingState('idle');
    setTranscript('');
    setInterimTranscript('');
    setError(null);
    stopTimer();
    stopWaveformAnimation();
  }, []);

  /**
   * تشغيل التسجيل الصوتي
   */
  const playAudio = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  /**
   * تحميل التسجيل
   */
  const downloadAudio = useCallback(() => {
    if (audioUrl) {
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = `recording-${Date.now()}.webm`;
      a.click();
    }
  }, [audioUrl]);

  /**
   * حذف التسجيل
   */
  const deleteRecording = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setAudioUrl(null);
    setRecordingState('idle');
    setError(null);
  }, []);

  /**
   * بدء المؤقت
   */
  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setRecordingDuration(prev => prev + 0.1);
    }, 100);
  };

  /**
   * إيقاف المؤقت
   */
  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  /**
   * بدء رسم الموجة
   */
  const startWaveformAnimation = () => {
    const animate = () => {
      setSoundLevel(prev => {
        const newLevel = isRecording ? Math.random() * 100 : 0;
        return newLevel;
      });
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();
  };

  /**
   * إيقاف رسم الموجة
   */
  const stopWaveformAnimation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setSoundLevel(0);
  };

  /**
   * تنسيق الوقت
   */
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * تنظيف عند الإلغاء
   */
  useEffect(() => {
    return () => {
      stopTimer();
      stopWaveformAnimation();
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  /**
   * معالج تشغيل الصوت
   */
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onended = () => setIsPlaying(false);
    }
  }, [audioUrl]);

  if (!isSupported) {
    return (
      <div className={`voice-input-unsupported p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg ${className}`}>
        <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
          <MicOff className="w-5 h-5" />
          <p className="text-sm">
            {language === 'ar-SA' || language === 'ar-EG'
              ? 'متصفحك لا يدعم التعرف على الصوت'
              : 'Your browser does not support speech recognition'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`voice-input ${className}`} dir={language.startsWith('ar') ? 'rtl' : 'ltr'}>
      {/* زر التسجيل الرئيسي */}
      <div className="flex items-center gap-3">
        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={recordingState === 'processing'}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium
              transition-all duration-200
              ${recordingState === 'idle'
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'}
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            <Mic className="w-5 h-5" />
            <span>
              {language.startsWith('ar') ? 'ابدأ التسجيل' : 'Start Recording'}
            </span>
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-red-500 hover:bg-red-600 text-white transition-all duration-200"
          >
            <Square className="w-5 h-5" />
            <span>
              {language.startsWith('ar') ? 'إيقاف' : 'Stop'}
            </span>
          </button>
        )}

        {isRecording && (
          <button
            onClick={cancelRecording}
            className="px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}

        {/* مؤقت التسجيل */}
        {isRecording && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="font-mono">{formatDuration(recordingDuration)}</span>
          </div>
        )}
      </div>

      {/* موجة الصوت */}
      {showWaveform && isRecording && (
        <div className="waveform mt-4 flex items-center justify-center gap-1 h-16">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="w-1 bg-blue-500 rounded-full transition-all duration-100"
              style={{
                height: `${Math.random() * soundLevel}%`,
                minHeight: '4px'
              }}
            />
          ))}
        </div>
      )}

      {/* النص المكتوب */}
      {(transcript || interimTranscript) && (
        <div className="transcript mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-900 dark:text-gray-100">
            {transcript}
            {interimTranscript && (
              <span className="text-gray-400 dark:text-gray-500 italic">
                {interimTranscript}
              </span>
            )}
          </p>

          {/* مؤشر الثقة */}
          {confidence > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {language.startsWith('ar') ? 'الثقة:' : 'Confidence:'}
              </span>
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <div
                  className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${confidence * 100}%` }}
                />
              </div>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {Math.round(confidence * 100)}%
              </span>
            </div>
          )}
        </div>
      )}

      {/* مشغل الصوت */}
      {audioUrl && (
        <div className="audio-player mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-3">
            <button
              onClick={playAudio}
              className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-all duration-200"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>

            <div className="flex-1">
              <audio ref={audioRef} src={audioUrl} muted={isMuted} />
            </div>

            <button
              onClick={downloadAudio}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
              title={language.startsWith('ar') ? 'تحميل' : 'Download'}
            >
              <Download className="w-5 h-5" />
            </button>

            <button
              onClick={deleteRecording}
              className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 transition-all duration-200"
              title={language.startsWith('ar') ? 'حذف' : 'Delete'}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* رسائل الخطأ */}
      {error && (
        <div className="error-message mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}
    </div>
  );
};

export default VoiceInput;
