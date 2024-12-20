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
      if (!(audioData instanceof ArrayBuffer) || audioData.byteLength === 0) {
        throw new Error('Invalid or empty audio data provided.');
      }

      this.log('Initializing audio playback', { dataSize: audioData.byteLength });

      // Initialize or resume audio context
      await audioContextManager.initialize();
      const context = audioContextManager.getContext();

      if (context.state === 'suspended') {
        this.log('Resuming audio context');
        await context.resume();
      }

      // Stop any currently playing audio
      if (this.currentSource) {
        this.log('Stopping current playback');
        this.stop();
      }

      // Decode audio data
      this.log('Decoding audio data');
      const clonedBuffer = audioData.slice(0); // Clone ArrayBuffer to avoid detachment issues
      const audioBuffer = await context.decodeAudioData(clonedBuffer);

      // Create audio source
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

      // Playback event handlers
      source.onended = () => {
        this.log('Playback ended');
        this.cleanupAudioNodes();
        options.onEnd?.();
      };

      // Start playback
      this.log('Starting playback');
      source.start(0);
      options.onStart?.();
    } catch (error) {
      this.error('Playback error:', error);
      options.onError?.(error instanceof Error ? error : new Error('Unknown playback error'));
    }
  }

  setVolume(volume: number): void {
    if (this.gainNode) {
      this.gainNode.gain.value = Math.max(0, Math.min(1, volume));
      this.log('Volume set to', this.gainNode.gain.value);
    }
  }

  stop(): void {
    if (this.currentSource) {
      this.log('Stopping playback');
      this.currentSource.stop();
      this.cleanupAudioNodes();
    }
  }

  private cleanupAudioNodes(): void {
    if (this.currentSource) {
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
    this.log('Audio context cleaned up');
  }
}

export const azureAudioPlayer = new AzureAudioPlayer();
