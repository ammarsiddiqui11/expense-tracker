import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../utils/axiosInstance";
import { useAuth } from "../context/AuthContext";

export default function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState(""); // Renamed from message for clarity
  const [isLoading, setIsLoading] = useState(false); // Added loading state

  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { saveToken } = useAuth();

  const userId = params.get("userId");
  const flow = params.get("flow"); // signup or forgot

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp) return setError("Please enter the OTP sent to your email.");
    
    setError("");
    setIsLoading(true);

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
      setError(err.response?.data?.message || "Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8 space-y-6 transform transition-all">
        
        {/* Header with Icon */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            {/* Shield Check Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Verify OTP
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Please enter the verification code sent to your email address.
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded text-sm" role="alert">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-6">
          
          {/* OTP Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
              One-Time Password
            </label>
            <input
              type="text"
              maxLength={6} // Assuming 6 digit OTP
              placeholder="------"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full py-3 px-4 border border-gray-300 rounded-lg text-center text-2xl tracking-[1em] font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-200 placeholder-gray-300 uppercase"
            />
          </div>

          {/* Verify Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200 ${
              isLoading ? "opacity-70 cursor-not-allowed" : "hover:shadow-lg"
            }`}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </span>
            ) : (
              "Verify Code"
            )}
          </button>
        </form>
        
        {/* Optional: Back to Login Helper */}
        <div className="text-center mt-4">
            <button 
                onClick={() => navigate('/login')}
                className="text-sm text-gray-500 hover:text-orange-600 transition"
            >
                Back to Login
            </button>
        </div>

      </div>
    </div>
  );
}