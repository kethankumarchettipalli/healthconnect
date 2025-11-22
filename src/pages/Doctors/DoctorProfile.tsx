import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Star } from 'lucide-react';
import { doc, collection, addDoc, serverTimestamp, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { useAuth } from '@/context/AuthContext';
import { Doctor } from '@/types';
import LoadingSpinner from '@/components/UI/LoadingSpinner';

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

  // Editing states
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
            setSelectedDate(docData.availability?.[0]?.date || null);
          } else if (!selectedDate) {
            setSelectedDate(docData.availability?.[0]?.date || null);
          }
        } else {
          setDoctor(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to doctor profile:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [id, selectedDate]);

  const handleBooking = async () => {
    if (!user) {
      navigate('/auth/login');
      return;
    }
    if (!selectedDate || !selectedTime || !doctor) {
      alert('Please select a date and time slot.');
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
      console.error('Error booking appointment:', error);
      setBookingStatus('error');
    } finally {
      setIsBooking(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!doctor || !user || user.uid !== doctor.id) return;

    try {
      await updateDoc(doc(db, 'doctors', doctor.id), editForm);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );

  if (!doctor)
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-800">Doctor not found</h2>
        <p className="text-gray-600 mt-2">The profile you are looking for does not exist.</p>
        <Link
          to="/doctors"
          className="mt-6 inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
        >
          Back to Doctors List
        </Link>
      </div>
    );

  const selectedSlots = doctor.availability?.find((d) => d.date === selectedDate)?.slots || [];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          {/* Doctor Info Card */}
          <div className="bg-white rounded-lg shadow-md p-6 flex flex-col lg:flex-row lg:space-x-8">
            
            {/* Left: Doctor image */}
            <div className="flex-shrink-0">
              <img
                src={doctor.profileImage}
                alt={doctor.name}
                className="w-32 h-32 rounded-full mx-auto lg:mx-0 object-cover ring-4 ring-blue-100"
              />
            </div>

            {/* Center: Info and bio */}
            <div className="flex-1 mt-4 lg:mt-0">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{doctor.name}</h1>
                  <p className="text-blue-600 font-semibold text-lg mt-1">{doctor.specialty}</p>
                  <p className="text-gray-600 text-sm">{doctor.qualification}</p>

                  {/* Rating + Experience + Clinic/City */}
                  <div className="flex flex-col space-y-1 mt-2 text-gray-700">
                    <span className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" /> {doctor.rating || 4.5} ({doctor.reviews || 0} reviews)
                    </span>
                    <span>Experience: {doctor.experience} years</span>
                    <span>Clinic/Hospital: {doctor.clinic?.name || 'N/A'}</span>
                    <span>City: {doctor.clinic?.city || 'N/A'}</span>
                  </div>
                </div>

                {/* Consultation Fee */}
                <div className="text-right text-2xl font-semibold text-gray-800">
                  ₹ {doctor.consultationFee}
                  <div className="text-sm text-gray-500 font-normal">Consultation Fee</div>
                </div>
              </div>

              {/* About/Bio */}
              <div className="mt-6 bg-gray-50 p-4 rounded-md shadow-inner">
                <h2 className="text-xl font-bold text-gray-800 mb-2">About {doctor.name.split(' ')[0]}</h2>
                <p className="text-gray-600 leading-relaxed">{doctor.bio}</p>
              </div>
            </div>

            {/* Right: Booking Section */}
            <div className="lg:ml-8 mt-6 lg:mt-0 w-full lg:w-72 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">Book an Appointment</h2>

              {doctor.availability && doctor.availability.length > 0 ? (
                <>
                  {/* Date buttons */}
                  <div className="mb-4">
                    <label className="font-semibold text-gray-700 mb-2 block">Select a Date</label>
                    <div className="flex gap-2 overflow-x-auto">
                      {doctor.availability.map((day) => (
                        <button
                          key={day.date}
                          onClick={() => {
                            setSelectedDate(day.date);
                            setSelectedTime(null);
                          }}
                          className={`min-w-[100px] px-3 py-1 rounded border text-sm ${
                            selectedDate === day.date ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {new Date(day.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time slots */}
                  <div className="mb-4">
                    <label className="font-semibold text-gray-700 mb-2 block">Select Time</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedSlots.length > 0 ? (
                        selectedSlots.map((slot) => (
                          <button
                            key={slot}
                            onClick={() => setSelectedTime(slot)}
                            className={`px-3 py-1 rounded border ${
                              selectedTime === slot ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {slot}
                          </button>
                        ))
                      ) : (
                        <p className="text-gray-500">No slots available for this date</p>
                      )}
                    </div>
                  </div>

                  {/* Confirm Button */}
                  <button
                    onClick={handleBooking}
                    disabled={isBooking || !selectedTime}
                    className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                  >
                    {isBooking ? 'Booking...' : 'Confirm Appointment'}
                  </button>

                  {/* Booking Status */}
                  {bookingStatus === 'success' && (
                    <p className="text-green-600 mt-2 flex items-center gap-1">
                      <CheckCircle /> Appointment booked! Redirecting...
                    </p>
                  )}
                  {bookingStatus === 'error' && (
                    <p className="text-red-600 mt-2 flex items-center gap-1">
                      <AlertCircle /> Failed to book appointment.
                    </p>
                  )}
                </>
              ) : (
                <p className="text-gray-500 text-center">This doctor has not set their availability yet.</p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DoctorProfile;
