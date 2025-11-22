import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { Doctor } from '@/types';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import { Heart, Stethoscope, Baby, Bone, BrainCircuit, ShieldAlert } from 'lucide-react';

// Helper to map specialties to icons and colors for a better UI
const specialtyMap: { [key: string]: { icon: React.ElementType; color: string } } = {
  Cardiology: { icon: Heart, color: 'bg-red-100 text-red-600' },
  Dermatology: { icon: ShieldAlert, color: 'bg-yellow-100 text-yellow-600' },
  Pediatrics: { icon: Baby, color: 'bg-blue-100 text-blue-600' },
  Orthopedics: { icon: Bone, color: 'bg-green-100 text-green-600' },
  Neurology: { icon: BrainCircuit, color: 'bg-purple-100 text-purple-600' },
  'General Medicine': { icon: Stethoscope, color: 'bg-indigo-100 text-indigo-600' },
};

const Specialties: React.FC = () => {
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const doctorsCollectionRef = collection(db, 'doctors');
        const querySnapshot = await getDocs(doctorsCollectionRef);
        const doctorsData = querySnapshot.docs.map(doc => doc.data() as Doctor);
        
        // Create a unique set of specialties from the database
        const uniqueSpecialties = [...new Set(doctorsData.map(doc => doc.specialty))];
        setSpecialties(uniqueSpecialties.sort());
      } catch (error) {
        console.error("Error fetching specialties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSpecialties();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900">Browse by Specialty</h1>
          <p className="mt-4 text-lg text-gray-600">Find the right specialist for your healthcare needs.</p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {specialties.map((specialty, index) => {
              const { icon: Icon, color } = specialtyMap[specialty] || { icon: Stethoscope, color: 'bg-gray-100 text-gray-600' };
              return (
                <Link to={`/doctors?specialty=${encodeURIComponent(specialty)}`} key={specialty}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}
                    className="bg-white rounded-lg p-6 text-center shadow-sm hover:shadow-md transition-all cursor-pointer h-full"
                  >
                    <div className={`w-16 h-16 ${color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <Icon className="h-8 w-8" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-lg">{specialty}</h3>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Specialties;