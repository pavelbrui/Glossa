import { useState, useEffect, useCallback, useRef } from 'react';
import { mockWebSocketService } from '../services/mockWebSocket';

interface Translation {
  original: string;
  translation: string;
  timestamp: Date;
  audioData?: ArrayBuffer;
}

export const useTranslationSocket = (serviceId: string, language: string) => {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error' | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [debugMessages, setDebugMessages] = useState<string[]>([]);
  const audioContext = useRef<AudioContext | null>(null);
  const currentAudio = useRef<AudioBufferSourceNode | null>(null);
  const lastHeartbeat = useRef<number>(Date.now());
  const sessionId = useRef<string>(crypto.randomUUID());

  const addDebugMessage = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugMessages(prev => [...prev, `${timestamp} - ${message}`].slice(-20));
  }, []);

  const playAudio = useCallback(async (audioData: ArrayBuffer) => {
    try {
      if (!audioContext.current) {
        audioContext.current = new AudioContext();
      }

      if (currentAudio.current) {
        currentAudio.current.stop();
      }

      const audioBuffer = await audioContext.current.decodeAudioData(audioData);
      const source = audioContext.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.current.destination);
      
      currentAudio.current = source;
      source.start(0);
      
      addDebugMessage('Playing audio translation');
      
      source.onended = () => {
        currentAudio.current = null;
        addDebugMessage('Audio playback completed');
      };
    } catch (error) {
      console.error('Failed to play audio:', error);
      addDebugMessage(`Audio playback error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [addDebugMessage]);

  const handleMessage = useCallback((data: any) => {
    if (data.type === 'heartbeat') {
      lastHeartbeat.current = Date.now();
      return;
    }

    addDebugMessage(`Received ${data.type} message`);

    if (data.type === 'status') {
      setStatus(data.status);
      addDebugMessage(data.message);
    }
    else if (data.type === 'translation') {
      const newTranslation = {
        original: data.original,
        translation: data.translation,
        timestamp: new Date(data.timestamp),
        audioData: data.audioData
      };
      
      setTranslations(prev => {
        const isDuplicate = prev.some(t => 
          t.original === newTranslation.original && 
          t.translation === newTranslation.translation &&
          Math.abs(t.timestamp.getTime() - newTranslation.timestamp.getTime()) < 5000
        );
        
        if (!isDuplicate) {
          addDebugMessage(`New translation: ${newTranslation.translation}`);
          if (newTranslation.audioData) {
            playAudio(newTranslation.audioData);
          }
          return [...prev, newTranslation].slice(-10);
        }
        return prev;
      });
      
      setLastUpdate(new Date());
    }
  }, [addDebugMessage, playAudio]);

  useEffect(() => {
    const healthCheck = setInterval(() => {
      const timeSinceLastHeartbeat = Date.now() - lastHeartbeat.current;
      if (timeSinceLastHeartbeat > 10000) {
        setStatus('error');
        addDebugMessage('Connection lost - no heartbeat received');
      }
    }, 5000);

    return () => clearInterval(healthCheck);
  }, [addDebugMessage]);

  useEffect(() => {
    addDebugMessage(`Connecting to service ${serviceId} for ${language}`);
    setStatus('connecting');

    try {
      const unsubscribe = mockWebSocketService.subscribe(
        serviceId,
        language,
        sessionId.current,
        handleMessage
      );

      addDebugMessage('Connected successfully');

      return () => {
        unsubscribe();
        setStatus(null);
        addDebugMessage('Disconnected from service');
        
        if (audioContext.current) {
          audioContext.current.close();
          audioContext.current = null;
        }
      };
    } catch (error) {
      console.error('Connection error:', error);
      addDebugMessage(`Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setStatus('error');
      return () => {};
    }
  }, [serviceId, language, handleMessage, addDebugMessage]);

  const replayAudio = useCallback((translation: Translation) => {
    if (translation.audioData) {
      playAudio(translation.audioData);
    }
  }, [playAudio]);

  return { translations, status, lastUpdate, debugMessages, replayAudio };
};