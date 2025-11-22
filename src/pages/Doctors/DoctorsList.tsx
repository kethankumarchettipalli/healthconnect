import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Star, MapPin, Clock } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { Doctor, SearchFilters } from '@/types';
import LoadingSpinner from '@/components/UI/LoadingSpinner';

const DoctorsList: React.FC = () => {
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'rating' | 'experience' | 'fee'>('rating');
  const [isLoading, setIsLoading] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();
  const queryFromUrl = searchParams.get('query') || '';   // ✅ get query from URL
  const specialtyFromUrl = searchParams.get('specialty');

  const [searchQuery, setSearchQuery] = useState(queryFromUrl);

  useEffect(() => {
    // ✅ Keep searchQuery in sync when URL query changes
    if (queryFromUrl !== searchQuery) {
      setSearchQuery(queryFromUrl);
    }

    if (specialtyFromUrl) {
      setFilters(prevFilters => ({ ...prevFilters, specialty: specialtyFromUrl }));
    }

    const fetchDoctors = async () => {
      setIsLoading(true);
      try {
        const doctorsCollectionRef = collection(db, 'doctors');
        const querySnapshot = await getDocs(doctorsCollectionRef);
        const doctorsData: Doctor[] = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || '',
            specialty: data.specialty || '',
            profileImage: data.profileImage || '/default-doctor.png',
            rating: data.rating || 0,
            experience: data.experience || 0,
            consultationFee: data.consultationFee || 0,
            clinic: {
              name: data.clinic?.name || 'Unknown Clinic',
              city: data.clinic?.city || 'Unknown City',
            },
          } as Doctor;
        });
        setAllDoctors(doctorsData);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctors();
  }, [queryFromUrl, specialtyFromUrl]);  // ✅ depend on query param

  const filteredDoctors = useMemo(() => {
    let result = [...allDoctors];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(doctor =>
        doctor.name.toLowerCase().includes(query) ||
        doctor.specialty.toLowerCase().includes(query)
      );
    }
    
    if (filters.specialty) result = result.filter(d => d.specialty === filters.specialty);
    if (filters.maxFee) result = result.filter(d => d.consultationFee <= filters.maxFee!);
    if (filters.minRating) result = result.filter(d => d.rating >= filters.minRating!);
    if (filters.minExperience) result = result.filter(d => d.experience >= filters.minExperience!);

    result.sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'experience') return b.experience - a.experience;
      if (sortBy === 'fee') return a.consultationFee - b.consultationFee;
      return 0;
    });

    return result;
  }, [searchQuery, filters, sortBy, allDoctors]);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    if (key === 'specialty' && value) {
      setSearchParams({ specialty: value });
    } else if (key === 'specialty' && !value) {
      searchParams.delete('specialty');
      setSearchParams(searchParams);
    }
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Find Doctors</h1>
          
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search doctors by name or specialty..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center px-4 py-3 border rounded-lg transition-colors ${
                  activeFiltersCount > 0 ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter className="h-5 w-5 mr-2" />
                Filters {activeFiltersCount > 0 && <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">{activeFiltersCount}</span>}
              </button>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="rating">Sort by Rating</option>
                <option value="experience">Sort by Experience</option>
                <option value="fee">Sort by Fee (Low to High)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="lg:flex lg:gap-8">
          <AnimatePresence>
            {showFilters && (
              <motion.aside
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="lg:w-80 mb-8 lg:mb-0"
              >
                {/* Filter UI can be placed here */}
              </motion.aside>
            )}
          </AnimatePresence>

          <div className="flex-1">
            {isLoading ? (
              <div className="flex justify-center items-center h-96"><LoadingSpinner size="lg" /></div>
            ) : (
              <>
                <p className="text-gray-600 mb-6">{filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''} found</p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredDoctors.map((doctor, index) => (
                    <motion.div
                      key={doctor.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow p-6"
                    >
                       <div className="flex space-x-4">
                          <img src={doctor.profileImage} alt={doctor.name} className="w-20 h-20 rounded-full object-cover"/>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">{doctor.name}</h3>
                            <p className="text-blue-600 font-medium">{doctor.specialty}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                              <div className="flex items-center space-x-1"><Star className="h-4 w-4 text-yellow-400 fill-current" /><span>{doctor.rating}</span></div>
                              <div className="flex items-center space-x-1"><Clock className="h-4 w-4" /><span>{doctor.experience} years exp.</span></div>
                            </div>
                            <div className="flex items-center space-x-1 text-sm text-gray-600 mt-2"><MapPin className="h-4 w-4" /><span>{doctor.clinic.name}, {doctor.clinic.city}</span></div>
                            <div className="flex items-center justify-between mt-4">
                              <div className="text-lg font-semibold text-gray-900">₹{doctor.consultationFee}</div>
                              <Link to={`/doctors/${doctor.id}`} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium">View Profile</Link>
                            </div>
                          </div>
                       </div>
                    </motion.div>
                  ))}
                </div>
                {filteredDoctors.length === 0 && !isLoading && (
                  <div className="text-center py-16">
                    <Search className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No doctors found for this search.</h3>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorsList;
