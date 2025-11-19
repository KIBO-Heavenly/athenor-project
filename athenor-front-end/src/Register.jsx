import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Tutor"); // default role
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5137/api/Auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password, role }),
      });

      const data = await response.json();
      console.log("Registration response:", data);

      if (response.ok) {
        alert("User registered successfully! You can now log in.");
        navigate("/"); // redirect to login page
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 px-4">
      <div className="bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <h2 className="text-center text-2xl font-bold mb-6">Register</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded-md"
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded-md"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded-md"
          />

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full border px-3 py-2 rounded-md"
          >
            <option value="Tutor">Tutor</option>
            <option value="Admin">Admin</option>
          </select>

          <button
            type="submit"
            className={`w-full bg-blue-600 text-white py-2.5 rounded-md font-medium hover:bg-blue-700 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}
