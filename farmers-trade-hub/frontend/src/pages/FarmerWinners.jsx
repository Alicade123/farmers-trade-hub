import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../utils";
import { ToastContainer, toast } from "react-toastify";

export default function FarmerWinners() {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchWinners = async () => {
      try {
        const res = await axios.get(`${API_URL}/bids/winners/${user.id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setWinners(res.data);
      } catch (err) {
        toast.error("Failed to load winners");
      } finally {
        setLoading(false);
      }
    };

    fetchWinners();
  }, [user.id]);

  return (
    <div className="p-6">
      <ToastContainer />
      <h2 className="text-2xl font-bold mb-4">🏆 Declared Winners</h2>
      {loading ? (
        <p>Loading...</p>
      ) : winners.length === 0 ? (
        <p>No winners yet.</p>
      ) : (
        <table className="w-full border text-left">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2">Product</th>
              <th className="p-2">Winner (Buyer ID)</th>
              <th className="p-2">Amount</th>
              <th className="p-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {winners.map((w) => (
              <tr key={w.id} className="border-t">
                <td className="p-2">{w.product_name}</td>
                <td className="p-2">{w.buyer_id}</td>
                <td className="p-2">RWF {w.amount}</td>
                <td className="p-2">
                  {new Date(w.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
