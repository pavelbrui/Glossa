import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import { AZURE_CONFIG } from '../../config/azure';

export class AzureSpeechService {
  private speechConfig: sdk.SpeechConfig | null = null;
  private debug: boolean = true;

  private log(...args: any[]) {
    if (this.debug) {
      console.log('[AzureSpeechService]', ...args);
    }
  }

  private error(...args: any[]) {
    console.error('[AzureSpeechService]', ...args);
  }

  initialize(): void {
    try {
      if (!AZURE_CONFIG.key || !AZURE_CONFIG.region) {
        throw new Error('Missing Azure credentials');
      }

      this.speechConfig = sdk.SpeechConfig.fromSubscription(
        AZURE_CONFIG.key,
        AZURE_CONFIG.region
      );

      this.log('Speech service initialized');
    } catch (error) {
      this.error('Initialization failed:', error);
      throw error;
    }
  }

  async synthesizeSpeech(text: string, language: string): Promise<ArrayBuffer> {
    if (!this.speechConfig) {
      this.initialize();
    }

    const voice = AZURE_CONFIG.voiceMap[language as keyof typeof AZURE_CONFIG.voiceMap];
    if (!voice) {
      throw new Error(`No voice configured for language: ${language}`);
    }

    this.speechConfig!.speechSynthesisVoiceName = voice;
    const synthesizer = new sdk.SpeechSynthesizer(this.speechConfig!);

    this.log(`Synthesizing speech for ${language} using voice ${voice}`);

    return new Promise((resolve, reject) => {
      synthesizer.speakTextAsync(
        text,
        result => {
          if (result.audioData) {
            this.log(`Speech synthesis successful for ${language}`, {
              dataSize: result.audioData.byteLength
            });
            resolve(result.audioData);
          } else {
            reject(new Error('No audio data generated'));
          }
          synthesizer.close();
        },
        error => {
          this.error(`Speech synthesis error for ${language}:`, error);
          synthesizer.close();
          reject(error);
        }
      );
    });
  }
}

export const azureSpeechService = new AzureSpeechService();