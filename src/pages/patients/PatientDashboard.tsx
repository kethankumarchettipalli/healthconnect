import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { User, LogOut, Calendar, Clock } from 'lucide-react';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { Appointment } from '@/types';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import { format } from 'date-fns';

const PatientDashboard: React.FC = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [pastAppointments, setPastAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);

  const fetchAppointments = useCallback(async () => {
    if (!user) return;
    setLoadingAppointments(true);
    try {
      const appointmentsRef = collection(db, 'appointments');
      // UPDATED QUERY: The index supports this specific query
      const q = query(
        appointmentsRef,
        where('patientId', '==', user.uid),
        orderBy('date', 'asc') 
      );

      const querySnapshot = await getDocs(q);
      const allAppointments = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date();
        return { id: doc.id, ...data, createdAt } as Appointment;
      });
      
      const upcoming = allAppointments.filter(appt => appt.status === 'scheduled');
      const past = allAppointments.filter(appt => appt.status !== 'scheduled');

      setUpcomingAppointments(upcoming);
      setPastAppointments(past.reverse());

    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoadingAppointments(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);
  
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (authLoading) return <div className="flex items-center justify-center h-screen"><LoadingSpinner size="lg" /></div>;
  if (!user) { navigate('/auth/login'); return null; }

  // ... (rest of the component JSX is unchanged)
  const AppointmentCard = ({ appt }: { appt: Appointment }) => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-4 rounded-lg shadow-sm border">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-bold text-lg text-gray-800">{appt.doctorName}</p>
          <p className="text-sm text-blue-600">{appt.doctorSpecialty}</p>
        </div>
        <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${
            appt.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
            appt.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>{appt.status}</span>
      </div>
      <div className="mt-4 flex items-center text-sm text-gray-600 space-x-4">
        <div className="flex items-center"><Calendar size={16} className="mr-2" /> {format(new Date(appt.date), 'EEE, dd MMM yyyy')}</div>
        <div className="flex items-center"><Clock size={16} className="mr-2" /> {appt.time}</div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Welcome, {user.displayName}</h1>
            <button onClick={handleLogout} className="flex items-center text-sm font-medium text-red-600 hover:text-red-800">
                <LogOut className="h-4 w-4 mr-2" /> Logout
            </button>
        </div>
        <div className="space-y-10">
            <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Upcoming Appointments</h2>
                {loadingAppointments ? <LoadingSpinner /> : upcomingAppointments.length > 0 ? (
                    <div className="space-y-4">{upcomingAppointments.map(appt => <AppointmentCard key={appt.id} appt={appt} />)}</div>
                ) : (
                    <p className="text-gray-500 bg-white p-6 rounded-lg text-center">You have no upcoming appointments.</p>
                )}
            </div>
            <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Past Appointments</h2>
                {loadingAppointments ? <LoadingSpinner /> : pastAppointments.length > 0 ? (
                    <div className="space-y-4">{pastAppointments.map(appt => <AppointmentCard key={appt.id} appt={appt} />)}</div>
                ) : (
                    <p className="text-gray-500 bg-white p-6 rounded-lg text-center">You have no past appointments.</p>
                )}
            </div>
        </div>
      </motion.div>
    </div>
  );
};
export default PatientDashboard;