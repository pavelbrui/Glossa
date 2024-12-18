import { EventEmitter } from '../EventEmitter';

class AudioContextManager extends EventEmitter {
  private static instance: AudioContextManager;
  private context: AudioContext | null = null;
  private initialized: boolean = false;
  private pendingResume: (() => void)[] = [];
  private debug: boolean = true;

  private constructor() {
    super();
  }

  private log(...args: any[]) {
    if (this.debug) {
      console.log('[AudioContextManager]', ...args);
    }
  }

  static getInstance(): AudioContextManager {
    if (!AudioContextManager.instance) {
      AudioContextManager.instance = new AudioContextManager();
    }
    return AudioContextManager.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
        latencyHint: 'interactive'
      });

      this.log('Audio context created:', this.context.state);

      if (this.context.state === 'suspended') {
        this.log('Audio context suspended, waiting for user interaction');
        const resumePromise = new Promise<void>(resolve => {
          this.pendingResume.push(resolve);
        });
        await resumePromise;
      }

      this.initialized = true;
      this.emit('initialized');
      this.log('Audio context initialized successfully');
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
      throw error;
    }
  }

  async handleUserInteraction(): Promise<void> {
    if (!this.context) return;

    try {
      this.log('Handling user interaction, current state:', this.context.state);
      if (this.context.state === 'suspended') {
        await this.context.resume();
        this.log('Audio context resumed:', this.context.state);
        
        this.pendingResume.forEach(resolve => resolve());
        this.pendingResume = [];
      }
    } catch (error) {
      console.error('Failed to resume audio context:', error);
    }
  }

  getContext(): AudioContext {
    if (!this.context) {
      throw new Error('Audio context not initialized');
    }
    return this.context;
  }

  async suspend(): Promise<void> {
    if (this.context) {
      await this.context.suspend();
      this.log('Audio context suspended');
    }
  }

  async resume(): Promise<void> {
    if (this.context && this.context.state === 'suspended') {
      await this.context.resume();
      this.log('Audio context resumed');
    }
  }

  async close(): Promise<void> {
    if (this.context) {
      await this.context.close();
      this.context = null;
      this.initialized = false;
      this.log('Audio context closed');
    }
  }

  isInitialized(): boolean {
    return this.initialized && this.context?.state === 'running';
  }

  getState(): string {
    return this.context?.state || 'closed';
  }
}

export const audioContextManager = AudioContextManager.getInstance();