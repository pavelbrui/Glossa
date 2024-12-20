import { EventEmitter } from '../EventEmitter';
import { WebSocketConnection } from './WebSocketConnection';
import type { WebSocketMessage, WebSocketCallback } from '../../types/websocket';

export class WebSocketClient extends EventEmitter {
  private connection: WebSocketConnection;
  private subscriptions = new Map<string, WebSocketCallback>();
  private heartbeatIntervals = new Map<string, NodeJS.Timeout>();
  private debug: boolean = true;

  constructor(url: string) {
    super();
    this.connection = new WebSocketConnection(url);
    this.connect();
  }

  private log(...args: any[]) {
    if (this.debug) {
      console.log('[WebSocketClient]', ...args);
    }
  }

  private getSubscriptionKey(serviceId: string, language: string, sessionId?: string): string {
    return sessionId ? `${serviceId}:${language}:${sessionId}` : `${serviceId}:${language}`;
  }

  private async connect(): Promise<void> {
    try {
      this.log('Attempting to connect to WebSocket server...');
      const ws = await this.connection.connect();

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.log('Received message:', message.type);
          this.handleMessage(message);
        } catch (error) {
          console.error('Error processing message:', error);
        }
      };

      ws.onclose = async () => {
        this.log('Connection closed, attempting to reconnect...');
        this.emit('disconnected', 'ZZZZZ');
        try {
          await this.reconnect();
          this.log('Successfully reconnected');
          this.emit('reconnected', 'XXXXXX');
          await this.resubscribeAll();
        } catch (error) {
          this.log('Reconnection failed:', error);
          this.emit('error', error);
        }
      };
    } catch (error) {
      this.log('Connection failed:', error);
      this.emit('error', error);
    }
  }

  private async reconnect(): Promise<void> {
    await this.connection.reconnect();
  }

  private async resubscribeAll(): Promise<void> {
    for (const [key, callback] of this.subscriptions.entries()) {
      const [serviceId, language, sessionId] = key.split(':');
      try {
        this.subscribe(serviceId, language, sessionId, callback);
        this.log(`Resubscribed: ${key}`);
      } catch (error) {
        console.error(`Failed to resubscribe ${key}:`, error);
      }
    }
  }

  private handleMessage(message: WebSocketMessage): void {
    const key = this.getSubscriptionKey(
      message.serviceId || '',
      message.language || '',
      "1"
    );

    if (message.type === 'heartbeat' || message.type === 'status') {
      this.log(`Handled ${message.type} message:`, message);
      return;
    }

    const callback = this.subscriptions.get(key);
    if (callback) {
      console.log("if callback");
      
      this.log(`Executing callback for ${key}`);
      callback(message);
    } else {
      this.log(`No callback found for ${key}`);
    }
  }

  subscribe(
    serviceId: string,
    language: string,
    sessionId: string,
    callback: WebSocketCallback
  ): () => void {
    const key = this.getSubscriptionKey(serviceId, language, "1");
    this.subscriptions.set(key, callback);

    this.connection.send({
      type: 'subscribe',
      serviceId,
      language,
      sessionId,
    });

    const heartbeatInterval = setInterval(() => {
      try {
        this.connection.send({
          type: 'heartbeat',
          serviceId,
          language,
          sessionId,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Heartbeat error:', error);
      }
    }, 5000);

    this.heartbeatIntervals.set(key, heartbeatInterval);

    return () => this.unsubscribe(serviceId, language, sessionId);
  }

  private unsubscribe(serviceId: string, language: string, sessionId: string): void {
    const key = this.getSubscriptionKey(serviceId, language, "1");

    clearInterval(this.heartbeatIntervals.get(key));
    this.heartbeatIntervals.delete(key);
    this.subscriptions.delete(key);

    this.connection.send({
      type: 'unsubscribe',
      serviceId,
      language,
      sessionId
    });
  }

  async broadcast(serviceId: string, data: any): Promise<void> {
    this.connection.send({
      type: 'broadcast',
      serviceId,
      data,
      timestamp: new Date().toISOString()
    });
  }

  close(): void {
    this.heartbeatIntervals.forEach((interval) => clearInterval(interval));
    this.heartbeatIntervals.clear();
    this.subscriptions.clear();
    this.connection.close();
  }
}
