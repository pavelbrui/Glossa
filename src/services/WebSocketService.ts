import { WebSocketClient } from './websocket/WebSocketClient';

class WebSocketService {
  private static instance: WebSocketService;
  private client: WebSocketClient;

  private constructor() {
    const url = 'wss://websocketserver-production-4d22.up.railway.app/';
    this.client = new WebSocketClient(url);
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      console.log('Connecting to WebSocket server...');
     // await this.client.connect();
      console.log('WebSocket connection established successfully.');
    } catch (error) {
      console.error('Failed to initialize WebSocket service:', error);
    }
  }

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  subscribe(
    serviceId: string,
    language: string,
    sessionId: string,
    callback: (data: any) => void
  ): () => void {
    return this.client.subscribe(serviceId, language, sessionId, callback);
  }

  broadcast(serviceId: string, data: any): void {
    this.client.broadcast(serviceId, data);
  }

  close(): void {
    this.client.close();
  }
}

export const webSocketService = WebSocketService.getInstance();
