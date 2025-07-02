// src/pages/BuyerBidHistory.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../utils";

export default function BuyerBidHistory() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true); // <-- new loading state

  useEffect(() => {
    if (!user?.id) return;
    axios
      .get(`${API_URL}/bids/buyer/${user.id}`)
      .then((res) => setBids(res.data))
      .catch((err) => console.log(err))
      .finally(() => setLoading(false)); // <-- mark loading complete
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-3">📝 My Bid History</h2>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="w-6 h-6 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : bids.length === 0 ? (
        <p className="text-gray-600">No bid history found.</p>
      ) : (
        <ul className="space-y-2">
          {bids.map((bid) => (
            <li key={bid.id} className="bg-white border p-4 rounded shadow-sm">
              <p className="font-semibold">{bid.product_name}</p>
              <p className="text-sm text-gray-600">Amount: RWF {bid.amount}</p>
              <p className="text-xs text-gray-400">
                Placed on: {new Date(bid.created_at).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
