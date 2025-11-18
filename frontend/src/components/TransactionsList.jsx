// src/components/TransactionsList.jsx
import { useEffect, useState } from "react";
import api from "../utils/axiosInstance";
import TransactionItem from "./TransactionItem";

export default function TransactionsList({ filters, setFilters, refreshTrigger, onActionComplete = () => {} }) {
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 1 });

  const fetch = async () => {
    setLoading(true);
    try {
      const params = { ...filters };
      const res = await api.get("/transactions", { params });
      setTransactions(res.data.transactions);
      setMeta({ total: res.data.total, page: res.data.page, pages: res.data.pages });
    } catch (err) {
      console.error("fetch tx err", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
    
  }, [filters, refreshTrigger]);

  const handlePage = (newPage) => {
    setFilters({ ...filters, page: newPage });
  };

  return (
    <div className="text-black">
      <div className="mb-3">
        {loading ? <div className="text-sm text-gray-600">Loading...</div> : null}
      </div>

      <div className="space-y-3">
        {transactions.length === 0 && !loading && <div className="text-sm text-gray-500">No transactions</div>}

        {transactions.map((t) => (
          <TransactionItem key={t._id} tx={t} onUpdated={onActionComplete} onDeleted={onActionComplete} />
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">Total: {meta.total}</div>
        <div className="flex gap-2 items-center">
          <button disabled={meta.page <= 1} onClick={() => handlePage(meta.page - 1)} className="px-3 py-1 cursor-pointer rounded disabled:opacity-50 bg-orange-600">Prev</button>
          <span className="px-3 py-1">{meta.page} / {meta.pages}</span>
          <button disabled={meta.page >= meta.pages} onClick={() => handlePage(meta.page + 1)} className="px-3 py-1 cursor-pointer rounded disabled:opacity-50 bg-orange-600">Next</button>
        </div>
      </div>
    </div>
  );
}
