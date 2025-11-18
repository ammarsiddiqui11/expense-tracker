// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import api from "../utils/axiosInstance";
import TransactionForm from "../components/TransactionForm";
import FiltersBar from "../components/FiltersBar";
import TransactionsList from "../components/TransactionsList";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    type: "",
    startDate: "",
    endDate: "",
    minAmount: "",
    maxAmount: "",
    sort: "createdAt",
    order: "desc",
    page: 1,
    limit: 10,
  });

  const [stats, setStats] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 });
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => setRefreshKey((k) => k + 1);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/transactions/stats");
        setStats(res.data);
      } catch (err) {
        console.error("stats err", err.response?.data || err.message);
      }
    };
    fetchStats();
  }, [filters, refreshKey]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* Profile Button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => navigate("/profile")}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded cursor-pointer shadow transition"
          >
            Profile
          </button>
        </div>

        {/* Header */}
        <header className="flex flex-col lg:flex-row items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-orange-500 mb-4 lg:mb-0">Finance Tracker</h1>
          <div className="text-right bg-white bg-opacity-30 p-4 rounded shadow">
            <div className="text-sm text-gray-300">Balance</div>
            <div className="text-2xl font-semibold text-orange-400">
              ₹ {Number(stats.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-4">
            {/* Add Transaction */}
            <div className="bg-white bg-opacity-30 p-6 rounded shadow">
              <h2 className="text-xl font-semibold text-orange-500 mb-4">Add Transaction</h2>
              <TransactionForm onCreated={refresh} />
            </div>
            {/* Quick Stats */}
            <div className="bg-white bg-opacity-30 p-6 rounded shadow">
              <h3 className="text-lg font-semibold text-orange-500 mb-3">Quick Stats</h3>
              <div className="text-sm text-gray-300">Income: <span className="text-green-400">₹ {Number(stats.totalIncome || 0).toLocaleString()}</span></div>
              <div className="text-sm text-gray-300">Expense: <span className="text-red-400">₹ {Number(stats.totalExpense || 0).toLocaleString()}</span></div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-4">
            {/* Filters */}
            <div className="bg-white bg-opacity-30 p-4 rounded shadow">
              <FiltersBar filters={filters} setFilters={setFilters} onApply={(f) => setFilters(f)} />
            </div>

            {/* Transactions List */}
            <div className="bg-white bg-opacity-30 p-4 rounded shadow">
              <TransactionsList filters={filters} setFilters={setFilters} refreshTrigger={refreshKey} onActionComplete={refresh} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
