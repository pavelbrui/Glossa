import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import { AZURE_CONFIG } from '../config/azure';
import { mockWebSocketService } from './mockWebSocket';

interface TranslationResult {
  type: 'translation';
  original: string;
  translations: Record<string, string>;
  timestamp: string;
  final?: boolean;
}

class TranslationService {
  private speechConfig: sdk.SpeechTranslationConfig | null = null;
  private recognizer: sdk.TranslationRecognizer | null = null;
  private currentServiceId: string | null = null;
  private audioProcessor: ScriptProcessorNode | null = null;
  private audioContext: AudioContext | null = null;
  private currentSentence: string = '';
  private lastProcessedTime: number = 0;
  private debug: boolean = true;
  private connectionState: 'disconnected' | 'connecting' | 'connected' | 'error' = 'disconnected';

  constructor() {
    try {
      console.log('[Translation] Initializing Speech SDK...');

      if (!AZURE_CONFIG.key || !AZURE_CONFIG.region) {
        throw new Error('Invalid Azure configuration: missing key or region');
      }

      this.speechConfig = sdk.SpeechTranslationConfig.fromSubscription(
        AZURE_CONFIG.key,
        AZURE_CONFIG.region
      );

      if (!this.speechConfig) {
        throw new Error('Failed to create speech config');
      }

      this.speechConfig.speechRecognitionLanguage = AZURE_CONFIG.speechRecognitionLanguage;
      
      AZURE_CONFIG.targetLanguages.forEach(lang => {
        console.log(`[Translation] Adding target language: ${lang}`);
        this.speechConfig?.addTargetLanguage(lang);
      });

      this.speechConfig.setProperty("SpeechServiceConnection_InitialSilenceTimeoutMs", 
        AZURE_CONFIG.recognitionConfig.initialSilenceTimeoutMs.toString());
      this.speechConfig.setProperty("SpeechServiceConnection_EndSilenceTimeoutMs", 
        AZURE_CONFIG.recognitionConfig.endSilenceTimeoutMs.toString());

      this.speechConfig.setProperty("Debug", "1");
      this.speechConfig.setProperty("DebugOutput", "All");
      this.speechConfig.outputFormat = sdk.OutputFormat.Detailed;

      // Add profanity filter and pronunciation assessment
      this.speechConfig.setProfanity(sdk.ProfanityOption.Masked);
      this.speechConfig.enableAudioLogging();
      
      console.log('[Translation] Service initialized successfully');
    } catch (error) {
      this.error('❌ Failed to initialize speech config:', error);
      throw new Error(`Translation service initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private log(...args: any[]) {
    if (this.debug) {
      console.log('[Translation]', ...args);
    }
  }

  private error(...args: any[]) {
    console.error('[TranslationService]', ...args);
  }

  private shouldProcessSentence(text: string): boolean {
    const now = Date.now();
    const timeSinceLastProcess = now - this.lastProcessedTime;
    const hasEndMarker = AZURE_CONFIG.recognitionConfig.sentenceEndMarkers.some(
      marker => text.includes(marker)
    );
    const isLongEnough = text.split(' ').length >= AZURE_CONFIG.recognitionConfig.minWordCount;
    const isNewContent = text !== this.currentSentence;

    console.log('[Translation] Processing sentence:', {
      text,
      timeSinceLastProcess,
      hasEndMarker,
      isLongEnough,
      isNewContent
    });

    return (hasEndMarker || timeSinceLastProcess > 2000) && isLongEnough && isNewContent;
  }

  private setupPhraseList(recognizer: sdk.TranslationRecognizer) {
    try {
      const phraseList = sdk.PhraseListGrammar.fromRecognizer(recognizer);
      AZURE_CONFIG.recognitionConfig.commonPhrases.forEach(phrase => {
        phraseList.addPhrase(phrase);
      });
      console.log('[Translation] Phrase list configured');
    } catch (error) {
      this.error('⚠️ Failed to setup phrase list:', error);
    }
  }

  startTranslation(serviceId: string, audioStream: MediaStream, onTranslation: (result: any) => void) {
    try {
      

      // Subscribe the service before starting translation
      mockWebSocketService.subscribe(
          serviceId,
          AZURE_CONFIG.speechRecognitionLanguage,
          serviceId, // Using serviceId as sessionId for simplicity
          (data) => {
      
              onTranslation(data);
          }
      );

      // Existing logic for starting translation...
  } catch (error) {
      this.error('❌ Error in startTranslation:', error);
      throw error;
  }
    try {
      if (this.connectionState !== 'disconnected') {
        this.stopTranslation();
      }

      this.connectionState = 'connecting';
      onTranslation({
        type: 'status',
        status: 'connecting',
        message: 'Initializing translation service...'
      });

      console.log('[Translation] Starting service:', serviceId);
      this.currentServiceId = serviceId;

      if (!this.speechConfig) {
        throw new Error('Speech config not initialized');
      }

      const pushStream = sdk.AudioInputStream.createPushStream();
      const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);

      if (!audioConfig) {
        throw new Error('Failed to create audio config');
      }
      
      console.log('[Translation] Audio config created');

      this.audioContext = new AudioContext({
        sampleRate: AZURE_CONFIG.recognitionConfig.sampleRate
      });
      const source = this.audioContext.createMediaStreamSource(audioStream);
      
      this.audioProcessor = this.audioContext.createScriptProcessor(
        AZURE_CONFIG.recognitionConfig.audioBufferSize,
        1,
        1
      );

      source.connect(this.audioProcessor);
      this.audioProcessor.connect(this.audioContext.destination);

      this.audioProcessor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const audioData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          audioData[i] = Math.min(1, Math.max(-1, inputData[i])) * 0x7FFF;
        }
        pushStream.write(audioData.buffer);
      };

      this.recognizer = new sdk.TranslationRecognizer(
        this.speechConfig,
        audioConfig
      );

      this.setupPhraseList(this.recognizer);

      this.recognizer.recognizing = (s, e) => {
        if (this.connectionState !== 'connected') {
          this.connectionState = 'connected';
          onTranslation({
            type: 'status',
            status: 'connected',
            message: 'Connected to translation service'
          });
        }

        this.log('Speech detected:', e.result.text);
        
        // Log the raw translations map
        const translationsMap = e.result.translations;
        this.log('Raw translations map:', translationsMap);

        if (this.shouldProcessSentence(e.result.text)) {
          const translations: Record<string, string> = {};
          
          // Convert translations map to object
          AZURE_CONFIG.targetLanguages.forEach(lang => {
            const translation = translationsMap.get(lang);
            this.log(`Translation for ${lang}:`, translation);
            if (translation) {
              translations[lang] = translation;
            }
          });
          
          this.log('Processed translations:', translations);
          
          // Validate translations
          const hasValidTranslations = Object.values(translations).some(t => t.length > 0);
          if (!hasValidTranslations) {
            this.log('No valid translations found');
            return;
          }

          const result: TranslationResult = {
            type: 'translation',
            original: e.result.text,
            translations,
            timestamp: new Date().toISOString()
          };

          this.currentSentence = e.result.text;
          this.lastProcessedTime = Date.now();

          this.log('Broadcasting translation:', result);
          mockWebSocketService.broadcast(serviceId, result);
          onTranslation(result);
        }
      };

      this.recognizer.recognized = (s, e) => {
        if (e.result.reason === sdk.ResultReason.TranslatedSpeech) {
          this.log('Recognized speech:', e.result);
          
          const translations: Record<string, string> = {};
          const translationsMap = e.result.translations;
          
          this.log('Final translations map:', translationsMap);

          AZURE_CONFIG.targetLanguages.forEach(lang => {
            const translation = translationsMap.get(lang);
            this.log(`Final translation for ${lang}:`, translation);
            if (translation) {
              translations[lang] = translation;
            }
          });
          
          // Validate translations
          const hasValidTranslations = Object.values(translations).some(t => t.length > 0);
          if (!hasValidTranslations) {
            this.log('No valid final translations found');
            return;
          }

          const result: TranslationResult = {
            type: 'translation',
            original: e.result.text,
            translations,
            timestamp: new Date().toISOString(),
            final: true
          };

          this.currentSentence = '';
          this.lastProcessedTime = Date.now();

          this.log('📢 Broadcasting final translation:', result);
          mockWebSocketService.broadcast(serviceId, result);
          onTranslation(result);
        } else if (e.result.reason === sdk.ResultReason.NoMatch) {
          console.log('[Translation] No match:', e.result.noMatchReason);
        }
      };

      this.recognizer.canceled = (s, e) => {
        console.log('[Translation] Canceled:', {
          reason: e.reason,
          errorDetails: e.errorDetails
        });
        
        // Only send error if it's not a normal cancellation
        if (e.reason !== sdk.CancellationReason.EndOfStream) {
          const errorMessage = `Recognition canceled: ${sdk.CancellationReason[e.reason]}, Details: ${e.errorDetails}`;
          onTranslation({ 
            type: 'error',
            error: errorMessage,
            timestamp: new Date().toISOString()
          });
        }
        
        // Try to reconnect if error was due to network
        if (e.reason === sdk.CancellationReason.Error && 
            e.errorDetails.includes('network')) {
          setTimeout(() => {
            this.startTranslation(serviceId, audioStream, onTranslation);
          }, 2000);
        }
      };
      
      this.recognizer.sessionStarted = (s, e) => {
        this.log('🟢 Session started:', e.sessionId);
        onTranslation({ 
          type: 'status',
          status: 'Session started',
          timestamp: new Date().toISOString()
        });
      };

      this.recognizer.sessionStopped = (s, e) => {
        this.log('🔴 Session stopped:', e.sessionId);
        onTranslation({ 
          type: 'status',
          status: 'Session stopped',
          timestamp: new Date().toISOString()
        });
      };

      this.log('▶️ Starting continuous recognition...');
      this.recognizer.startContinuousRecognitionAsync(
        () => {
          this.connectionState = 'connected';
          this.log('✅ Recognition started successfully');
          onTranslation({ 
            type: 'status',
            status: 'connected',
            message: 'Recognition started successfully'
          });
        },
        (error) => {
          this.error('❌ Error starting recognition:', error);
          this.connectionState = 'error';
          onTranslation({ 
            type: 'error',
            error: `Failed to start recognition: ${error}`,
            timestamp: new Date().toISOString()
          });
          throw error;
        }
      );

    } catch (error) {
      this.error('❌ Error in startTranslation:', error);
      this.connectionState = 'error';
      onTranslation({ 
        type: 'error',
        error: `Failed to start translation: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  stopTranslation() {
    try {
      if (this.recognizer) {
        this.log('🛑 Stopping translation...');
        this.recognizer.stopContinuousRecognitionAsync(
          () => {
            this.log('✅ Translation stopped successfully');
            if (this.audioProcessor) {
              this.audioProcessor.disconnect();
              this.audioProcessor = null;
            }
            if (this.audioContext) {
              this.audioContext.close();
              this.audioContext = null;
            }
            this.recognizer = null;
            this.currentServiceId = null;
            this.currentSentence = '';
            this.lastProcessedTime = 0;
            this.connectionState = 'disconnected';
          },
          (error) => {
            this.error('❌ Error stopping translation:', error);
            this.recognizer = null;
            this.connectionState = 'error';
          }
        );
      }
    } catch (error) {
      this.error('❌ Error in stopTranslation:', error);
      this.connectionState = 'error';
    }
  }
}

export const translationService = new TranslationService();