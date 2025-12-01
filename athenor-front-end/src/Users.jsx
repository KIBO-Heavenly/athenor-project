import { useEffect, useState } from "react";

export default function Users() {
  const [tutors, setTutors] = useState([]);
  const [editingTutor, setEditingTutor] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // new field for password

  // ----------------------------------------------------
  // Load all tutors
  // ----------------------------------------------------
  const loadTutors = () => {
    fetch("http://localhost:5137/api/Users/tutors")
      .then((res) => res.json())
      .then((data) => setTutors(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadTutors();
  }, []);

  // ----------------------------------------------------
  // Delete tutor
  // ----------------------------------------------------
  const deleteTutor = async (id) => {
    if (!confirm("Are you sure you want to delete this tutor?")) return;

    const res = await fetch(`http://localhost:5137/api/Users/${id}`, {
      method: "DELETE",
    });

    const data = await res.json();
    alert(data.message);

    loadTutors();
  };

  // ----------------------------------------------------
  // Open Edit Modal
  // ----------------------------------------------------
  const startEdit = (tutor) => {
    setEditingTutor(tutor);
    setFullName(tutor.fullName);
    setEmail(tutor.email);
    setPassword(""); // empty password by default
  };

  // ----------------------------------------------------
  // Save Updated Tutor
  // ----------------------------------------------------
  const saveUpdate = async () => {
    const res = await fetch(`http://localhost:5137/api/Users/${editingTutor.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName,
        email,
        passwordHash: password || "" // only update if provided
      })
    });

    const data = await res.json();
    alert(data.message);

    setEditingTutor(null);
    loadTutors();
  };

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">Registered Tutors</h1>

      <table className="w-full border-collapse bg-white shadow-lg rounded-lg overflow-hidden">
        <thead className="bg-gray-900 text-white">
          <tr>
            <th className="py-3 px-4 text-left">Full Name</th>
            <th className="py-3 px-4 text-left">Email</th>
            <th className="py-3 px-4 text-left">Actions</th>
          </tr>
        </thead>

        <tbody>
          {tutors.map((tutor) => (
            <tr key={tutor.id} className="border-b hover:bg-gray-100">
              <td className="py-3 px-4">{tutor.fullName}</td>
              <td className="py-3 px-4">{tutor.email}</td>

              <td className="py-3 px-4 flex gap-3">
                <button
                  onClick={() => startEdit(tutor)}
                  className="px-4 py-1 bg-blue-600 text-white rounded"
                >
                  Update
                </button>

                <button
                  onClick={() => deleteTutor(tutor.id)}
                  className="px-4 py-1 bg-red-600 text-white rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ----------------------------------------------------
           UPDATE MODAL
      ----------------------------------------------------- */}
      {editingTutor && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Update Tutor</h2>

            <input
              className="w-full border px-3 py-2 mb-3 rounded"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full Name"
            />

            <input
              className="w-full border px-3 py-2 mb-3 rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />

            <input
              type="password"
              className="w-full border px-3 py-2 mb-3 rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New Password (optional)"
            />

            <div className="flex justify-end gap-3 mt-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => setEditingTutor(null)}
              >
                Cancel
              </button>

              <button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={saveUpdate}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
