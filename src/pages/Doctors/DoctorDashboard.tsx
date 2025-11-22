import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, User, LogOut, CheckSquare, Save, PlusCircle } from 'lucide-react';
import { collection, query, where, getDocs, orderBy, doc, updateDoc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { Appointment, Doctor, TimeSlot } from '@/types';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import { format, startOfDay } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

const ALL_TIME_SLOTS = [ "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"];

const DoctorDashboard: React.FC = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [pastAppointments, setPastAppointments] = useState<Appointment[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [availability, setAvailability] = useState<TimeSlot[]>([]);
  const [selectedDays, setSelectedDays] = useState<Date[] | undefined>();
  const [templateSlots, setTemplateSlots] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // 🔹 Only changed fetchData and doctor profile handling
const fetchData = useCallback(async () => {
  if (!user) return;
  setLoadingData(true);
  try {
    // ✅ Try fetching doctor profile, but don’t break if not found
    try {
      const doctorRef = doc(db, 'doctors', user.uid);
      const docSnap = await getDoc(doctorRef);
      if (docSnap.exists()) {
        const doctorData = docSnap.data() as Doctor;
        setAvailability(doctorData.availability || []);
      } else {
        console.warn("No doctor profile found for UID:", user.uid);
        setAvailability([]);
      }
    } catch (err) {
      console.error("Error fetching doctor profile:", err);
      setAvailability([]);
    }

    // ✅ Fetch appointments like PatientDashboard
    const appointmentsRef = collection(db, 'appointments');
    const q = query(
      appointmentsRef,
      where('doctorId', '==', user.uid),
      orderBy('date', 'asc')
    );

    const querySnapshot = await getDocs(q);
    const allAppointments = querySnapshot.docs.map(doc => {
      const data = doc.data();
      const createdAt =
        data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date();
      return { ...data, id: doc.id, createdAt } as Appointment;
    });

    const upcoming = allAppointments.filter(appt => appt.status === 'scheduled');
    const past = allAppointments.filter(appt => appt.status !== 'scheduled');

    setUpcomingAppointments(upcoming);
    setPastAppointments(past.reverse());
  } catch (error) {
    console.error("Error fetching data:", error);
  } finally {
    setLoadingData(false);
  }
}, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const handleApplySlotsToSelectedDays = () => {
    if (!selectedDays || selectedDays.length === 0) {
      alert("Please select one or more days from the calendar first.");
      return;
    }
    
    let updatedAvailability = [...availability];

    selectedDays.forEach(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const existingDayIndex = updatedAvailability.findIndex(d => d.date === dateStr);
        const slotsToApply = templateSlots.sort();

        if (existingDayIndex > -1) {
            updatedAvailability[existingDayIndex] = { date: dateStr, slots: slotsToApply };
        } else {
            updatedAvailability.push({ date: dateStr, slots: slotsToApply });
        }
    });

    setAvailability(updatedAvailability);
    alert(`Slots have been applied to ${selectedDays.length} selected day(s). Click 'Save Full Schedule' to confirm.`);
  };
  
  const handleSaveAvailability = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
        const doctorRef = doc(db, 'doctors', user.uid);
        const cleanedAvailability = availability.filter(day => day.slots.length > 0);
        await updateDoc(doctorRef, {
            availability: cleanedAvailability
        });
        setAvailability(cleanedAvailability);
        alert('Availability saved successfully!');
    } catch (error) {
        console.error("Error saving availability:", error);
        alert('Failed to save availability.');
    } finally {
        setIsSaving(false);
    }
  };

  const handleMarkAsCompleted = async (appointmentId: string) => {
    try {
      await updateDoc(doc(db, 'appointments', appointmentId), { status: 'completed' });
      fetchData(); 
    } catch (error) {
      console.error("Error updating appointment status:", error);
    }
  };

  const handleLogout = async () => { await logout(); navigate('/'); };

  if (authLoading) return <div className="flex items-center justify-center h-screen"><LoadingSpinner size="lg" /></div>;
  if (!user) { navigate('/auth/login'); return null; }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dr. {user.displayName}'s Dashboard</h1>
          <div className="flex space-x-4">
            {/* 🔹 New Edit Profile button */}
            <Link to={`/doctor/edit/${user?.uid}`}>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Edit Profile
              </button>
            </Link>

            <button onClick={handleLogout} className="flex items-center text-sm font-medium text-red-600 hover:text-red-800">
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-10">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Upcoming Appointments</h2>
              {loadingData ? <LoadingSpinner /> : upcomingAppointments.length > 0 ? (
                <div className="space-y-4">{upcomingAppointments.map(appt => <AppointmentCard key={appt.id} appt={appt} onComplete={handleMarkAsCompleted} isUpcoming={true} />)}</div>
              ) : (
                <p className="text-gray-500 bg-white p-6 rounded-lg text-center">You have no upcoming appointments.</p>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Past Appointments</h2>
              {loadingData ? <LoadingSpinner /> : pastAppointments.length > 0 ? (
                <div className="space-y-4">{pastAppointments.map(appt => <AppointmentCard key={appt.id} appt={appt} onComplete={handleMarkAsCompleted} isUpcoming={false} />)}</div>
              ) : (
                <p className="text-gray-500 bg-white p-6 rounded-lg text-center">You have no past appointments.</p>
              )}
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-md sticky top-24">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-3">Manage Availability</h2>
              <p className="text-sm text-gray-500 mb-4">1. Select days. 2. Choose time slots. 3. Apply & Save.</p>
              <DayPicker mode="multiple" min={0} selected={selectedDays} onSelect={setSelectedDays} fromDate={startOfDay(new Date())} className="flex justify-center" />
              <div className="mt-4">
                <h3 className="font-semibold text-gray-700 mb-3">Time Slot Template</h3>
                <div className="grid grid-cols-3 gap-2">
                  {ALL_TIME_SLOTS.map(slot => (
                    <button key={slot} onClick={() => setTemplateSlots(prev => prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot])} className={`py-2 rounded-md text-sm transition-colors ${templateSlots.includes(slot) ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                      {slot}
                    </button>
                  ))}
                </div>
                <button onClick={handleApplySlotsToSelectedDays} className="w-full mt-4 bg-blue-100 text-blue-700 py-2.5 rounded-lg font-semibold hover:bg-blue-200 flex items-center justify-center">
                    <PlusCircle size={16} className="mr-2" /> Apply to Selected Days
                </button>
                <button onClick={handleSaveAvailability} disabled={isSaving} className="w-full mt-4 bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700 flex items-center justify-center disabled:bg-gray-400">
                  {isSaving ? <LoadingSpinner size="sm" /> : <><Save size={16} className="mr-2" /> Save Full Schedule</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const AppointmentCard = ({ appt, onComplete, isUpcoming }: { appt: Appointment; onComplete: (id: string) => void; isUpcoming: boolean }) => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex justify-between items-start">
            <div><p className="font-bold text-lg text-gray-800 flex items-center"><User size={18} className="mr-2" />{appt.patientName}</p></div>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${appt.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : appt.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{appt.status}</span>
        </div>
        <div className="mt-4 flex items-center text-sm text-gray-600 space-x-4">
            <div className="flex items-center"><CalendarIcon size={16} className="mr-2" /> {format(new Date(appt.date), 'EEE, dd MMM yyyy')}</div>
            <div className="flex items-center"><Clock size={16} className="mr-2" /> {appt.time}</div>
        </div>
        {isUpcoming && (
            <div className="mt-4 pt-4 border-t">
                <button onClick={() => onComplete(appt.id)} className="w-full flex items-center justify-center py-2 px-3 text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200">
                    <CheckSquare size={16} className="mr-2" /> Mark as Completed
                </button>
            </div>
        )}
    </motion.div>
);

export default DoctorDashboard;
