import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { motion } from 'framer-motion';
import LoadingSpinner from '@/components/UI/LoadingSpinner';

const specialties = ['Cardiology', 'Dermatology', 'Endocrinology', 'Gastroenterology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Psychiatry', 'General Medicine', 'Gynecology', 'Ophthalmology', 'ENT'];
const qualifications = ['MBBS', 'MD', 'MS', 'DNB', 'FRCS', 'MRCP'];
const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad','Guntur','Vijaywada'];

const DoctorOnboarding: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    qualification: 'MBBS',
    specialty: 'General Medicine',
    experience: 5,
    workplace: '',
    city: 'Mumbai',
    skills: '',
    consultationFee: 500,
    bio: '',
    profileImage: '' // 👈 added here
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const parsedValue = name === 'experience' || name === 'consultationFee' ? parseInt(value, 10) : value;
    setFormData(prev => ({ ...prev, [name]: parsedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to create a profile.');
      return;
    }
    if (!formData.workplace || !formData.bio) {
        setError('Please fill out all required fields.');
        return;
    }

    setIsLoading(true);
    setError('');

    try {
      const doctorProfileData = {
        id: user.uid,
        name: user.displayName || 'Unnamed Doctor',
        email: user.email,
        qualification: formData.qualification,
        specialty: formData.specialty,
        experience: formData.experience,
        consultationFee: formData.consultationFee,
        skills: formData.skills.split(',').map(s => s.trim()),
        bio: formData.bio,
        clinic: {
          name: formData.workplace,
          city: formData.city,
          address: 'To be updated',
        },
        // 👇 allow doctor to set their own image, fallback if empty
        profileImage: formData.profileImage || `https://avatar.iran.liara.run/public/boy?username=${user.uid}`,
        rating: 4.5,
        reviewCount: 0,
        availability: [],
      };
      
      const doctorDocRef = doc(db, 'doctors', user.uid);
      await setDoc(doctorDocRef, doctorProfileData);

      navigate('/doctor/dashboard');

    } catch (err) {
      console.error("Error creating doctor profile:", err);
      setError('Failed to create profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    navigate('/auth/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <h2 className="text-center text-3xl font-bold text-gray-900">Complete Your Professional Profile</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          This information will be visible to patients.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10"
        >
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Profile Image URL at the top */}
              <div className="md:col-span-2">
                <label htmlFor="profileImage" className="block text-sm font-medium text-gray-700">Profile Image URL</label>
                <input
                  type="url"
                  name="profileImage"
                  id="profileImage"
                  value={formData.profileImage}
                  onChange={handleInputChange}
                  placeholder="https://example.com/your-photo.jpg"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {formData.profileImage && (
                  <div className="mt-3 flex justify-center">
                    <img
                      src={formData.profileImage}
                      alt="Profile Preview"
                      className="h-32 w-32 rounded-full object-cover shadow"
                    />
                  </div>
                )}
                <p className="mt-2 text-xs text-gray-500">Provide a direct link to your profile image.</p>
              </div>

              {/* Qualification */}
              <div>
                <label htmlFor="qualification" className="block text-sm font-medium text-gray-700">Highest Qualification</label>
                <select id="qualification" name="qualification" value={formData.qualification} onChange={handleInputChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                  {qualifications.map(q => <option key={q}>{q}</option>)}
                </select>
              </div>

              {/* Specialty */}
              <div>
                <label htmlFor="specialty" className="block text-sm font-medium text-gray-700">Specialty</label>
                <select id="specialty" name="specialty" value={formData.specialty} onChange={handleInputChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                  {specialties.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>

              {/* Experience */}
              <div>
                <label htmlFor="experience" className="block text-sm font-medium text-gray-700">Years of Experience</label>
                <input type="number" name="experience" id="experience" value={formData.experience} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>

              {/* Consultation Fee */}
              <div>
                <label htmlFor="consultationFee" className="block text-sm font-medium text-gray-700">Consultation Fee (₹)</label>
                <input type="number" name="consultationFee" id="consultationFee" value={formData.consultationFee} onChange={handleInputChange} step="50" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>

              {/* Workplace */}
              <div>
                <label htmlFor="workplace" className="block text-sm font-medium text-gray-700">Hospital / Clinic Name</label>
                <input type="text" name="workplace" id="workplace" value={formData.workplace} onChange={handleInputChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>

               {/* City */}
               <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                <select id="city" name="city" value={formData.city} onChange={handleInputChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                  {cities.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              {/* Skills */}
              <div className="md:col-span-2">
                <label htmlFor="skills" className="block text-sm font-medium text-gray-700">Skills</label>
                <input type="text" name="skills" id="skills" value={formData.skills} onChange={handleInputChange} placeholder="e.g., Cardiac Surgery, Pediatric Care" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                <p className="mt-2 text-xs text-gray-500">Enter skills separated by a comma.</p>
              </div>

               {/* Bio */}
              <div className="md:col-span-2">
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">About Me</label>
                <textarea id="bio" name="bio" rows={4} value={formData.bio} onChange={handleInputChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"></textarea>
                 <p className="mt-2 text-xs text-gray-500">Write a brief introduction about yourself.</p>
              </div>
            </div>
            
            {error && <p className="text-sm text-red-600 text-center">{error}</p>}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? <LoadingSpinner size="sm" /> : 'Create Profile'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default DoctorOnboarding;
