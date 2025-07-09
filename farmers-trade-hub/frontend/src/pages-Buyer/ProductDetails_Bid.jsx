import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../utils";
import { ToastContainer, toast } from "react-toastify";
import { BeatLoader } from "react-spinners";
import { io } from "socket.io-client";
import Chart from "chart.js/auto";
import "react-toastify/dist/ReactToastify.css";

const socket = io("http://localhost:5000");

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [momoNumber, setMomoNumber] = useState("");
  const [hasPaidBidFees, setHasPaidBidFees] = useState(false);
  const [highestBid, setHighestBid] = useState(0);
  const [bidHistory, setBidHistory] = useState([]);
  const [countdown, setCountdown] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const chartRef = useRef();
  const chartInstance = useRef(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const isBuyer = user?.role?.toLowerCase() === "buyer";

  const fetchBids = async () => {
    const res = await axios.get(`${API_URL}/bids/product/${id}`);
    const bids = res.data || [];
    setBidHistory(bids);
    setHighestBid(bids.length > 0 ? bids[0].amount : product?.price || 0);
  };

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const res = await axios.get(`${API_URL}/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        setError("Unable to fetch product details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  useEffect(() => {
    if (product) fetchBids();
  }, [product]);

  useEffect(() => {
    if (!product?.expiry_date) return;
    const interval = setInterval(() => {
      const now = new Date();
      const expiry = new Date(product.expiry_date);
      const diff = expiry - now;

      if (diff <= 0) {
        clearInterval(interval);
        setCountdown("⏰ Bidding period has ended.");
        return;
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setCountdown(`${d}d ${h}h ${m}m ${s}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [product?.expiry_date]);

  useEffect(() => {
    const handler = (bid) => {
      if (bid.product_id === parseInt(id)) {
        fetchBids(); // instead of local update, fetch fresh from DB
      }
    };
    socket.on("new_bid", handler);
    return () => socket.off("new_bid", handler);
  }, [id]);

  useEffect(() => {
    if (!chartRef.current || !Array.isArray(bidHistory)) return;
    if (chartInstance.current) chartInstance.current.destroy();
    const ctx = chartRef.current.getContext("2d");
    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: bidHistory.map((b) =>
          new Date(b.timestamp).toLocaleTimeString()
        ),
        datasets: [
          {
            label: "Bid Amount (RWF)",
            data: bidHistory.map((b) => b.amount),
            borderColor: "#16a34a",
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: { display: true, text: "Live Bidding History" },
        },
        scales: { y: { beginAtZero: true } },
      },
    });
  }, [bidHistory]);

  const biddingEnded = new Date(product?.expiry_date) - new Date() <= 0;
  const currentTopBidderId = bidHistory[0]?.buyer_id;
  const isCurrentUserWinner = biddingEnded && currentTopBidderId === user?.id;

  const handleBid = async () => {
    if (!hasPaidBidFees) return setShowPaymentModal(true);
    if (Number(bidAmount) <= highestBid) return toast.error("Bid too low");

    try {
      await axios.post(`${API_URL}/bids/placeBid`, {
        product_id: product.id,
        buyer_id: user.id,
        amount: Number(bidAmount),
      });

      socket.emit("place_bid", {
        product_id: product.id,
        buyer_id: user.id,
        amount: Number(bidAmount),
        timestamp: new Date().toISOString(),
      });

      toast.success(" Bid placed!");
      setBidAmount("");
    } catch (err) {
      toast.error("Failed: " + (err.response?.data?.message || err.message));
    }
  };

  const confirmPayment = async () => {
    if (!momoNumber.trim()) return toast.error("Enter phone number");

    try {
      const response = await axios.post(`${API_URL}/momo/pay`, {
        amount: 500,
        phone: momoNumber,
        buyerId: user.id,
        productId: product.id,
      });

      const referenceId = response.data.referenceId;
      toast.success("💰 Payment initiated: " + referenceId);

      // Wait and check payment status after 5 seconds
      const checkStatus = async () => {
        try {
          const res = await axios.get(`${API_URL}/momo/status/${referenceId}`);
          const status = res.data.status;

          if (status === "SUCCESSFUL") {
            setHasPaidBidFees(true);
            setShowPaymentModal(false);
            toast.success("✅ Payment confirmed!");
          } else if (status === "FAILED") {
            toast.error("❌ Payment failed.");
          } else {
            toast.info("⌛ Waiting for confirmation...");

            // Optional: try again in 3 seconds
            setTimeout(checkStatus, 3000);
          }
        } catch (err) {
          toast.error("Status check error: " + err.message);
        }
      };

      setTimeout(checkStatus, 5000);
    } catch (err) {
      toast.error("Payment failed: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <BeatLoader color="#16a34a" size={14} />
        <p className="text-gray-600 mt-2">Loading product details...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-600 py-10">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <ToastContainer />
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Pay Bidding Fee</h3>
            <input
              type="text"
              placeholder="Enter MoMo Number"
              value={momoNumber}
              onChange={(e) => setMomoNumber(e.target.value)}
              className="w-full mb-3 px-3 py-2 border rounded"
            />
            <button
              onClick={confirmPayment}
              className="bg-yellow-500 text-white px-4 py-2 rounded w-full"
            >
              Confirm Payment
            </button>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-semibold text-green-800">
            {product.name}
          </h2>
          <button
            onClick={() => navigate(-1)}
            className="text-sm bg-gray-100 border border-gray-300 text-gray-700 px-4 py-1 rounded"
          >
            &larr; Back
          </button>
        </div>

        <p className="text-sm text-red-600 font-semibold">
          ⏳ Time left: {countdown}
        </p>

        {isCurrentUserWinner && (
          <p className="text-green-700 font-bold text-lg">
            🎉 You are the winner of this bid!
          </p>
        )}

        <img
          src={`${API_URL}/products/image/${id}`}
          alt={product.name}
          onError={(e) => (e.target.src = "/placeholder.jpg")}
          className="w-full h-64 object-cover rounded-lg border"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700 bg-gray-50 border rounded-xl p-6">
          <div>
            <p className="text-sm text-gray-500">Category</p>
            <p className="font-semibold">{product.category}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Price</p>
            <p className="font-semibold">RWF {product.price}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Expiry Date</p>
            <p className="font-semibold">
              {product.expiry_date?.split("T")[0]}
            </p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-sm text-gray-500">Description</p>
            <p>{product.description}</p>
          </div>
        </div>

        <div className="h-[300px] w-full bg-white rounded-md border p-2">
          <canvas ref={chartRef} />
        </div>

        {isBuyer && !biddingEnded && (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-gray-700">
              💰 Highest Bid:{" "}
              <span className="font-bold text-green-700">
                RWF {highestBid || `${product.price}`}
              </span>
            </p>

            {currentTopBidderId === user?.id && (
              <p className="text-green-600 font-medium">
                You are ahead and leading the Bidding.
              </p>
            )}

            <input
              type="number"
              placeholder="Enter your bid"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              className="w-full px-3 py-2 border rounded text-sm"
              disabled={currentTopBidderId === user?.id}
            />
            <button
              onClick={handleBid}
              disabled={
                Number(bidAmount) <= product.price ||
                Number(bidAmount) <= highestBid ||
                currentTopBidderId === user?.id
              }
              className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 transition disabled:opacity-50"
            >
              Place Bid
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
