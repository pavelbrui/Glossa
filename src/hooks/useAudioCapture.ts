import { useState, useEffect } from 'react';

export const useAudioCapture = () => {
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCapture = async (deviceId?: string) => {
    try {
      const constraints: MediaStreamConstraints = {
        audio: deviceId ? { deviceId: { exact: deviceId } } : true
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setAudioStream(stream);
      setError(null);
    } catch (err) {
      setError('Failed to access microphone');
      console.error('Audio capture error:', err);
    }
  };

  const stopCapture = () => {
    if (audioStream) {
      audioStream.getTracks().forEach(track => track.stop());
      setAudioStream(null);
    }
  };

  useEffect(() => {
    return () => {
      stopCapture();
    };
  }, []);

  return { audioStream, error, startCapture, stopCapture };
};