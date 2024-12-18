// Singleton AudioContext manager
class AudioContextManager {
  private static instance: AudioContextManager;
  private context: AudioContext | null = null;

  private constructor() {}

  static getInstance(): AudioContextManager {
    if (!AudioContextManager.instance) {
      AudioContextManager.instance = new AudioContextManager();
    }
    return AudioContextManager.instance;
  }

  getContext(): AudioContext {
    if (!this.context) {
      this.context = new AudioContext({
        sampleRate: 16000,
        latencyHint: 'interactive'
      });
    }
    return this.context;
  }

  async suspend(): Promise<void> {
    if (this.context) {
      await this.context.suspend();
    }
  }

  async resume(): Promise<void> {
    if (this.context) {
      await this.context.resume();
    }
  }

  async close(): Promise<void> {
    if (this.context) {
      await this.context.close();
      this.context = null;
    }
  }
}

export const audioContextManager = AudioContextManager.getInstance();