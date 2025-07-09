import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../utils";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function FarmerBidsManager() {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWinners, setSelectedWinners] = useState({});
  const user = JSON.parse(localStorage.getItem("user"));
  const farmerId = user?.id;

  useEffect(() => {
    const fetchBids = async () => {
      try {
        const res = await axios.get(`${API_URL}/bids/farmer/${farmerId}`);
        setBids(res.data);
      } catch (err) {
        toast.error("Failed to fetch bids.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBids();
  }, [farmerId]);

  const handleSelectWinner = (productId, bid) => {
    setSelectedWinners((prev) => ({ ...prev, [productId]: bid }));
  };

  const handleConfirmWinner = async (productId) => {
    const winner = selectedWinners[productId];
    if (!winner) return toast.error("Select a winner first.");

    try {
      await axios.post(`${API_URL}/bids/declare-winner`, {
        product_id: productId,
        bid_id: winner.id,
        buyer_id: winner.buyer_id,
        amount: winner.amount,
      });

      toast.success(`🎉 Winner declared for product ${productId}.`);

      // Optional: remove all bids for this product after closing
      setBids((prev) => prev.filter((b) => b.product_id !== productId));
    } catch (err) {
      console.error(err);
      toast.error("Failed to declare winner.");
    }
  };

  const groupedBids = bids.reduce((acc, bid) => {
    if (!acc[bid.product_id]) acc[bid.product_id] = [];
    acc[bid.product_id].push(bid);
    return acc;
  }, {});

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto bg-white rounded-lg shadow">
      <ToastContainer />
      <h2 className="text-2xl font-semibold mb-4 text-green-800">
        📝 All Bids on Your Products
      </h2>

      {Object.entries(groupedBids).map(([productId, productBids]) => (
        <div
          key={productId}
          className="mb-6 border-t pt-4 border-gray-200 bg-gray-50 p-4 rounded-md"
        >
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            📦 {productBids[0].product_name}
          </h3>

          <table className="w-full border text-sm">
            <thead className="bg-green-700 text-white">
              <tr>
                <th className="p-2">Bidder ID</th>

                <th className="p-2">Amount (RWF)</th>
                <th className="p-2">Date</th>
                <th className="p-2">Select</th>
              </tr>
            </thead>
            <tbody>
              {productBids.map((bid) => (
                <tr
                  key={bid.id}
                  className={
                    selectedWinners[productId]?.id === bid.id
                      ? "bg-green-100"
                      : "hover:bg-gray-100"
                  }
                >
                  <td className="p-2 text-center">{bid.buyer_id}</td>

                  <td className="p-2 text-center">{bid.amount}</td>
                  <td className="p-2 text-center">
                    {new Date(bid.created_at).toLocaleString()}
                  </td>
                  <td className="p-2 text-center">
                    <input
                      type="radio"
                      name={`winner-${productId}`}
                      onChange={() => handleSelectWinner(productId, bid)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            onClick={() => handleConfirmWinner(productId)}
            className="mt-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            save winner & End Bidding
          </button>
        </div>
      ))}

      {bids.length === 0 && (
        <p className="text-gray-500 text-center mt-6">
          No bids placed on your products yet.
        </p>
      )}
    </div>
  );
}
