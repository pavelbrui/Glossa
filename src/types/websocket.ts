export interface WebSocketMessage {
  type: string;
  serviceId: string;
  language?: string;
  sessionId?: string;
  data?: any;
  timestamp?: string;
  error?: string;
}

export interface WebSocketCallback {
  (data: any): void;
}

export interface SubscribeMessage extends WebSocketMessage {
  type: 'subscribe';
}

export interface UnsubscribeMessage extends WebSocketMessage {
  type: 'unsubscribe';
}

export interface BroadcastMessage extends WebSocketMessage {
  type: 'broadcast';
  data: any;
}

export interface TranslationMessage {
  type: 'translation';
  original: string;
  translation: string;
  timestamp: string;
  audioData?: ArrayBuffer;
  final?: boolean;
}

export interface StatusMessage {
  type: 'status';
  status: 'connected' | 'disconnected' | 'error';
  message: string;
}

// export interface HeartbeatMessage {
//   type: 'heartbeat';
//   timestamp: string;
// }