import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc, query, where } from "firebase/firestore";
import { db } from "@/firebaseConfig";

const ManagePatients: React.FC = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch patients from Firestore
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const usersRef = collection(db, "users"); // ✅ users collection
        const q = query(usersRef, where("role", "==", "patient")); // ✅ only patients
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setPatients(data);
      } catch (err) {
        console.error("Error fetching patients:", err);
      }
    };
    fetchPatients();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to remove this patient?")) {
      try {
        await deleteDoc(doc(db, "users", id)); // ✅ delete from users
        setPatients((prev) => prev.filter((pat) => pat.id !== id));
      } catch (err) {
        console.error("Error deleting patient:", err);
      }
    }
  };

  const filteredPatients = patients.filter(
    (pat) =>
      pat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pat.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pat.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-semibold mb-4">Manage Patients</h2>

      <input
        type="text"
        placeholder="Search patient by name, email or ID..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-4 py-2 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2 text-left">Name</th>
            <th className="border px-4 py-2 text-left">Email</th>
            <th className="border px-4 py-2 text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredPatients.length > 0 ? (
            filteredPatients.map((pat) => (
              <tr key={pat.id}>
                <td className="border px-4 py-2">{pat.name}</td>
                <td className="border px-4 py-2">{pat.email}</td>
                <td className="border px-4 py-2 text-center">
                  <button
                    onClick={() => handleDelete(pat.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="border px-4 py-2 text-center" colSpan={3}>
                No patients found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ManagePatients;
