import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ServicePage from './pages/ServicePage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminServicePage from './pages/AdminServicePage';
import useServiceStore from './store/useServiceStore';
import { initializeDb } from './db';

function App() {
  const loadServices = useServiceStore(state => state.loadServices);

  useEffect(() => {
    const init = async () => {
      await initializeDb();
      await loadServices();
    };
    init();
  }, [loadServices]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={
            <div className="container mx-auto px-4 py-8">
              <UserDashboard />
            </div>
          } />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <div className="container mx-auto px-4 py-8">
                <AdminDashboard />
              </div>
            </ProtectedRoute>
          } />
          <Route path="/admin/service/:id" element={
            <ProtectedRoute>
              <div className="container mx-auto px-4 py-8">
                <AdminServicePage />
              </div>
            </ProtectedRoute>
          } />
          <Route path="/service/:id" element={
            <div className="container mx-auto px-4 py-8">
              <ServicePage />
            </div>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;