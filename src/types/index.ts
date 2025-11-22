import { Timestamp } from "firebase/firestore";

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  qualification: string;
  experience: number;
  rating: number;
  reviewCount: number;
  consultationFee: number;
  profileImage: string;
  bio: string;
  clinic: {
    name: string; // This will be the workplace
    address: string;
    city: string;
  };
  availability: TimeSlot[];
  skills?: string[]; // <-- ADDED SKILLS FIELD
}

export interface TimeSlot {
  date: string;
  slots: string[];
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  profileImage?: string;
}

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  fee: number;
  createdAt: Timestamp;
}

export interface Review {
  id: string;
  doctorId: string;
  patientId: string;
  patientName: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

export interface SearchFilters {
  specialty?: string;
  location?: string;
  availableToday?: boolean;
  maxFee?: number;
  minRating?: number;
  minExperience?: number;
}