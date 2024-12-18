import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Volume2, Globe, MessageSquare, Radio, Clock, AlertCircle } from 'lucide-react';
import useServiceStore from '../store/useServiceStore';
import { useServiceConnection } from '../hooks/useServiceConnection';
import { AZURE_CONFIG } from '../config/azure';
import { audioContextManager } from '../services/audio/AudioContextManager';

const ServicePage = () => {
  const { id } = useParams();
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [volume, setVolume] = useState(80);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [audioInitialized, setAudioInitialized] = useState(false);
  const navigate = useNavigate();
  
  const service = useServiceStore(state => state.getService(id || ''));
  const languageCode = AZURE_CONFIG.languageMap[selectedLanguage as keyof typeof AZURE_CONFIG.languageMap];
  
  const { 
    translations, 
    status, 
    lastUpdate, 
    debugMessages, 
    replayAudio 
  } = useServiceConnection(id!, languageCode);

  // Initialize audio context
  useEffect(() => {
    const initAudio = async () => {
      try {
        await audioContextManager.initialize();
        setAudioInitialized(true);
      } catch (error) {
        console.error('Failed to initialize audio:', error);
      }
    };

    const handleClick = async () => {
      if (!audioInitialized) {
        await audioContextManager.handleUserInteraction();
        setAudioInitialized(true);
      }
    };

    document.addEventListener('click', handleClick);
    initAudio();

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [audioInitialized]);

  // Handle volume changes
  useEffect(() => {
    if (!audioInitialized) return;

    try {
      const context = audioContextManager.getContext();
      const gainNode = context.createGain();
      gainNode.gain.value = volume / 100;
      gainNode.connect(context.destination);
      return () => {
        gainNode.disconnect();
      };
    } catch (error) {
      console.error('Error setting volume:', error);
    }
  }, [volume, audioInitialized]);

  useEffect(() => {
    if (!service || !id) {
      console.log('[ServicePage] Service not found, redirecting to home');
      navigate('/');
      return;
    }
  }, [service, id, navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!service) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-gray-800">{service.title}</h1>
            {service.is_live && (
              <div className="flex items-center space-x-2 text-red-600">
                <Radio className="h-4 w-4 animate-pulse" />
                <span className="text-sm font-medium">Live Now</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Volume2 className="h-5 w-5 text-gray-600" />
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-24"
              />
            </div>
            
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
            >
              {service.languages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
        </div>

        {!audioInitialized && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Click anywhere on the page to enable audio playback
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>Live Translation - {selectedLanguage}</span>
              </h2>
              <div className="flex items-center space-x-2">
                {status === 'connecting' && (
                  <span className="text-yellow-600 text-sm">Connecting...</span>
                )}
                {status === 'connected' && (
                  <span className="text-green-600 text-sm">Connected</span>
                )}
                {status === 'error' && (
                  <span className="text-red-600 text-sm">Connection Error</span>
                )}
                {lastUpdate && (
                  <span className="text-gray-500 text-sm">
                    Last update: {lastUpdate.toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {translations.map((translation, index) => (
                <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">
                      {translation.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-gray-800">{translation.translation}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Original: {translation.original}
                  </p>
                </div>
              ))}
              {translations.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Waiting for translations in {selectedLanguage}...
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start space-x-4">
            <MessageSquare className="h-5 w-5 text-gray-600 mt-1" />
            <div className="flex-1">
              <h3 className="font-medium text-gray-800">Translation Status</h3>
              <p className="text-gray-600">
                {service.is_live ? 'Service is live - receiving translations' : 'Waiting for service to start...'}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <Clock className="h-5 w-5 text-gray-600 mt-1" />
            <div className="flex-1">
              <h3 className="font-medium text-gray-800">Connection Info</h3>
              <p className="text-gray-600">
                {lastUpdate 
                  ? `Last update received at ${lastUpdate.toLocaleTimeString()}`
                  : 'No updates received yet'}
              </p>
            </div>
          </div>

          {status === 'error' && (
            <div className="flex items-start space-x-4">
              <AlertCircle className="h-5 w-5 text-red-600 mt-1" />
              <div className="flex-1">
                <h3 className="font-medium text-red-600">Connection Error</h3>
                <p className="text-red-600">
                  Failed to connect to translation service. Please try refreshing the page.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Debug Information</h2>
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm space-y-1 max-h-40 overflow-y-auto">
          {debugMessages.map((message, index) => (
            <div key={index}>{message}</div>
          ))}
          {debugMessages.length === 0 && <div>No debug messages yet</div>}
        </div>
      </div>

      <footer className="text-center text-gray-600 text-sm py-4">
        Current Server Time: {currentTime.toLocaleString()}
      </footer>
    </div>
  );
};

export default ServicePage;