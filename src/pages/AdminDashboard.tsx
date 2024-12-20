import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Users, Clock, Edit, Trash2 } from 'lucide-react';
import useServiceStore from '../store/useServiceStore';
import CreateServiceModal from '../components/CreateServiceModal';
import EditServiceModal from '../components/EditServiceModal';
import type { Service } from '../db';

const AdminDashboard = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const services = useServiceStore((state) => state.services);
  const deleteService = useServiceStore((state) => state.deleteService);

  const handleEdit = (service: Service) => {
    setSelectedService(service);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      deleteService(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Service Management</h1>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-red-700"
        >
          Create New Service
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <div
            key={service.id}
            className="bg-white rounded-xl shadow-sm overflow-hidden"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  {service.title}
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(service)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(service.id!)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-gray-600">
                  <Clock className="h-5 w-5 mr-2" />
                  <span>{service.date} - {service.time}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Users className="h-5 w-5 mr-2" />
                  <span>{service.attendees} listeners</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {service.languages.map((lang) => (
                  <span
                    key={lang}
                    className="px-3 py-1 text-sm bg-orange-50 text-orange-700 rounded-full"
                  >
                    {lang}
                  </span>
                ))}
              </div>

              <Link
                to={`/admin/service/${service.id}`}
                className="flex items-center justify-center w-full bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-red-700"
              >
                <Play className="h-5 w-5 mr-2" />
                Start Streaming
              </Link>
            </div>
          </div>
        ))}
      </div>

      <CreateServiceModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {selectedService && (
        <EditServiceModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedService(null);
          }}
          service={selectedService}
        />
      )}
    </div>
  );
};

export default AdminDashboard;