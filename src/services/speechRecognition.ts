export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export class SpeechRecognitionService {
  private recognition: any = null;
  private isListening = false;
  private onResult?: (result: SpeechRecognitionResult) => void;
  private onError?: (error: string) => void;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.setupRecognition();
      }
    }
  }

  private setupRecognition() {
    if (!this.recognition) return;

    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript;
      const confidence = result[0].confidence;
      const isFinal = result.isFinal;

      if (this.onResult) {
        this.onResult({ transcript, confidence, isFinal });
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      this.isListening = false;
      if (this.onError) {
        this.onError(event.error);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };
  }

  isSupported(): boolean {
    return !!this.recognition;
  }

  startListening(
    onResult: (result: SpeechRecognitionResult) => void,
    onError?: (error: string) => void
  ): boolean {
    if (!this.recognition || this.isListening) {
      return false;
    }

    this.onResult = onResult;
    this.onError = onError;

    try {
      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      return false;
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  getIsListening(): boolean {
    return this.isListening;
  }
}