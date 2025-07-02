// src/pages/AdminAllBids.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../utils";

export default function AdminAllBids() {
  const [bids, setBids] = useState([]);

  useEffect(() => {
    axios
      .get(`${API_URL}/bids`)
      .then((res) => setBids(res.data))
      .catch((err) => console.error("Failed to load bids", err));
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">All Bids</h2>
      <table className="w-full border text-sm">
        <thead className="bg-green-100">
          <tr>
            <th>Bid ID</th>
            <th>Product</th>
            <th>Buyer</th>
            <th>Amount (RWF)</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {bids.map((b) => (
            <tr key={b.id} className="text-center border-t">
              <td>{b.id}</td>
              <td>{b.product_id}</td>
              <td>{b.buyer_id}</td>
              <td>{b.amount}</td>
              <td>{new Date(b.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
