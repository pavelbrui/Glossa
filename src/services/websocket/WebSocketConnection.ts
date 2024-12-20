export class WebSocketConnection {
  private url: string;
  private ws: WebSocket | null = null;
  private reconnectAttempts: number = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private readonly RECONNECT_INTERVAL = 2000; // in milliseconds

  constructor(url: string) {
    this.url = url;
  }

  private log(...args: any[]) {
    console.log('[WebSocketConnection]', ...args);
  }

  async connect(): Promise<WebSocket> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.log('WebSocket is already open');
      return this.ws;
    }

    this.log('Connecting to WebSocket:', this.url);
    this.ws = new WebSocket(this.url);

    return new Promise((resolve, reject) => {
      this.ws!.onopen = () => {
        this.log('WebSocket connected');
        this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection
        resolve(this.ws!);
      };

      this.ws!.onerror = (error) => {
        this.log('WebSocket error:', error);
        reject(error);
      };

      this.ws!.onclose = () => {
        this.log('WebSocket closed');
      };
    });
  }

  async reconnect(): Promise<void> {
    if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
      throw new Error('Max reconnect attempts reached');
    }

    this.reconnectAttempts++;
    this.log(`Reconnection attempt ${this.reconnectAttempts}...`);

    await new Promise((resolve) => setTimeout(resolve, this.RECONNECT_INTERVAL));
    await this.connect();
  }

  send(data: any): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.log('WebSocket is not open. Cannot send data');
      return;
    }

    try {
      this.ws.send(JSON.stringify(data));
      //this.log('Sent data:', data);
    } catch (error) {
      console.error('Failed to send data via WebSocket:', error);
    }
  }

  close(): void {
    if (this.ws) {
      this.log('Closing WebSocket');
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}
