import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { mockDoctors } from '@/data/mockData';

// This function will upload the mockDoctors array to your 'doctors' collection in Firestore.
// It will only write data if the document doesn't already exist.
export const seedDoctorsCollection = async () => {
  const doctorsCollectionRef = collection(db, 'doctors');
  let doctorsAddedCount = 0;

  console.log('Starting to seed database...');

  for (const doctor of mockDoctors) {
    try {
      // Use the doctor's existing id as the document ID
      const doctorDocRef = doc(doctorsCollectionRef, doctor.id);
      
      // Use setDoc to create the document
      await setDoc(doctorDocRef, doctor);
      
      doctorsAddedCount++;
    } catch (error) {
      console.error(`Error adding doctor ${doctor.id}:`, error);
    }
  }

  if (doctorsAddedCount > 0) {
    alert(`${doctorsAddedCount} doctors have been successfully added to Firestore! You can now remove the seeding button.`);
    console.log(`Seeding complete. ${doctorsAddedCount} doctors added.`);
  } else {
    alert('Seeding was not necessary or failed. Check the console.');
    console.log('Seeding complete. No new doctors were added.');
  }
};