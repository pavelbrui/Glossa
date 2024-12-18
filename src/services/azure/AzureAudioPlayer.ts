import { audioContextManager } from '../audio/AudioContextManager';

interface PlaybackOptions {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
  volume?: number;
}

class AzureAudioPlayer {
  private currentSource: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private debug: boolean = true;

  private log(...args: any[]) {
    if (this.debug) {
      console.log('[AzureAudioPlayer]', ...args);
    }
  }

  private error(...args: any[]) {
    console.error('[AzureAudioPlayer]', ...args);
  }

  async playAudioData(audioData: ArrayBuffer, options: PlaybackOptions = {}): Promise<void> {
    try {
      this.log('Starting audio playback', { dataSize: audioData.byteLength });
      
      await audioContextManager.initialize();
      const context = audioContextManager.getContext();
      
      // Stop any currently playing audio
      if (this.currentSource) {
        this.log('Stopping current playback');
        this.currentSource.stop();
        this.currentSource.disconnect();
      }

      // Resume context if suspended
      if (context.state === 'suspended') {
        this.log('Resuming audio context');
        await context.resume();
      }

      this.log('Decoding audio data');
      const audioBuffer = await context.decodeAudioData(audioData.slice(0));
      
      this.log('Creating audio source');
      const source = context.createBufferSource();
      source.buffer = audioBuffer;
      
      // Create gain node for volume control
      this.gainNode = context.createGain();
      this.gainNode.gain.value = options.volume ?? 1.0;
      
      // Connect nodes
      source.connect(this.gainNode);
      this.gainNode.connect(context.destination);
      
      this.currentSource = source;

      // Set up event handlers
      source.onended = () => {
        this.log('Playback ended');
        this.currentSource = null;
        this.gainNode = null;
        options.onEnd?.();
      };

      // Start playback
      this.log('Starting playback');
      source.start(0);
      options.onStart?.();

    } catch (error) {
      this.error('Playback error:', error);
      options.onError?.(error instanceof Error ? error : new Error('Unknown playback error'));
      throw error;
    }
  }

  setVolume(volume: number): void {
    if (this.gainNode) {
      this.gainNode.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  stop(): void {
    if (this.currentSource) {
      this.log('Stopping playback');
      this.currentSource.stop();
      this.currentSource.disconnect();
      this.currentSource = null;
    }
    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }
  }

  async cleanup(): Promise<void> {
    this.stop();
    await audioContextManager.close();
  }
}

export const azureAudioPlayer = new AzureAudioPlayer();