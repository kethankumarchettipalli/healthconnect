import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { useAuth } from "@/context/AuthContext";
import { Doctor } from "@/types";
import LoadingSpinner from "@/components/UI/LoadingSpinner";

const DoctorEditProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [qualification, setQualification] = useState("");
  const [consultationFee, setConsultationFee] = useState<number>(0);
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState("");

  useEffect(() => {
    if (!id) return;
    const fetchDoctor = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "doctors", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as Doctor;
          setDoctor({ id: docSnap.id, ...data });
          setName(data.name || "");
          setSpecialty(data.specialty || "");
          setQualification(data.qualification || "");
          setConsultationFee(data.consultationFee || 0);
          setBio(data.bio || "");
          setProfileImage(data.profileImage || "");
        }
      } catch (error) {
        console.error("Error fetching doctor:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctor || !user) return;

    if (user.uid !== doctor.id) {
      alert("You are not authorized to edit this profile.");
      return;
    }

    setSaving(true);
    try {
      const docRef = doc(db, "doctors", doctor.id);
      await updateDoc(docRef, {
        name,
        specialty,
        qualification,
        consultationFee,
        bio,
        profileImage,
        updatedAt: new Date(),
      });
      alert("Profile updated successfully!");
      navigate(`/doctors/${doctor.id}`);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;
  if (!doctor) return <p className="text-center text-gray-500 py-20">Doctor not found</p>;

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6 mt-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Profile</h1>
      <form onSubmit={handleUpdate} className="space-y-5">
        {/* Image with preview */}
        <div>
          <label className="block text-sm font-semibold text-gray-700">Profile Image URL</label>
          <input
            type="text"
            value={profileImage}
            onChange={(e) => setProfileImage(e.target.value)}
            className="w-full mt-1 border rounded-md px-3 py-2"
            placeholder="Paste image URL here"
          />
          {profileImage && (
            <img
              src={profileImage}
              alt="Preview"
              className="mt-3 w-32 h-32 object-cover rounded-full border shadow"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700">Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)}
            className="w-full mt-1 border rounded-md px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700">Specialty</label>
          <input type="text" value={specialty} onChange={(e) => setSpecialty(e.target.value)}
            className="w-full mt-1 border rounded-md px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700">Qualification</label>
          <input type="text" value={qualification} onChange={(e) => setQualification(e.target.value)}
            className="w-full mt-1 border rounded-md px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700">Consultation Fee</label>
          <input type="number" value={consultationFee} onChange={(e) => setConsultationFee(Number(e.target.value))}
            className="w-full mt-1 border rounded-md px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700">Bio</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)}
            className="w-full mt-1 border rounded-md px-3 py-2" rows={4} />
        </div>
        <button type="submit" disabled={saving}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400">
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default DoctorEditProfile;
