import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Service } from '../config/supabase';

interface ServiceState {
  services: Service[];
  currentService: Service | null;
  loading: boolean;
  error: string | null;
  loadServices: () => Promise<void>;
  getService: (id: string | number) => Service | null;
  addService: (service: Omit<Service, 'id' | 'created_at'>) => Promise<void>;
  updateService: (id: string, service: Partial<Service>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  setCurrentService: (service: Service | null) => void;
  setServiceLiveStatus: (id: string | number, isLive: boolean) => Promise<void>;
}

// Initial mock services
const MOCK_SERVICES: Service[] = [
  {
    id: '1',
    title: 'Sunday Service',
    date: '2024-11-23',
    time: '10:00',
    is_live: false,
    created_by: '1',
    created_at: new Date().toISOString(),
    languages: ['English', 'Spanish', 'French', 'Russian']
  },
  {
    id: '2',
    title: 'Youth Service',
    date: '2024-11-23',
    time: '18:00',
    is_live: false,
    created_by: '1',
    created_at: new Date().toISOString(),
    languages: ['English', 'Spanish', 'Korean']
  }
];

const useServiceStore = create<ServiceState>()(
  persist(
    (set, get) => ({
      services: MOCK_SERVICES,
      currentService: null,
      loading: false,
      error: null,

      getService: (id) => {
        const stringId = String(id);
        return get().services.find(s => s.id === stringId) || null;
      },

      loadServices: async () => {
        set({ loading: true, error: null });
        try {
          // Always use persisted data
          const services = get().services;
          set({ services, loading: false });
        } catch (error) {
          console.error('Error loading services:', error);
          set({ 
            services: MOCK_SERVICES,
            error: 'Using offline data',
            loading: false 
          });
        }
      },

      addService: async (service) => {
        set({ loading: true, error: null });
        try {
          const newService = {
            ...service,
            id: String(Date.now()),
            created_at: new Date().toISOString()
          };
          set(state => ({ 
            services: [newService, ...state.services],
            loading: false 
          }));
        } catch (error) {
          console.error('Error adding service:', error);
          set({ 
            error: 'Failed to add service', 
            loading: false 
          });
        }
      },

      updateService: async (id, updates) => {
        set({ loading: true, error: null });
        try {
          set(state => ({
            services: state.services.map(service => 
              service.id === id ? { ...service, ...updates } : service
            ),
            currentService: state.currentService?.id === id 
              ? { ...state.currentService, ...updates }
              : state.currentService,
            loading: false
          }));
        } catch (error) {
          console.error('Error updating service:', error);
          set({ 
            error: 'Failed to update service', 
            loading: false 
          });
        }
      },

      deleteService: async (id) => {
        set({ loading: true, error: null });
        try {
          set(state => ({
            services: state.services.filter(service => service.id !== id),
            currentService: state.currentService?.id === id ? null : state.currentService,
            loading: false
          }));
        } catch (error) {
          console.error('Error deleting service:', error);
          set({ 
            error: 'Failed to delete service', 
            loading: false 
          });
        }
      },

      setCurrentService: (service) => {
        set({ currentService: service });
      },

      setServiceLiveStatus: async (id, isLive) => {
        console.log("setServiceLiveStatus: true");
        
        const stringId = String(id);
        set({ loading: true, error: null });
        try {
          set(state => ({
            services: state.services.map(service =>
              service.id === stringId ? { ...service, is_live: isLive } : service
            ),
            currentService: state.currentService?.id === stringId
              ? { ...state.currentService, is_live: isLive }
              : state.currentService,
            loading: false
          }));
        } catch (error) {
          console.error('Error updating service live status:', error);
          set({ 
            error: 'Failed to update service status', 
            loading: false 
          });
        }
      }
    }),
    {
      name: 'glossa-services',
      version: 1,
    }
  )
);

export default useServiceStore;