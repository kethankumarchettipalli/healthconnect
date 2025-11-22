import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Users, 
  Star, 
  Clock, 
  Heart, 
  Shield,
  Award,
  MapPin
} from 'lucide-react';
import SearchBar from '../components/UI/SearchBar';
import { db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  experience: number;
  consultationFee: number;
  profileImage?: string;
}

const Home: React.FC = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      const querySnapshot = await getDocs(collection(db, "doctors"));
      const docs = querySnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Doctor)
      );
      setDoctors(docs);
      setFilteredDoctors(docs.slice(0, 6)); // default featured doctors
    };
    fetchDoctors();
  }, []);

  const handleSearch = (query: string, location: string) => {
    const params = new URLSearchParams();
    if (query) params.set("query", query);
    if (location) params.set("location", location);
    navigate(`/doctors?${params.toString()}`);
  };

  const handleFilterToggle = () => {
    setShowFilters(!showFilters);
  };

  const handleSpecialtyClick = (specialty: string) => {
    setSelectedSpecialty(specialty);
    if (specialty === "") {
      setFilteredDoctors(doctors.slice(0, 6));
    } else {
      setFilteredDoctors(doctors.filter((doc) => doc.specialty === specialty));
    }
  };

  const specialties = [
    { name: 'Cardiology', icon: Heart, color: 'bg-red-100 text-red-600' },
    { name: 'Dermatology', icon: Star, color: 'bg-yellow-100 text-yellow-600' },
    { name: 'Pediatrics', icon: Users, color: 'bg-blue-100 text-blue-600' },
    { name: 'Orthopedics', icon: Shield, color: 'bg-green-100 text-green-600' },
    { name: 'Neurology', icon: Award, color: 'bg-purple-100 text-purple-600' },
    { name: 'General Medicine', icon: Calendar, color: 'bg-indigo-100 text-indigo-600' }
  ];

  const stats = [
    { label: 'Verified Doctors', value: '50+', icon: Users },
    { label: 'Appointments Booked', value: '50K+', icon: Calendar },
    { label: 'Happy Patients', value: '25K+', icon: Star },
    { label: 'Cities Served', value: '10+', icon: MapPin }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-6xl font-bold mb-6"
            >
              Book Doctor Appointments
              <span className="block text-blue-200">Made Simple</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto"
            >
              Find qualified doctors, read reviews, and book appointments instantly. 
              Your health is our priority.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mb-12"
            >
              <SearchBar 
                onSearch={handleSearch}
                onFilterToggle={handleFilterToggle}
                placeholder="Search doctors, specialties, or symptoms..."
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <stat.icon className="h-8 w-8 mx-auto mb-2 text-blue-200" />
                  <div className="text-2xl md:text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-blue-200 text-sm">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Popular Specialties */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Popular Specialties
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Find doctors across various medical specialties
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {specialties.map((specialty, index) => (
              <motion.div
                key={specialty.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-lg p-6 text-center shadow-sm hover:shadow-md transition-all cursor-pointer"
                onClick={() => handleSpecialtyClick(specialty.name)}
              >
                <div className={`w-16 h-16 ${specialty.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <specialty.icon className="h-8 w-8" />
                </div>
                <h3 className="font-semibold text-gray-900">{specialty.name}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Doctors */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {selectedSpecialty ? `${selectedSpecialty} Doctors` : "Featured Doctors"}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Highly rated doctors trusted by thousands of patients
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor, index) => (
              <motion.div
                key={doctor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
              >
                <div className="flex items-start space-x-4">
                  <img
                    src={doctor.profileImage || "https://via.placeholder.com/150"}
                    alt={doctor.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{doctor.name}</h3>
                    <p className="text-blue-600 text-sm mb-2">{doctor.specialty}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span>{doctor.rating}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{doctor.experience} years</span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className="text-sm text-gray-600">Fee: </span>
                      <span className="font-semibold text-gray-900">₹{doctor.consultationFee}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <Link
                    to={`/doctors/${doctor.id}`}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-center block"
                  >
                    Book Appointment
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/doctors"
              className="inline-flex items-center px-6 py-3 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
            >
              View All Doctors
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Book your appointment in just 3 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Search & Filter',
                description: 'Find doctors by specialty, location, or specific requirements'
              },
              {
                step: '02',
                title: 'Choose Doctor',
                description: 'Compare profiles, read reviews, and select your preferred doctor'
              },
              {
                step: '03',
                title: 'Book Appointment',
                description: 'Select a convenient time slot and confirm your appointment instantly'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
