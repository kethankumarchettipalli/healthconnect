import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Star } from 'lucide-react';
import { doc, collection, addDoc, serverTimestamp, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { useAuth } from '@/context/AuthContext';
import { Doctor } from '@/types';
import LoadingSpinner from '@/components/UI/LoadingSpinner';

// Helper for generating full month dates
const generateMonthDates = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const dates: Date[] = [];
  for (let d = firstDay.getDate(); d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d);
    dates.push(date);
  }
  return dates;
};

const DoctorProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<'success' | 'error' | null>(null);

  const today = new Date();
  const todayIso = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  ).toISOString().split('T')[0];

  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Doctor>>({});

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    const docRef = doc(db, 'doctors', id);

    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const docData = { id: docSnap.id, ...docSnap.data() } as Doctor;
          setDoctor(docData);
          setEditForm(docData);

          if (selectedDate && !docData.availability?.some((d) => d.date === selectedDate)) {
            setSelectedDate(null);
          }
        } else {
          setDoctor(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error loading doctor:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [id]);

  const handleBooking = async () => {
    if (!user) {
      navigate('/auth/login');
      return;
    }

    if (!selectedDate || !selectedTime || !doctor) {
      alert('Please select a date and time.');
      return;
    }

    setIsBooking(true);
    setBookingStatus(null);

    try {
      await addDoc(collection(db, 'appointments'), {
        doctorId: doctor.id,
        doctorName: doctor.name,
        doctorSpecialty: doctor.specialty,
        patientId: user.uid,
        patientName: user.displayName,
        date: selectedDate,
        time: selectedTime,
        status: 'scheduled',
        fee: doctor.consultationFee,
        createdAt: serverTimestamp(),
      });

      setBookingStatus('success');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error) {
      setBookingStatus('error');
    } finally {
      setIsBooking(false);
    }
  };

  const monthDatesOnly = generateMonthDates(currentYear, currentMonth);
  const firstWeekday = new Date(currentYear, currentMonth, 1).getDay();
  const blanks = Array.from({ length: firstWeekday }, () => null);
  const calendarCells: (Date | null)[] = [...blanks, ...monthDatesOnly];

  const monthName = new Date(currentYear, currentMonth).toLocaleString('en-US', { month: 'long' });

  const availableDates = doctor?.availability?.map((d) => d.date) || [];

  // GET DOCTOR'S OWN TIME SLOTS (not new)
  const selectedSlots =
    doctor?.availability?.find((d) => d.date === selectedDate)?.slots || [];

  const goPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else setCurrentMonth((m) => m - 1);
  };

  const goNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else setCurrentMonth((m) => m + 1);
  };

  const toIsoDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );

  if (!doctor)
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Doctor not found</h2>
      </div>
    );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="bg-white rounded-lg shadow-md p-6 flex flex-col lg:flex-row lg:space-x-8">

            {/* Doctor Info */}
            <div className="flex-shrink-0">
              <img src={doctor.profileImage} className="w-32 h-32 rounded-full object-cover ring-4 ring-blue-100" />
            </div>

            <div className="flex-1 mt-4">
              <h1 className="text-2xl font-bold">{doctor.name}</h1>
              <p className="text-blue-600 font-semibold text-lg">{doctor.specialty}</p>
              <p className="text-gray-600 text-sm">{doctor.qualification}</p>

              <div className="flex flex-col mt-2 text-gray-700">
                <span className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 mr-1" />
                  {doctor.rating || 4.5} ({doctor.reviews || 0} reviews)
                </span>
                <span><b>Experience:</b> {doctor.experience} years</span>
                <span><b>Clinic/Hospital:</b> {doctor.clinic?.name || 'N/A'}</span>
                <span><b>City:</b> {doctor.clinic?.city || 'N/A'}</span>
                <span><b>About: </b><br /> {doctor.bio}</span>
              </div>
            </div>

            {/* Booking Section */}
            <div className="w-full lg:w-80 bg-white rounded-lg shadow-md p-6 mt-6 lg:mt-0">
              <h2 className="text-xl font-bold mb-4">Book an Appointment</h2>

              {/* Calendar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-3">
                  <button onClick={goPrevMonth} className="px-3 py-1 bg-gray-100 rounded">‹</button>
                  <p className="font-semibold">{monthName} {currentYear}</p>
                  <button onClick={goNextMonth} className="px-3 py-1 bg-gray-100 rounded">›</button>
                </div>

                <div className="grid grid-cols-7 gap-2 text-center text-sm font-semibold text-gray-600 mb-1">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => <div key={d}>{d}</div>)}
                </div>

                <div className="grid grid-cols-7 gap-2 text-center">
                  {calendarCells.map((cell, idx) => {
                    if (!cell) return <div key={idx}></div>;

                    const iso = toIsoDate(cell);
                    const isAvailable = availableDates.includes(iso);
                    const isPast = iso < todayIso;
                    const isSelected = selectedDate === iso;

                    const clickable = isAvailable && !isPast;

                    return (
                      <button
                        key={iso}
                        disabled={!clickable}
                        onClick={() => {
                          setSelectedDate(iso);
                          setSelectedTime(null);
                        }}
                        className={`p-2 rounded-lg text-sm border 
                          ${isSelected ? 'bg-blue-600 text-white' :
                            isAvailable ? 'bg-blue-100' : 'bg-gray-50'}
                          ${!clickable && 'opacity-50 cursor-not-allowed'}
                        `}
                      >
                        {cell.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots (FIX 1) */}
              <div className="mb-4">
                <label className="font-semibold text-gray-700">Select Time</label>

                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedDate ? (
                    doctor.availability
                      ?.find((d) => d.date === selectedDate)
                      ?.slots.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setSelectedTime(slot)}
                          className={`px-3 py-1 rounded border
                            ${selectedTime === slot ? 'bg-blue-600 text-white' : 'bg-gray-100'}
                          `}
                        >
                          {slot}
                        </button>
                      ))
                  ) : (
                    <p className="text-gray-500">Select a date first</p>
                  )}
                </div>
              </div>

              <button
                onClick={handleBooking}
                className="w-full bg-blue-600 text-white py-2 rounded-md"
                disabled={!selectedTime || isBooking}
              >
                {isBooking ? 'Booking...' : 'Confirm Appointment'}
              </button>

              {bookingStatus === 'success' && (
                <p className="text-green-600 mt-2 flex items-center gap-1">
                  <CheckCircle /> Appointment booked!
                </p>
              )}

              {bookingStatus === 'error' && (
                <p className="text-red-600 mt-2 flex items-center gap-1">
                  <AlertCircle /> Failed to book.
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DoctorProfile;