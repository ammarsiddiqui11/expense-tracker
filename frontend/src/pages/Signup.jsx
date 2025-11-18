
// import { useState } from "react";
// import { useNavigate } from "react-router-dom";

// src/pages/Signup.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/axiosInstance";

export default function Signup() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/auth/signup", form);

      // Backend must return userId here
      const userId = res.data.userId;

      navigate(`/verify-otp?type=signup&userId=${userId}`);

    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="w-full h-screen flex justify-center items-center bg-gray-100">
      <form
        onSubmit={handleSignup}
        className="bg-white p-8 rounded-lg shadow-lg w-96"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Create Account</h2>

        <input
          type="text"
          name="username"
          placeholder="Username"
          className="w-full border p-3 rounded mb-3"
          value={form.username}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          className="w-full border p-3 rounded mb-3"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          className="w-full border p-3 rounded mb-3"
          value={form.password}
          onChange={handleChange}
          required
        />

        {error && (
          <p className="text-red-600 text-sm text-center mb-3">{error}</p>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-3 rounded"
        >
          Sign Up
        </button>

        <p
          className="text-center mt-4 text-sm text-blue-600 cursor-pointer"
          onClick={() => navigate("/login")}
        >
          Already have an account? Login
        </p>
      </form>
    </div>
  );
}



