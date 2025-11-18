// src/components/TransactionItem.jsx
import { useState } from "react";
import api from "../utils/axiosInstance";

export default function TransactionItem({ tx, onUpdated = () => {}, onDeleted = () => {} }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ type: tx.type, description: tx.description, amount: tx.amount });
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setLoading(true);
    try {
      await api.put(`/transactions/${tx._id}`, {
        type: form.type,
        description: form.description,
        amount: Number(form.amount),
      });
      setEditing(false);
      onUpdated();
    } catch (err) {
      console.error("update err", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const remove = async () => {
    if (!confirm("Delete this transaction?")) return;
    try {
      await api.delete(`/transactions/${tx._id}`);
      onDeleted();
    } catch (err) {
      console.error("delete err", err.response?.data || err.message);
    }
  };

  return (
    <div className="p-3 border rounded flex items-start justify-between">
      {!editing ? (
        <>
          <div>
            <div className="font-medium">{tx.description}</div>
            <div className="text-sm text-gray-500">{new Date(tx.date || tx.createdAt).toLocaleString()}</div>
            <div className="text-sm mt-1">{tx.type}</div>
          </div>

          <div className="text-right">
            <div className={`font-semibold ${tx.type === "income" ? "text-green-600" : "text-red-600"}`}>
              ₹ {Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>

            <div className="flex gap-2 mt-2">
              <button onClick={() => setEditing(true)} className="text-sm text-black cursor-pointer">Edit</button>
              <button onClick={remove} className="text-sm text-orange-600 cursor-pointer">Delete</button>
            </div>
          </div>
        </>
      ) : (
        <div className="w-full flex gap-2 text-black">
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="p-2 border rounded">
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="border p-2 rounded flex-1" />

          <input value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="border p-2 rounded w-28" />

          <div className="flex gap-1">
            <button onClick={save} disabled={loading} className="bg-orange-600 text-white px-3 py-1 rounded cursor-pointer">Save</button>
            <button onClick={() => setEditing(false)} className="px-3 py-1  bg-black text-orange-600 rounded cursor-pointer">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
