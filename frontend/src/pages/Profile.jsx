import { useEffect, useState } from "react";
import axios from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const fetchProfile = async () => {
    try {
      const res = await axios.get("/auth/me");
      setUser(res.data.user);
      setLoading(false);
    } catch (err) {
      navigate("/login");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const changePasswordHandler = async () => {
    if (!oldPassword || !newPassword) {
      setPasswordError("Both fields are required");
      return;
    }

    try {
      const res = await axios.put("/auth/change-password", {
        oldPassword,
        newPassword,
      });

      setPasswordSuccess(res.data.message);
      setPasswordError("");
      setOldPassword("");
      setNewPassword("");
      setTimeout(() => setShowPasswordModal(false), 1500);
    } catch (err) {
      setPasswordError(err.response?.data?.message || "Something went wrong");
    }
  };

  if (loading)
    return <h2 className="text-center mt-10 text-orange-600 font-semibold">Loading...</h2>;

  return (
    <div className="min-h-screen bg-gray-900 flex items-start justify-center py-10">
    <div className="max-w-lg mx-auto mt-10 p-6 border rounded-xl shadow-lg bg-white">
      <h2 className="text-3xl font-bold text-center bg-orange-600 rounded-xl text-white py-3 mb-6 shadow-md">
        Profile
      </h2>

      <div className="space-y-4 text-gray-800">
        <div className="flex justify-between">
          <span className="font-semibold">Username:</span>
          <span>{user?.username}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Email:</span>
          <span>{user?.email}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Password:</span>
          <span>••••••••</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <button
          onClick={() => setShowPasswordModal(true)}
          className="flex-1 bg-orange-600 hover:bg-orange-700 cursor-pointer transition-colors text-white px-5 py-2 rounded-lg shadow-md font-medium"
        >
          Change Password
        </button>

        <button
          onClick={logout}
          className="flex-1 bg-red-500 hover:bg-red-600 cursor-pointer transition-colors text-white px-5 py-2 rounded-lg shadow-md font-medium"
        >
          Logout
        </button>
      </div>

      {showPasswordModal && (
        <div className="mt-6 p-6 border rounded-xl bg-gray-50 shadow-lg">
          <h3 className="text-xl font-semibold mb-4 cursor-pointer text-orange-600">Change Password</h3>

          <input
            type="password"
            placeholder="Old Password"
            className="w-full border border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 p-3 rounded-lg mb-4 transition"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />

          <input
            type="password"
            placeholder="New Password"
            className="w-full border border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 p-3 rounded-lg mb-4 transition"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          {passwordError && <p className="text-red-500 text-sm mb-2">{passwordError}</p>}
          {passwordSuccess && <p className="text-green-600 text-sm mb-2">{passwordSuccess}</p>}

          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <button
              onClick={changePasswordHandler}
              className="flex-1 bg-green-600 hover:bg-green-700 cursor-pointer transition-colors text-white px-5 py-2 rounded-lg shadow-md font-medium"
            >
              Update
            </button>

            <button
              onClick={() => setShowPasswordModal(false)}
              className="flex-1 bg-gray-400 hover:bg-gray-500 cursor-pointer transition-colors text-white px-5 py-2 rounded-lg shadow-md font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
