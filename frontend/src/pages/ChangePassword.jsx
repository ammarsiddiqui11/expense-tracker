// src/pages/ChangePassword.jsx
import { useState } from "react";
import api from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

export default function ChangePassword() {
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    setMsg("");
    if (newPass !== confirm) return setMsg("Passwords do not match");

    try {
      // adjust endpoint if your backend differs
      await api.post("/auth/change-password", { currentPassword: current, newPassword: newPass });
      alert("Password changed");
      navigate("/profile");
    } catch (err) {
      setMsg(err.response?.data?.message || "Change failed");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <form onSubmit={handle} className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Change Password</h2>

        {msg && <div className="text-red-600 mb-3">{msg}</div>}

        <input value={current} onChange={(e) => setCurrent(e.target.value)} type="password" placeholder="Current Password" className="w-full p-2 border rounded mb-3" />
        <input value={newPass} onChange={(e) => setNewPass(e.target.value)} type="password" placeholder="New Password" className="w-full p-2 border rounded mb-3" />
        <input value={confirm} onChange={(e) => setConfirm(e.target.value)} type="password" placeholder="Confirm New Password" className="w-full p-2 border rounded mb-3" />

        <button className="w-full bg-blue-600 text-white p-2 rounded">Change</button>
      </form>
    </div>
  );
}
