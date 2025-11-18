// src/components/TransactionForm.jsx
import { useState } from "react";
import api from "../utils/axiosInstance";

export default function TransactionForm({ onCreated = () => {} }) {
  const [form, setForm] = useState({ type: "income", description: "", amount: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!form.description || !form.amount) return setErr("All fields required");
    if (Number(form.amount) <= 0) return setErr("Amount must be > 0");

    setLoading(true);
    try {
      await api.post("/transactions", {
        type: form.type,
        description: form.description,
        amount: Number(form.amount),
      });
      setForm({ type: "income", description: "", amount: "" });
      onCreated();
    } catch (err) {
      setErr(err.response?.data?.message || "Could not create transaction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {err && <div className="text-red-600 text-sm">{err}</div>}

      <select name="type" value={form.type} onChange={handleChange} className="w-full text-black border cursor-pointer p-2 rounded">
        <option value="income" className="bg-orange-600 ">Income</option>
        <option value="expense" className="bg-orange-600">Expense</option>
      </select>

      <input
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder="Description"
        className="w-full text-black border p-2 rounded"
      />

      <input
        name="amount"
        value={form.amount}
        onChange={handleChange}
        placeholder="Amount"
        type="number"
        step="0.01"
        className="w-full text-black border p-2 rounded"
      />

      <button disabled={loading} className="w-full bg-orange-600 text-white p-2 cursor-pointer rounded">
        {loading ? "Saving..." : "Add Transaction"}
      </button>
    </form>
  );
}
