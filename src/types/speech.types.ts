/**
 * Section 8: Voice Input Types
 * أنواع المدخلات الصوتية
 */

/**
 * حالة التسجيل
 */
export type RecordingState = 'idle' | 'recording' | 'processing' | 'completed' | 'error';

/**
 * لغة التعرف على الصوت
 */
export type SpeechLanguage = 'en-US' | 'ar-SA' | 'ar-EG';

/**
 * إعدادات التسجيل
 */
export interface RecordingConfig {
  language: SpeechLanguage;
  continuous: boolean;          // استمرار التسجيل
  interimResults: boolean;       // نتائج مؤقتة
  maxAlternatives: number;       // عدد البدائل المقترحة
  autoStop: boolean;             // إيقاف تلقائي عند السكوت
  autoStopDelay: number;         // مدة السكوت قبل الإيقاف (بالميلي ثانية)
}

/**
 * نتيجة التعرف على الصوت
 */
export interface SpeechRecognitionResult {
  transcript: string;            // النص المُحَوَّل
  confidence: number;            // نسبة الثقة (0-1)
  isFinal: boolean;              // هل النتيجة نهائية
  alternatives?: {
    transcript: string;
    confidence: number;
  }[];
  language: SpeechLanguage;
  timestamp: Date;
}

/**
 * بيانات التسجيل الصوتي
 */
export interface AudioRecording {
  id: string;
  blob: Blob;                    // البيانات الصوتية
  duration: number;              // المدة بالثواني
  timestamp: Date;
  url?: string;                  // رابط التشغيل
}

/**
 * حالة خدمة الصوت
 */
export interface SpeechServiceState {
  isSupported: boolean;          // هل المتصفح يدعم التعرف على الصوت
  isListening: boolean;
  recordingState: RecordingState;
  currentTranscript: string;
  finalTranscript: string;
  confidence: number;
  error: string | null;
  audioRecording: AudioRecording | null;
}

/**
 * حدث التعرف على الصوت
 */
export interface SpeechRecognitionEvent {
  type: 'start' | 'result' | 'end' | 'error' | 'soundstart' | 'soundend' | 'speechstart' | 'speechend';
  result?: SpeechRecognitionResult;
  error?: SpeechRecognitionError;
  timestamp: Date;
}

/**
 * خطأ في التعرف على الصوت
 */
export interface SpeechRecognitionError {
  code: 'no-speech' | 'aborted' | 'audio-capture' | 'network' | 'not-allowed' | 'service-not-allowed' | 'bad-grammar' | 'language-not-supported' | 'unknown';
  message: string;
  details?: any;
}

/**
 * إحصائيات الاستخدام
 */
export interface SpeechUsageStats {
  totalRecordings: number;
  totalDuration: number;         // بالثواني
  totalWords: number;
  averageConfidence: number;
  languageDistribution: {
    language: SpeechLanguage;
    count: number;
  }[];
  lastUsed: Date | null;
}

/**
 * Callbacks
 */
export interface SpeechCallbacks {
  onStart?: () => void;
  onResult?: (result: SpeechRecognitionResult) => void;
  onEnd?: (finalTranscript: string) => void;
  onError?: (error: SpeechRecognitionError) => void;
  onSoundStart?: () => void;
  onSoundEnd?: () => void;
}

/**
 * خيارات التعرف على الصوت
 */
export interface SpeechRecognitionOptions extends RecordingConfig {
  callbacks?: SpeechCallbacks;
  saveRecording?: boolean;       // حفظ التسجيل الصوتي
}

/**
 * Browser API Types (للتوافق مع المتصفحات)
 */
export interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;

  start(): void;
  stop(): void;
  abort(): void;

  onstart: ((this: ISpeechRecognition, ev: Event) => any) | null;
  onend: ((this: ISpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: ISpeechRecognition, ev: any) => any) | null;
  onresult: ((this: ISpeechRecognition, ev: any) => any) | null;
  onsoundstart: ((this: ISpeechRecognition, ev: Event) => any) | null;
  onsoundend: ((this: ISpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: ISpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: ISpeechRecognition, ev: Event) => any) | null;
}

export interface ISpeechRecognitionConstructor {
  new(): ISpeechRecognition;
}

/**
 * Window interface extension
 */
declare global {
  interface Window {
    SpeechRecognition?: ISpeechRecognitionConstructor;
    webkitSpeechRecognition?: ISpeechRecognitionConstructor;
  }
}
