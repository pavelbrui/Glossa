import { useState, useEffect, useCallback, useRef } from 'react';
import { webSocketService } from '../services/WebSocketService';
import { azureAudioPlayer } from '../services/azure/AzureAudioPlayer';
import { audioContextManager } from '../services/audio/AudioContextManager';

interface Translation {
  original: string;
  translation: string;
  timestamp: Date;
  audioData?: ArrayBuffer;
}

const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);

  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes.buffer;
};

export function useServiceConnection(serviceId: string, language: string) {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error' | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [debugMessages, setDebugMessages] = useState<string[]>([]);
  const lastHeartbeat = useRef<number>(Date.now());
  const sessionId = useRef<string>(crypto.randomUUID());
  const cleanupRef = useRef<(() => void) | null>(null);
  const isActive = useRef(true);

  const addDebugMessage = useCallback((message: string) => {
    if (!isActive.current) return;
    const timestamp = new Date().toLocaleTimeString();
    setDebugMessages(prev => [...prev, `${timestamp} - ${message}`].slice(-20));
  }, []);

  const handleMessage = useCallback(async (data: any) => {
    if (!isActive.current) return;

    if (data.type === 'heartbeat') {
      lastHeartbeat.current = Date.now();
      return;
    }

    if (data.type === 'status') {
      setStatus(data.status);
      addDebugMessage(data.message);
      return;
    }

    if (data.type === 'error') {
      addDebugMessage(data.message);
      return;
    }

    if (data.type === 'translation') {
      console.log('data.type === translation',  data.translation);
      try {
        const audioBuffer = base64ToArrayBuffer(data.audioData);
        const newTranslation: Translation = {
          original: data.original,
          translation: data.translation,
          timestamp: new Date(data.timestamp),
          audioData: audioBuffer,
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
              azureAudioPlayer.playAudioData(newTranslation.audioData, {
                onStart: () => addDebugMessage('Playing audio translation'),
                onEnd: () => addDebugMessage('Audio playback completed'),
                onError: (error) => addDebugMessage(`Audio playback error: ${error.message}`)
              }).catch(error => {
                addDebugMessage(`Failed to play audio: ${error.message}`);
          });
        }
            return [...prev, newTranslation].slice(-10);
          }
          return prev;
        });
        
        setLastUpdate(new Date());
      } catch (error) {
        addDebugMessage(`Error processing translation: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }, [addDebugMessage]);
  useEffect(() => {
    const initAudioIfNeeded = async () => {
      if (!audioContextManager.isInitialized()) {
        await audioContextManager.initialize();
      }
    };
    initAudioIfNeeded();
  }, []);

  useEffect(() => {
    isActive.current = true;
    addDebugMessage(`Connecting to service ${serviceId} for ${language}`);
    //setStatus('connecting');

    try {
      // Initialize audio context early
      audioContextManager.initialize().catch(error => {
        addDebugMessage(`Audio initialization error: ${error.message}`);
      });

      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      
      const cleanup = webSocketService.subscribe(
        serviceId,
        language,
        sessionId.current,
        handleMessage
      );
      
      cleanupRef.current = cleanup;
      addDebugMessage('Connected successfully');

      return () => {
        isActive.current = false;
        if (cleanupRef.current) {
          cleanupRef.current();
          cleanupRef.current = null;
        }
        setStatus(null);
        addDebugMessage('Disconnected from service');
        azureAudioPlayer.cleanup().catch(console.error);
      };
    } catch (error) {
      console.error('Connection error:', error);
      addDebugMessage(`Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setStatus('error');
      return () => {
        isActive.current = false;
      };
    }
  }, [serviceId, language, handleMessage, addDebugMessage]);

  useEffect(() => {
    const healthCheck = setInterval(() => {
      if (!isActive.current) return;
      const timeSinceLastHeartbeat = Date.now() - lastHeartbeat.current;
      if (timeSinceLastHeartbeat > 100000) {
        //setStatus('error');
        addDebugMessage('Connection lost - no heartbeat received');
      }
    }, 5000);

    return () => clearInterval(healthCheck);
  }, [addDebugMessage]);

  const replayAudio = useCallback(async (translation: Translation) => {
    console.log('if (!translation.audioData) return;');
    console.log(translation);
    
    
    if (!translation.audioData) return;
    
    try {
      await azureAudioPlayer.playAudioData(translation.audioData, {
        onStart: () => addDebugMessage('Replaying audio translation'),
        onEnd: () => addDebugMessage('Audio replay completed'),
        onError: (error) => addDebugMessage(`Audio replay error: ${error.message}`)
      });
    } catch (error) {
      addDebugMessage(`Failed to replay audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [addDebugMessage]);

  return { translations, status, lastUpdate, debugMessages, replayAudio };
}