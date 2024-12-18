import { EventEmitter } from './EventEmitter';
import { azureSpeechService } from './azure/AzureSpeechService';
import { azureAudioPlayer } from './azure/AzureAudioPlayer';
import { audioContextManager } from './audio/AudioContextManager';

export class MockWebSocketService extends EventEmitter {
  private static instance: MockWebSocketService;
  activeServices: Map<string, Map<string, { count: number, callback: (data: any) => void }>> = new Map();
  private debug: boolean = true;

  private constructor() {
    super();
    this.setMaxListeners(100);
  }

  private log(...args: any[]) {
    if (this.debug) {
      console.log('[WebSocket]', ...args);
    }
  }

  static getInstance(): MockWebSocketService {
    if (!MockWebSocketService.instance) {
      MockWebSocketService.instance = new MockWebSocketService();
    }
    return MockWebSocketService.instance;
  }

  subscribe(serviceId: string, language: string, sessionId: string, callback: (data: any) => void) {
    if (!this.activeServices.has(serviceId)) {
      this.activeServices.set(serviceId, new Map());
    }

    const serviceMap = this.activeServices.get(serviceId)!;
    const key = `${language}:${sessionId}`;
    
    console.log('[WebSocket] New subscription:', { serviceId, language, sessionId });
    
    // Clean up any existing subscription for this session
    if (serviceMap.has(key)) {
      console.log('[WebSocket] Cleaning up subscription:', key);
      serviceMap.delete(key);
    }

    // Add new subscription
    serviceMap.set(key, { count: 1, callback });
    
    console.log('[WebSocket] Subscription active:', {
      serviceId,
      language,
      activeListeners: Array.from(serviceMap.keys())
    });

    // Send initial connection status
    callback({
      type: 'status',
      status: 'connected',
      message: `Connected to service ${serviceId} for ${language} translations`
    });

    const heartbeatInterval = setInterval(() => {
      if (serviceMap.has(key)) {
        callback({
          type: 'heartbeat',
          timestamp: new Date().toISOString()
        });
      } else {
        clearInterval(heartbeatInterval);
      }
    }, 5000);

    return () => {
      clearInterval(heartbeatInterval);
      this.unsubscribe(serviceId, language, sessionId);
    };
  }

  unsubscribe(serviceId: string, language: string, sessionId: string) {
    const serviceMap = this.activeServices.get(serviceId);
    if (serviceMap) {
      const key = `${language}:${sessionId}`;
      serviceMap.delete(key);
      
      if (serviceMap.size === 0) {
        this.activeServices.delete(serviceId);
      }
    }
    
    this.log(`Unsubscribed from service ${serviceId} for language ${language}`);
  }

  async broadcast(serviceId: string, data: any) {
    const serviceMap = this.activeServices.get(serviceId);
    console.log(this.activeServices)
    console.log('---------------------------------------------')
    console.log('serviceMap', serviceMap)
    console.log('---------------------------------------------')
    
    if (!serviceMap || serviceMap.size === 0) {
      console.log('[WebSocket] No active listeners:', serviceId);
      return;
    }

    console.log('[WebSocket] Broadcasting:', {
      original: data.original,
      translations: data.translations
    });

    for (const [key, { callback }] of serviceMap.entries()) {
      const [language] = key.split(':');
      // Convert language code to match Azure's format
      const azureLanguageCode = AZURE_CONFIG.languageMap[language as keyof typeof AZURE_CONFIG.languageMap];
      const translation = data.translations?.[azureLanguageCode];

      console.log('[WebSocket] Processing translation:', { language, translation });

      if (!translation) {
        console.log('[WebSocket] No translation for:', language, '(', azureLanguageCode, ')');
        continue;
      }

      try {
        console.log('[WebSocket] Generating audio:', language);
        const audioData = await azureSpeechService.synthesizeSpeech(
          translation,
          azureLanguageCode
        );

        console.log('[WebSocket] Audio generated:', language);

        const translationData = {
          type: 'translation',
          original: data.original,
          translation: translation,
          timestamp: new Date().toISOString(),
          final: data.final,
          audioData
        };

        console.log('[WebSocket] Emitting translation:', { serviceId, language, translation });
        callback(translationData);
      } catch (error) {
        console.error(`Failed to process translation for ${language}:`, error);
        callback({
          type: 'error',
          message: `Failed to generate audio: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  isServiceActive(serviceId: string): boolean {
    return this.activeServices.has(serviceId) && this.activeServices.get(serviceId)!.size > 0;
  }

  getActiveLanguages(serviceId: string): string[] {
    const serviceMap = this.activeServices.get(serviceId);
    return serviceMap ? Array.from(serviceMap.keys()).map(key => key.split(':')[0]) : [];
  }
}

export const mockWebSocketService = MockWebSocketService.getInstance();