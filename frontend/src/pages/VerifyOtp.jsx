import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../utils/axiosInstance";
import { useAuth } from "../context/AuthContext";

export default function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");

  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { saveToken } = useAuth();

  const userId = params.get("userId");
  const flow = params.get("flow"); // signup or forgot

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp) return setMessage("Enter OTP");

    try {
      if (flow === "forgot") {
        // Step 1: Just verify OTP for forgot flow
        await api.post("/auth/verify-forgot-otp", { userId, otp });

        // Step 2: Redirect to reset password page
        navigate(`/reset-password/${userId}`);
        return;
      }

      // -----------------------------
      // SIGNUP FLOW
      // -----------------------------
      const res = await api.post("/auth/verify-signup", { userId, otp });

      saveToken(res.data.token);
      navigate("/");

    } catch (err) {
      setMessage(err.response?.data?.message || "Verification failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleVerify}
        className="bg-white p-6 rounded shadow-lg w-96"
      >
        <h2 className="text-2xl font-bold text-center mb-4">
          Verify OTP
        </h2>

        {message && (
          <p className="text-red-500 text-center mb-2">{message}</p>
        )}

        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full border p-2 rounded mb-4"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded mt-2"
        >
          Verify
        </button>
      </form>
    </div>
  );
}
