import React from 'react';
import { Mic, Volume2, Play, Square } from 'lucide-react';

interface AudioControlsProps {
  isStreaming: boolean;
  onToggleStream: () => void;
  inputLevel: number;
  outputLevel: number;
}

const AudioControls: React.FC<AudioControlsProps> = ({
  isStreaming,
  onToggleStream,
  inputLevel,
  outputLevel
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Audio Controls</h2>
      
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <Mic className="h-5 w-5 text-gray-600" />
          <div 
            className="w-20 h-2 bg-indigo-600 rounded-full" 
            style={{ opacity: inputLevel / 100 }}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Volume2 className="h-5 w-5 text-gray-600" />
          <div 
            className="w-20 h-2 bg-green-600 rounded-full"
            style={{ opacity: outputLevel / 100 }}
          />
        </div>

        <button
          onClick={onToggleStream}
          className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium ${
            isStreaming
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {isStreaming ? (
            <>
              <Square className="h-5 w-5" />
              <span>Stop Streaming</span>
            </>
          ) : (
            <>
              <Play className="h-5 w-5" />
              <span>Start Streaming</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AudioControls;