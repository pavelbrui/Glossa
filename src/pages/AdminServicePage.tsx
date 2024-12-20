import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAudioCapture } from '../hooks/useAudioCapture';
import { translationService } from '../services/translationService';
import AudioControls from '../components/AudioControls';
import useServiceStore from '../store/useServiceStore';
import { MessageSquare, Radio, AlertCircle, Globe } from 'lucide-react';

interface Translation {
  original: string;
  translations: Record<string, string>;
  timestamp: string;
}

const AdminServicePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedSource, setSelectedSource] = useState('');
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [inputLevel, setInputLevel] = useState(0);
  const [outputLevel, setOutputLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error' | null>(null);
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  
  const { audioStream, error: captureError, startCapture, stopCapture } = useAudioCapture();
  const currentService = useServiceStore(state => state.getService(id || ''));
  const setServiceLiveStatus = useServiceStore(state => state.setServiceLiveStatus);

  useEffect(() => {
    if (!id || !currentService) {
      console.error('[AdminServicePage] Service not found:', id);
      navigate('/admin');
      return;
    }
  }, [id, currentService, navigate]);

  const addDebugMessage = (message: string, isError = false) => {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = isError ? '🔴' : '🟢';
    setDebugInfo(prev => [...prev, `[${timestamp}] ${prefix} ${message}`].slice(-20));
  };

  useEffect(() => {
    const loadDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter(device => device.kind === 'audioinput');
        setAudioDevices(audioInputs);
        if (audioInputs.length > 0) {
          setSelectedSource(audioInputs[0].deviceId);
        }
        addDebugMessage(`Found ${audioInputs.length} audio input devices`);
        audioInputs.forEach(device => {
          addDebugMessage(`Device: ${device.label}`);
        });
      } catch (err) {
        setError('Failed to load audio devices');
        addDebugMessage('Error loading audio devices', true);
        console.error('Error loading devices:', err);
      }
    };

    loadDevices();
  }, []);

  const toggleStreaming = async () => {
    if (!id) return;

    try {
      if (!isStreaming) {
        setConnectionStatus('connecting');
        addDebugMessage('Starting audio capture...');
        await startCapture(selectedSource);
        await setServiceLiveStatus(id, true);
        setIsStreaming(true);
        setError(null);
        addDebugMessage('Audio capture started successfully');
      } else {
        addDebugMessage('Stopping stream...');
        stopCapture();
        translationService.stopTranslation();
        await setServiceLiveStatus(id, false);
        setIsStreaming(false);
        setConnectionStatus(null);
        addDebugMessage('Stream stopped successfully');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError('Failed to toggle streaming: ' + errorMsg);
      setConnectionStatus('error');
      addDebugMessage(`Error toggling streaming: ${errorMsg}`, true);
      console.error('Streaming error:', err);
    }
  };

  useEffect(() => {
    if (audioStream && isStreaming && id) {
      try {
        addDebugMessage('Initializing translation service...');

        translationService.startTranslation(id, audioStream, (result) => {
          if (result.error) {
            addDebugMessage(`Translation error: ${result.error}`, true);
            console.log('Error!!---', result.error);
            
            setConnectionStatus('error');
            return;
          }

          if (result.status) {
            addDebugMessage(`Status: ${result.status}`);
            if (result.status === 'Recognition started') {
              setConnectionStatus('connected');
            }
            return;
          }

          if (result.original) {
            const timestamp = new Date().toLocaleTimeString();
            setTranslations(prev => [...prev, {
              original: result.original,
              translations: result.translations || {},
              timestamp
            }].slice(-10));

            addDebugMessage(`Received text: ${result.original}`);
            
            if (result.translations) {
              Object.entries(result.translations).forEach(([lang, text]) => {
                addDebugMessage(`Translation (${lang}): ${String(text)}`);
              });
            }
            setOutputLevel(75);
          }
        });

        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(audioStream);
        microphone.connect(analyser);
        analyser.fftSize = 256;
        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const updateLevel = () => {
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          const level = (average / 255) * 100;
          setInputLevel(level);
        };

        const interval = setInterval(updateLevel, 100);

        return () => {
          clearInterval(interval);
          audioContext.close();
          if (isStreaming) {
            translationService.stopTranslation();
            setServiceLiveStatus(id, false);
            setConnectionStatus(null);
            addDebugMessage('Cleanup: stopped translation service');
          }
        };
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        setError('Failed to start translation: ' + errorMsg);
        setConnectionStatus('error');
        addDebugMessage(`Error starting translation: ${errorMsg}`, true);
        console.error('Translation error:', err);
        setIsStreaming(false);
        setServiceLiveStatus(id, false);
      }
    }
  }, [audioStream, isStreaming, id, setServiceLiveStatus]);

  useEffect(() => {
    if (captureError) {
      setError(captureError);
      setConnectionStatus('error');
      addDebugMessage(`Capture error: ${captureError}`, true);
      setIsStreaming(false);
      if (id) {
        setServiceLiveStatus(id, false);
      }
    }
  }, [captureError, id, setServiceLiveStatus]);

  if (!currentService) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Streaming: {currentService.title}
          </h1>
          {isStreaming && (
            <div className="flex items-center space-x-2 text-red-600">
              <Radio className="h-4 w-4 animate-pulse" />
              <span className="text-sm font-medium">Live</span>
            </div>
          )}
        </div>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Audio Input Source
            </label>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
              disabled={isStreaming}
            >
              {audioDevices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Audio Input ${device.deviceId.slice(0, 8)}`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <AudioControls
        isStreaming={isStreaming}
        onToggleStream={toggleStreaming}
        inputLevel={inputLevel}
        outputLevel={outputLevel}
      />

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>Received Audio Text</span>
            </h2>
            <div className="flex items-center space-x-2">
              {connectionStatus === 'connecting' && (
                <span className="text-yellow-600 text-sm">Connecting to Azure...</span>
              )}
              {connectionStatus === 'connected' && (
                <span className="text-green-600 text-sm">Connected to Azure</span>
              )}
              {connectionStatus === 'error' && (
                <span className="text-red-600 text-sm">Connection Error</span>
              )}
            </div>
          </div>
          <div className="space-y-4">
            {translations.map((result, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-start space-x-2">
                  <div className="bg-gray-50 rounded-lg p-3 flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <MessageSquare className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-500">{result.timestamp}</span>
                    </div>
                    <p className="text-gray-700">{result.original}</p>
                  </div>
                </div>
                {Object.entries(result.translations).map(([lang, text]) => (
                  <div key={lang} className="flex items-start space-x-2 ml-6">
                    <div className="bg-blue-50 rounded-lg p-3 flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Globe className="h-4 w-4 text-blue-500" />
                        <span className="text-sm text-blue-500">{lang.toUpperCase()}</span>
                      </div>
                      <p className="text-gray-700">{String(text)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            {translations.length === 0 && (
              <p className="text-gray-500 italic">No audio text received yet...</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-800">Debug Information</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm space-y-1 max-h-40 overflow-y-auto">
            {debugInfo.map((info, index) => (
              <div key={index}>{info}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminServicePage;