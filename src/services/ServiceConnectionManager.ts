import { mockWebSocketService } from './mockWebSocket';

class ServiceConnectionManager {
  private static instance: ServiceConnectionManager;
  private activeConnections: Map<string, {
    serviceId: string;
    language: string;
    sessionId: string;
    cleanup: () => void;
  }> = new Map();
  private debug: boolean = true;

  private constructor() {}

  private log(...args: any[]) {
    if (this.debug) {
      console.log('[ConnectionManager]', ...args);
    }
  }

  private error(...args: any[]) {
    console.error('[ConnectionManager]', ...args);
  }

  static getInstance(): ServiceConnectionManager {
    if (!this.instance) {
      this.instance = new ServiceConnectionManager();
    }
    return this.instance;
  }

  private generateConnectionId(serviceId: string, sessionId: string): string {
    return `${serviceId}:${sessionId}`;
  }

  connect(
    serviceId: string,
    language: string,
    sessionId: string,
    onMessage: (data: any) => void,
    onConnect: () => Promise<void>,
    onDisconnect: () => Promise<void>
  ): () => Promise<void> {
    const connectionId = this.generateConnectionId(serviceId, sessionId);

    // If connection already exists, clean it up first
    if (this.activeConnections.has(connectionId)) {
      this.log('Cleaning up existing connection:', connectionId);
      this.disconnect(serviceId, sessionId);
    }

    this.log('Establishing new connection:', connectionId);

    // Set up WebSocket subscription
    const unsubscribe = mockWebSocketService.subscribe(serviceId, language, sessionId, onMessage);

    // Create cleanup function
    const cleanup = async () => {
      this.log('Running cleanup for:', connectionId);
      unsubscribe();
      await onDisconnect();
      this.activeConnections.delete(connectionId);
    };

    // Store connection details
    this.activeConnections.set(connectionId, {
      serviceId,
      language,
      sessionId,
      cleanup
    });

    // Initialize connection
    onConnect().catch(error => {
      this.error('Connection initialization error:', error);
      this.disconnect(serviceId, sessionId);
    });

    return async () => {
      await this.disconnect(serviceId, sessionId);
    };
  }

  async disconnect(serviceId: string, sessionId: string): Promise<void> {
    const connectionId = this.generateConnectionId(serviceId, sessionId);
    const connection = this.activeConnections.get(connectionId);

    if (connection) {
      this.log('Disconnecting:', connectionId);
      await connection.cleanup();
    }
  }

  isConnected(serviceId: string, sessionId: string): boolean {
    return this.activeConnections.has(this.generateConnectionId(serviceId, sessionId));
  }

  getActiveConnections(): string[] {
    return Array.from(this.activeConnections.keys());
  }
}

export const serviceConnectionManager = ServiceConnectionManager.getInstance();