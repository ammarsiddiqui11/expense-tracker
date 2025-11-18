// src/components/FiltersBar.jsx
import { useState } from "react";

export default function FiltersBar({ filters, setFilters, onApply }) {
  const [local, setLocal] = useState(filters);

  const apply = () => {
    const updated = { ...local, page: 1 };
    setFilters(updated);
    onApply(updated);  // <<< IMPORTANT
  };

  const reset = () => {
    const empty = {
      type: "",
      startDate: "",
      endDate: "",
      minAmount: "",
      maxAmount: "",
      sort: "createdAt",
      order: "desc",
      page: 1,
      limit: 10,
    };
    setLocal(empty);
    setFilters(empty);
    onApply(empty);
  };

  return (
    <div className="space-y-3 text-black">
      <div className="flex gap-2">
        <select value={local.type} onChange={(e) => setLocal({ ...local, type: e.target.value })} className="p-2 border cursor-pointer rounded">
          <option value="" className="bg-orange-600">All</option>
          <option value="income" className="bg-orange-600">Income</option>
          <option value="expense" className="bg-orange-600">Expense</option>
        </select>

        <input type="date" value={local.startDate} onChange={(e) => setLocal({ ...local, startDate: e.target.value })} className="p-2 border rounded" />
        <input type="date" value={local.endDate} onChange={(e) => setLocal({ ...local, endDate: e.target.value })} className="p-2 border rounded" />
      </div>

      <div className="flex gap-2">
        <input placeholder="Min amount" type="number" value={local.minAmount} onChange={(e) => setLocal({ ...local, minAmount: e.target.value })} className="p-2 border rounded" />
        <input placeholder="Max amount" type="number" value={local.maxAmount} onChange={(e) => setLocal({ ...local, maxAmount: e.target.value })} className="p-2 border rounded" />

        <select value={local.sort} onChange={(e) => setLocal({ ...local, sort: e.target.value })} className="p-2 border cursor-pointer rounded">
          <option value="createdAt">Date</option>
          <option value="amount">Amount</option>
          <option value="type">Type</option>
        </select>

        <select value={local.order} onChange={(e) => setLocal({ ...local, order: e.target.value })} className="p-2 border cursor-pointer rounded">
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </select>
      </div>

      <div className="flex gap-2">
        <button onClick={apply} className="bg-orange-600 text-white px-4 py-2 cursor-pointer rounded">Apply</button>
        <button onClick={reset} className="bg-black text-orange-600 px-4 py-2 cursor-pointer rounded">Reset</button>
      </div>
    </div>
  );
}
