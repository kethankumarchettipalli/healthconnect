import { faker } from '@faker-js/faker';
import { Doctor, Patient, Appointment, Review } from '../types';
import { format, addDays, addHours } from 'date-fns';

const specialties = [
  'Cardiology', 'Dermatology', 'Endocrinology', 'Gastroenterology',
  'Neurology', 'Orthopedics', 'Pediatrics', 'Psychiatry',
  'General Medicine', 'Gynecology', 'Ophthalmology', 'ENT'
];

const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad'];

const timeSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];

// Generate mock doctors
export const mockDoctors: Doctor[] = Array.from({ length: 50 }, (_, index) => {
  const specialty = faker.helpers.arrayElement(specialties);
  const city = faker.helpers.arrayElement(cities);
  const experience = faker.number.int({ min: 2, max: 30 });
  const rating = faker.number.float({ min: 3.5, max: 5.0, fractionDigits: 1 });
  
  return {
    id: `doc-${index + 1}`,
    name: `Dr. ${faker.person.fullName()}`,
    specialty,
    qualification: `MBBS, MD (${specialty})`,
    experience,
    rating,
    reviewCount: faker.number.int({ min: 10, max: 500 }),
    consultationFee: faker.number.int({ min: 300, max: 2000 }),
    profileImage: `https://images.unsplash.com/photo-${faker.helpers.arrayElement([
      '1612349317150-e756f19bda47', '1582750433449-648ed127bb54',
      '1559839734-2b71ea197ec2', '1612865547334-09cb19d6ae10'
    ])}?w=400&h=400&fit=crop&crop=face`,
    bio: faker.lorem.paragraph(3),
    clinic: {
      name: `${faker.company.name()} Medical Center`,
      address: faker.location.streetAddress(),
      city,
      coordinates: {
        lat: faker.location.latitude(),
        lng: faker.location.longitude()
      }
    },
    availability: Array.from({ length: 7 }, (_, dayIndex) => ({
      date: format(addDays(new Date(), dayIndex), 'yyyy-MM-dd'),
      slots: faker.helpers.arrayElements(timeSlots, { min: 4, max: 8 })
    })),
    registrationNumber: `REG${faker.number.int({ min: 10000, max: 99999 })}`,
    professionalMemberships: faker.helpers.arrayElements([
      'Indian Medical Association', 'Medical Council of India',
      'Royal College of Physicians', 'American Board of Internal Medicine'
    ], { min: 1, max: 3 })
  };
});

// Generate mock patients
export const mockPatients: Patient[] = Array.from({ length: 20 }, (_, index) => ({
  id: `patient-${index + 1}`,
  name: faker.person.fullName(),
  email: faker.internet.email(),
  phone: faker.phone.number(),
  dateOfBirth: faker.date.birthdate({ min: 18, max: 80, mode: 'age' }).toISOString().split('T')[0],
  gender: faker.helpers.arrayElement(['male', 'female', 'other']),
  profileImage: faker.image.avatar()
}));

// Generate mock appointments
export const mockAppointments: Appointment[] = Array.from({ length: 100 }, (_, index) => {
  const doctor = faker.helpers.arrayElement(mockDoctors);
  const patient = faker.helpers.arrayElement(mockPatients);
  const appointmentDate = faker.date.between({ 
    from: addDays(new Date(), -30), 
    to: addDays(new Date(), 30) 
  });
  
  return {
    id: `appt-${index + 1}`,
    doctorId: doctor.id,
    patientId: patient.id,
    date: format(appointmentDate, 'yyyy-MM-dd'),
    time: faker.helpers.arrayElement(timeSlots),
    status: faker.helpers.arrayElement(['scheduled', 'completed', 'cancelled']),
    type: faker.helpers.arrayElement(['consultation', 'follow-up', 'emergency']),
    notes: faker.lorem.sentence(),
    fee: doctor.consultationFee
  };
});

// Generate mock reviews
export const mockReviews: Review[] = Array.from({ length: 200 }, (_, index) => {
  const doctor = faker.helpers.arrayElement(mockDoctors);
  const patient = faker.helpers.arrayElement(mockPatients);
  
  return {
    id: `review-${index + 1}`,
    doctorId: doctor.id,
    patientId: patient.id,
    patientName: patient.name,
    rating: faker.number.int({ min: 3, max: 5 }),
    comment: faker.lorem.paragraph(2),
    date: format(faker.date.recent({ days: 180 }), 'yyyy-MM-dd'),
    verified: faker.datatype.boolean({ probability: 0.8 })
  };
});
