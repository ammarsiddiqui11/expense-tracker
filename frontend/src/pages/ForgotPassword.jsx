import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/axiosInstance";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleForgot = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/auth/forgot-password", { email });

      const userId = res.data.userId; // backend returns this

      navigate(`/verify-otp?userId=${userId}&flow=forgot`);
    } catch (err) {
      setMessage(err.response?.data?.message || "Error sending OTP");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200">
      <form
        onSubmit={handleForgot}
        className="bg-white p-6 rounded shadow-lg w-96"
      >
        <h2 className="text-2xl font-bold text-center mb-4">
          Forgot Password
        </h2>

        {message && (
          <p className="text-red-500 text-center mb-2">{message}</p>
        )}

        <input
          type="email"
          placeholder="Enter registered email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 rounded mb-4"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded"
        >
          Send OTP
        </button>
      </form>
    </div>
  );
}
