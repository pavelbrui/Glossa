import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import useServiceStore from '../store/useServiceStore';
import type { Service } from '../config/supabase';

interface EditServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service;
}

const AVAILABLE_LANGUAGES = ['English', 'Spanish', 'French', 'Korean', 'Russian'];

const EditServiceModal: React.FC<EditServiceModalProps> = ({ isOpen, onClose, service }) => {
  const [title, setTitle] = useState(service.title);
  const [date, setDate] = useState(service.date);
  const [time, setTime] = useState(service.time);
  const [languages, setLanguages] = useState(service.languages);
  const updateService = useServiceStore((state) => state.updateService);

  useEffect(() => {
    setTitle(service.title);
    setDate(service.date);
    setTime(service.time);
    setLanguages(service.languages);
  }, [service]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateService(service.id, {
      title,
      date,
      time,
      languages
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Service</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Languages
            </label>
            <div className="space-y-2">
              {AVAILABLE_LANGUAGES.map((lang) => (
                <label key={lang} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={languages.includes(lang)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setLanguages([...languages, lang]);
                      } else {
                        setLanguages(languages.filter((l) => l !== lang));
                      }
                    }}
                    className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">{lang}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-2 px-4 rounded-lg hover:from-orange-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            Update Service
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditServiceModal;