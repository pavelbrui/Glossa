import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Users, Radio } from 'lucide-react';
import useServiceStore from '../store/useServiceStore';

const UserDashboard = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('All Languages');
  const services = useServiceStore((state) => state.services);

  const filteredServices = selectedLanguage === 'All Languages'
    ? services
    : services.filter(service => service.languages.includes(selectedLanguage));

  const allLanguages = ['All Languages', ...new Set(services.flatMap(s => s.languages))];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Available Services</h1>
        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          className="rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          {allLanguages.map(lang => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredServices.map((service) => (
          <Link
            key={service.id}
            to={`/service/${service.id}`}
            className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-semibold text-gray-800">{service.title}</h3>
                {service.isLive && (
                  <span className="flex items-center space-x-1 bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium">
                    <Radio className="h-4 w-4 animate-pulse" />
                    <span>Live</span>
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-2 text-gray-600">
                <Calendar className="h-5 w-5" />
                <span>{service.date}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-gray-600">
                <Clock className="h-5 w-5" />
                <span>{service.time}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-gray-600">
                <Users className="h-5 w-5" />
                <span>{service.attendees} listening</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {service.languages.map((lang) => (
                  <span
                    key={lang}
                    className="px-3 py-1 text-sm bg-indigo-50 text-indigo-700 rounded-full"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default UserDashboard;