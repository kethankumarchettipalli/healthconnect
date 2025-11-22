import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';

// Page Imports
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import DoctorsList from './pages/Doctors/DoctorsList';
import DoctorProfile from './pages/Doctors/DoctorProfile';
import PatientDashboard from './pages/patients/PatientDashboard';
import DoctorDashboard from './pages/Doctors/DoctorDashboard';
import Specialties from './pages/Specialties';
import DoctorOnboarding from './pages/Doctors/DoctorOnboarding'; 
import AdminLogin from './pages/admin/AdminLogin'; 
import AdminDashboard from './pages/admin/AdminDashboard'; 
import ManageDoctors from './pages/admin/ManageDoctors';
import ManagePatients from './pages/admin/ManagePatients';
import ManageAppointments from './pages/admin/ManageAppointments';
import ProtectedRoute from './routes/ProtectedRoute';

// 🔹 Import new Doctor Edit Profile page
import DoctorEditProfile from './pages/Doctors/DoctorEditProfile';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Header />
          <main className="flex-1">
            <Routes>
              {/* General Pages */}
              <Route path="/" element={<Home />} />
              <Route path="/specialties" element={<Specialties />} />
              
              {/* Auth Pages */}
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/register" element={<Register />} />

              {/* Doctor Pages */}
              <Route path="/doctors" element={<DoctorsList />} />
              <Route path="/doctors/:id" element={<DoctorProfile />} />
              <Route 
                path="/doctor/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={["doctor"]}>
                    <DoctorDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/doctor/onboarding" 
                element={
                  <ProtectedRoute allowedRoles={["doctor"]}>
                    <DoctorOnboarding />
                  </ProtectedRoute>
                } 
              />
              {/* 🔹 New Edit Profile Route */}
              <Route 
                path="/doctor/edit/:id" 
                element={
                  <ProtectedRoute allowedRoles={["doctor"]}>
                    <DoctorEditProfile />
                  </ProtectedRoute>
                } 
              />

              {/* Patient Pages */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={["patient"]}>
                    <PatientDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Admin Pages */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/manage-doctors" 
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <ManageDoctors />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/manage-patients" 
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <ManagePatients />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/manage-appointments" 
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <ManageAppointments />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
