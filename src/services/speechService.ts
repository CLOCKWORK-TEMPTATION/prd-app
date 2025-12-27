/**
 * Section 8: Speech Recognition Service
 * خدمة التعرف على الصوت والتحويل إلى نص
 */

import {
  RecordingState,
  SpeechLanguage,
  RecordingConfig,
  SpeechRecognitionResult,
  SpeechRecognitionError,
  SpeechServiceState,
  SpeechRecognitionOptions,
  SpeechUsageStats,
  AudioRecording,
  ISpeechRecognition
} from '../types/speech.types';

/**
 * الإعدادات الافتراضية
 */
const DEFAULT_CONFIG: RecordingConfig = {
  language: 'en-US',
  continuous: false,
  interimResults: true,
  maxAlternatives: 3,
  autoStop: true,
  autoStopDelay: 2000 // 2 seconds
};

/**
 * خدمة التعرف على الصوت
 */
class SpeechService {
  private recognition: ISpeechRecognition | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private state: SpeechServiceState;
  private config: RecordingConfig;
  private stats: SpeechUsageStats;
  private silenceTimer: NodeJS.Timeout | null = null;
  private recordingStartTime: number = 0;

  constructor(config?: Partial<RecordingConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.state = {
      isSupported: this.checkSupport(),
      isListening: false,
      recordingState: 'idle',
      currentTranscript: '',
      finalTranscript: '',
      confidence: 0,
      error: null,
      audioRecording: null
    };
    this.stats = {
      totalRecordings: 0,
      totalDuration: 0,
      totalWords: 0,
      averageConfidence: 0,
      languageDistribution: [],
      lastUsed: null
    };
  }

  /**
   * التحقق من دعم المتصفح
   */
  private checkSupport(): boolean {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  /**
   * الحصول على مثيل SpeechRecognition
   */
  private getSpeechRecognition(): ISpeechRecognition | null {
    if (!this.state.isSupported) return null;

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) return null;

    return new SpeechRecognitionAPI();
  }

  /**
   * تهيئة التعرف على الصوت
   */
  private initRecognition(options: SpeechRecognitionOptions): boolean {
    if (!this.state.isSupported) {
      this.handleError({
        code: 'service-not-allowed',
        message: 'Speech recognition is not supported in this browser'
      });
      return false;
    }

    try {
      this.recognition = this.getSpeechRecognition();
      if (!this.recognition) return false;

      // تطبيق الإعدادات
      this.recognition.continuous = options.continuous;
      this.recognition.interimResults = options.interimResults;
      this.recognition.lang = options.language;
      this.recognition.maxAlternatives = options.maxAlternatives;

      // Event handlers
      this.recognition.onstart = () => {
        this.state.isListening = true;
        this.state.recordingState = 'recording';
        this.state.error = null;
        this.recordingStartTime = Date.now();
        options.callbacks?.onStart?.();
      };

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;

          if (result.isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        // تحديث الحالة
        if (interimTranscript) {
          this.state.currentTranscript = interimTranscript;
        }

        if (finalTranscript) {
          this.state.finalTranscript += finalTranscript;
          this.state.confidence = event.results[event.results.length - 1][0].confidence || 0;

          const result: SpeechRecognitionResult = {
            transcript: finalTranscript.trim(),
            confidence: this.state.confidence,
            isFinal: true,
            language: options.language,
            timestamp: new Date()
          };

          options.callbacks?.onResult?.(result);

          // إعادة تعيين مؤقت الصمت
          if (options.autoStop) {
            this.resetSilenceTimer(options);
          }
        }
      };

      this.recognition.onerror = (event: any) => {
        const error: SpeechRecognitionError = {
          code: event.error || 'unknown',
          message: this.getErrorMessage(event.error)
        };
        this.handleError(error);
        options.callbacks?.onError?.(error);
      };

      this.recognition.onend = () => {
        this.state.isListening = false;
        this.state.recordingState = 'completed';

        if (this.silenceTimer) {
          clearTimeout(this.silenceTimer);
          this.silenceTimer = null;
        }

        // تحديث الإحصائيات
        this.updateStats();

        options.callbacks?.onEnd?.(this.state.finalTranscript);
      };

      this.recognition.onsoundstart = () => {
        options.callbacks?.onSoundStart?.();
        // إلغاء مؤقت الصمت عند بدء الصوت
        if (this.silenceTimer) {
          clearTimeout(this.silenceTimer);
          this.silenceTimer = null;
        }
      };

      this.recognition.onsoundend = () => {
        options.callbacks?.onSoundEnd?.();
        // بدء مؤقت الصمت عند انتهاء الصوت
        if (options.autoStop) {
          this.resetSilenceTimer(options);
        }
      };

      return true;
    } catch (error) {
      this.handleError({
        code: 'unknown',
        message: 'Failed to initialize speech recognition',
        details: error
      });
      return false;
    }
  }

  /**
   * إعادة تعيين مؤقت الصمت
   */
  private resetSilenceTimer(options: SpeechRecognitionOptions): void {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
    }

    this.silenceTimer = setTimeout(() => {
      if (this.state.isListening) {
        this.stop();
      }
    }, options.autoStopDelay);
  }

  /**
   * بدء التسجيل
   */
  async start(options?: Partial<SpeechRecognitionOptions>): Promise<void> {
    const fullOptions: SpeechRecognitionOptions = {
      ...this.config,
      ...options
    };

    // إعادة تعيين الحالة
    this.state.currentTranscript = '';
    this.state.finalTranscript = '';
    this.state.confidence = 0;
    this.state.error = null;
    this.audioChunks = [];

    // تهيئة التعرف على الصوت
    if (!this.initRecognition(fullOptions)) {
      throw new Error('Failed to initialize speech recognition');
    }

    try {
      // بدء التسجيل الصوتي (إذا طلب)
      if (fullOptions.saveRecording) {
        await this.startAudioRecording();
      }

      // بدء التعرف على الصوت
      this.recognition?.start();
    } catch (error: any) {
      this.handleError({
        code: error.name === 'NotAllowedError' ? 'not-allowed' : 'unknown',
        message: error.message || 'Failed to start recording',
        details: error
      });
      throw error;
    }
  }

  /**
   * إيقاف التسجيل
   */
  stop(): void {
    if (this.recognition && this.state.isListening) {
      this.recognition.stop();
    }

    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
    }

    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
  }

  /**
   * إلغاء التسجيل
   */
  abort(): void {
    if (this.recognition) {
      this.recognition.abort();
    }

    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
    }

    this.state.isListening = false;
    this.state.recordingState = 'idle';
    this.audioChunks = [];
  }

  /**
   * بدء تسجيل الصوت
   */
  private async startAudioRecording(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const duration = (Date.now() - this.recordingStartTime) / 1000;

        const recording: AudioRecording = {
          id: `recording-${Date.now()}`,
          blob: audioBlob,
          duration,
          timestamp: new Date(),
          url: URL.createObjectURL(audioBlob)
        };

        this.state.audioRecording = recording;

        // إيقاف جميع المسارات
        stream.getTracks().forEach(track => track.stop());
      };

      this.mediaRecorder.start();
    } catch (error) {
      console.error('Failed to start audio recording:', error);
    }
  }

  /**
   * معالجة الأخطاء
   */
  private handleError(error: SpeechRecognitionError): void {
    this.state.error = error.message;
    this.state.recordingState = 'error';
    this.state.isListening = false;
  }

  /**
   * الحصول على رسالة الخطأ
   */
  private getErrorMessage(errorCode: string): string {
    const messages: Record<string, string> = {
      'no-speech': 'No speech was detected',
      'aborted': 'Speech recognition was aborted',
      'audio-capture': 'Audio capture failed',
      'network': 'Network error occurred',
      'not-allowed': 'Microphone access denied',
      'service-not-allowed': 'Speech recognition service not allowed',
      'bad-grammar': 'Grammar error',
      'language-not-supported': 'Language not supported'
    };

    return messages[errorCode] || 'Unknown error occurred';
  }

  /**
   * تحديث الإحصائيات
   */
  private updateStats(): void {
    const duration = (Date.now() - this.recordingStartTime) / 1000;
    const wordCount = this.state.finalTranscript.split(/\s+/).filter(w => w.length > 0).length;

    this.stats.totalRecordings++;
    this.stats.totalDuration += duration;
    this.stats.totalWords += wordCount;

    // تحديث متوسط الثقة
    this.stats.averageConfidence =
      (this.stats.averageConfidence * (this.stats.totalRecordings - 1) + this.state.confidence) /
      this.stats.totalRecordings;

    // تحديث توزيع اللغات
    const langEntry = this.stats.languageDistribution.find(l => l.language === this.config.language);
    if (langEntry) {
      langEntry.count++;
    } else {
      this.stats.languageDistribution.push({
        language: this.config.language,
        count: 1
      });
    }

    this.stats.lastUsed = new Date();
  }

  /**
   * الحصول على الحالة الحالية
   */
  getState(): SpeechServiceState {
    return { ...this.state };
  }

  /**
   * الحصول على الإحصائيات
   */
  getStats(): SpeechUsageStats {
    return { ...this.stats };
  }

  /**
   * تحديث الإعدادات
   */
  updateConfig(config: Partial<RecordingConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * إعادة تعيين الإحصائيات
   */
  resetStats(): void {
    this.stats = {
      totalRecordings: 0,
      totalDuration: 0,
      totalWords: 0,
      averageConfidence: 0,
      languageDistribution: [],
      lastUsed: null
    };
  }

  /**
   * التحقق من الدعم
   */
  isSupported(): boolean {
    return this.state.isSupported;
  }
}

// Singleton instance
export const speechService = new SpeechService();

// Export class for testing
export { SpeechService };
