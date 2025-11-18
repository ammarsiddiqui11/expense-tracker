import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/axiosInstance"

export default function ResetPassword() {
  const { userId } = useParams(); // from /reset-password/:userId
  const navigate = useNavigate();

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();

    if ( !newPassword) {
      return setMessage("OTP and new password are required");
    }

    try {
      const res = await api.post("/auth/reset-password", {
        userId,
        
        newPassword,
      });

      alert("Password reset successful!");
      navigate("/login");

    } catch (err) {
      setMessage(err.response?.data?.message || "Could not reset password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleReset}
        className="bg-white p-6 rounded shadow-lg w-96"
      >
        <h2 className="text-2xl font-bold text-center mb-4">
          Reset Password
        </h2>

        {message && (
          <p className="text-red-500 text-center mb-2">{message}</p>
        )}

        {/* <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full border p-2 rounded mb-3"
        /> */}

        <input
          type="password"
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full border p-2 rounded mb-4"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded"
        >
          Reset Password
        </button>
      </form>
    </div>
  );
}
