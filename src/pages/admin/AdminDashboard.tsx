import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, doc, deleteDoc, query, where } from "firebase/firestore";
import { db } from "@/firebaseConfig";

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);

  const [activeTab, setActiveTab] = useState<"dashboard" | "doctors" | "patients" | "appointments">("dashboard");

  const [doctorSearch, setDoctorSearch] = useState("");
  const [patientSearch, setPatientSearch] = useState("");

  // Fetch doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const snapshot = await getDocs(collection(db, "doctors"));
        const docsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setDoctors(docsData);
      } catch (err) {
        console.error("Error fetching doctors:", err);
      }
    };
    fetchDoctors();
  }, []);

  // Fetch patients from users collection where role === "patient"
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const q = query(collection(db, "users"), where("role", "==", "patient"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setPatients(data);
      } catch (err) {
        console.error("Error fetching patients:", err);
      }
    };
    fetchPatients();
  }, []);

  // Fetch appointments and map doctor/patient names
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const snapshot = await getDocs(collection(db, "appointments"));
        const apptData = snapshot.docs.map((doc) => {
          const data = doc.data();
          const doctorName = doctors.find((d) => d.id === data.doctorId)?.name || "Unknown Doctor";
          const patientName = patients.find((p) => p.id === data.patientId)?.name || "Unknown Patient";
          return { id: doc.id, ...data, doctor: doctorName, patient: patientName };
        });
        setAppointments(apptData);
      } catch (err) {
        console.error("Error fetching appointments:", err);
      }
    };
    fetchAppointments();
  }, [doctors, patients]);

  // Remove doctor
  const removeDoctor = async (id: string) => {
    const doctorToRemove = doctors.find((doc) => doc.id === id);
    if (!doctorToRemove) return;
    if (!window.confirm(`Remove ${doctorToRemove.name}?`)) return;

    try {
      await deleteDoc(doc(db, "doctors", id));
      setDoctors(doctors.filter((doc) => doc.id !== id));
      setAppointments(appointments.filter((appt) => appt.doctor !== doctorToRemove.name));
    } catch (err) {
      console.error("Error deleting doctor:", err);
    }
  };

  // Remove patient
  const removePatient = async (id: string) => {
    const patientToRemove = patients.find((pat) => pat.id === id);
    if (!patientToRemove) return;
    if (!window.confirm(`Remove ${patientToRemove.name}?`)) return;

    try {
      await deleteDoc(doc(db, "users", id));
      setPatients(patients.filter((pat) => pat.id !== id));
      setAppointments(appointments.filter((appt) => appt.patient !== patientToRemove.name));
    } catch (err) {
      console.error("Error deleting patient:", err);
    }
  };

  // Remove appointment
  const removeAppointment = async (id: string) => {
    const appointmentToRemove = appointments.find((appt) => appt.id === id);
    if (!appointmentToRemove) return;
    if (!window.confirm(`Cancel this appointment?`)) return;

    try {
      await deleteDoc(doc(db, "appointments", id));
      setAppointments(appointments.filter((appt) => appt.id !== id));
    } catch (err) {
      console.error("Error deleting appointment:", err);
    }
  };

  const filteredDoctors = doctors.filter(
    (doc) =>
      doc.name?.toLowerCase().includes(doctorSearch.toLowerCase()) ||
      doc.id.toLowerCase().includes(doctorSearch.toLowerCase()) ||
      doc.specialty?.toLowerCase().includes(doctorSearch.toLowerCase())
  );

  const filteredPatients = patients.filter(
    (pat) =>
      pat.name?.toLowerCase().includes(patientSearch.toLowerCase()) ||
      pat.id.toLowerCase().includes(patientSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top bar */}
      <div className="flex justify-between items-center bg-blue-600 text-white px-6 py-4">
        <h1 className="text-xl font-bold">Admin Panel</h1>
      </div>

      {/* Sidebar + Content */}
      <div className="flex flex-1">
        <aside className="w-64 bg-white shadow-md">
          <nav className="flex flex-col p-4 space-y-2">
            <button className={`text-left px-3 py-2 rounded ${activeTab === "dashboard" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"}`} onClick={() => setActiveTab("dashboard")}>Dashboard Home</button>
            <button className={`text-left px-3 py-2 rounded ${activeTab === "doctors" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"}`} onClick={() => setActiveTab("doctors")}>Manage Doctors</button>
            <button className={`text-left px-3 py-2 rounded ${activeTab === "patients" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"}`} onClick={() => setActiveTab("patients")}>Manage Patients</button>
            <button className={`text-left px-3 py-2 rounded ${activeTab === "appointments" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"}`} onClick={() => setActiveTab("appointments")}>Manage Appointments</button>
          </nav>
        </aside>

        <main className="flex-1 p-6 overflow-y-auto">
          {activeTab === "dashboard" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Welcome, Admin 🎉</h2>
              <p className="text-gray-600">Use the sidebar to manage doctors, patients, and appointments.</p>
            </div>
          )}

          {/* Doctors */}
          {activeTab === "doctors" && (
            <div>
              <h2 className="text-xl font-bold mb-4">Manage Doctors</h2>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search doctor..."
                  value={doctorSearch}
                  onChange={(e) => setDoctorSearch(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md"
                />
              </div>
              <table className="w-full border-collapse border">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border px-4 py-2">Name</th>
                    <th className="border px-4 py-2">Specialty</th>
                    <th className="border px-4 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDoctors.map((doc) => (
                    <tr key={doc.id}>
                      <td className="border px-4 py-2">{doc.name}</td>
                      <td className="border px-4 py-2">{doc.specialty}</td>
                      <td className="border px-4 py-2 text-center">
                        <button onClick={() => removeDoctor(doc.id)} className="bg-red-500 text-white px-3 py-1 rounded">Remove</button>
                      </td>
                    </tr>
                  ))}
                  {filteredDoctors.length === 0 && <tr><td className="border px-4 py-2 text-center" colSpan={3}>No doctors found.</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {/* Patients */}
          {activeTab === "patients" && (
            <div>
              <h2 className="text-xl font-bold mb-4">Manage Patients</h2>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search patient..."
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md"
                />
              </div>
              <table className="w-full border-collapse border">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border px-4 py-2">Name</th>
                    <th className="border px-4 py-2">Age</th>
                    <th className="border px-4 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((pat) => (
                    <tr key={pat.id}>
                      <td className="border px-4 py-2">{pat.name}</td>
                      <td className="border px-4 py-2">{pat.age}</td>
                      <td className="border px-4 py-2 text-center">
                        <button onClick={() => removePatient(pat.id)} className="bg-red-500 text-white px-3 py-1 rounded">Remove</button>
                      </td>
                    </tr>
                  ))}
                  {filteredPatients.length === 0 && <tr><td className="border px-4 py-2 text-center" colSpan={3}>No patients found.</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {/* Appointments */}
          {activeTab === "appointments" && (
            <div>
              <h2 className="text-xl font-bold mb-4">Manage Appointments</h2>
              <table className="w-full border-collapse border">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border px-4 py-2">Doctor</th>
                    <th className="border px-4 py-2">Patient</th>
                    <th className="border px-4 py-2">Date</th>
                    <th className="border px-4 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appt) => (
                    <tr key={appt.id}>
                      <td className="border px-4 py-2">{appt.doctor}</td>
                      <td className="border px-4 py-2">{appt.patient}</td>
                      <td className="border px-4 py-2">{appt.date}</td>
                      <td className="border px-4 py-2 text-center">
                        <button onClick={() => removeAppointment(appt.id)} className="bg-red-500 text-white px-3 py-1 rounded">Cancel</button>
                      </td>
                    </tr>
                  ))}
                  {appointments.length === 0 && <tr><td className="border px-4 py-2 text-center" colSpan={4}>No appointments found.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
