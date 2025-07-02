import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../utils";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BeatLoader } from "react-spinners";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [hasPaidBidFees, setHasPaidBidFees] = useState(false);
  const [highestBid, setHighestBid] = useState(0);

  const user = JSON.parse(localStorage.getItem("user"));
  const isBuyer = user?.role?.toLowerCase() === "buyer";

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const res = await axios.get(`${API_URL}/products/${id}`);
        setProduct(res.data);

        const bidRes = await axios.get(`${API_URL}/products/bid/${id}`);
        if (bidRes.data.length > 0) {
          setHighestBid(bidRes.data[0].amount);
        } else {
          setHighestBid(res.data.price); // fallback to product price
        }
      } catch (err) {
        setError("Unable to fetch product details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);
  const [countdown, setCountdown] = useState("");

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

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setCountdown(
        `${days}d ${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [product?.expiry_date]);

  const biddingEnded = new Date(product?.expiry_date) - new Date() <= 0;
  const handleBid = async () => {
    if (Number(bidAmount) <= highestBid) {
      toast.error("Your bid must be higher than the current highest bid.");
      return;
    }

    try {
      await axios.post(`${API_URL}/bids/placeBid`, {
        product_id: product.id,
        buyer_id: user.id,
        amount: bidAmount,
      });

      toast.success("Bid placed successfully!");
      setHighestBid(Number(bidAmount));
      setBidAmount("");
    } catch (err) {
      console.error(err);
      toast.error(
        "Bidding failed: " + (err.response?.data?.message || err.message)
      );
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
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-semibold text-green-800">
            Product Details
          </h2>
          <button
            onClick={() => navigate(-1)}
            className="text-sm bg-gray-100 border border-gray-300 text-gray-700 px-4 py-1 rounded hover:bg-gray-200 transition"
          >
            &larr; Back
          </button>
        </div>
        <div className="sm:col-span-2">
          <p className="text-sm text-gray-500 uppercase mb-1">⏳ Time Left</p>
          <p className="text-base font-semibold text-red-600">{countdown}</p>
        </div>

        <img
          src={`${API_URL}/products/image/${id}`}
          alt={product.name}
          onError={(e) => (e.target.src = "/placeholder.jpg")}
          className="w-full h-64 object-cover rounded-lg border"
        />

        <div className="space-y-5 text-gray-700 bg-gray-50 border rounded-xl p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 uppercase mb-1">Name</p>
              <p className="text-base font-semibold">{product.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase mb-1">Category</p>
              <p className="text-base font-semibold">{product.category}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase mb-1">Price</p>
              <p className="text-base font-semibold">RWF {product.price}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase mb-1">
                Expiry Date
              </p>
              <p className="text-base font-semibold">
                {product.expiry_date?.split("T")[0]}
              </p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-sm text-gray-500 uppercase mb-1">
                Description
              </p>
              <p className="text-base">{product.description}</p>
            </div>
          </div>

          {isBuyer && (
            <div className="mt-6 space-y-4 bg-green-50 p-4 rounded-lg border border-green-200">
              {biddingEnded ? (
                <p className="text-red-600 text-sm font-medium">
                  ❌ Bidding time is over.
                </p>
              ) : !hasPaidBidFees ? (
                <button
                  onClick={() => {
                    toast.info("Redirecting to MTN payment...");
                    setTimeout(() => {
                      setHasPaidBidFees(true);
                      toast.success("Bidding fee paid!");
                    }, 1500);
                  }}
                  className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
                >
                  Pay Bidding Fee
                </button>
              ) : (
                <>
                  <p className="text-sm text-gray-700 font-medium">
                    💰 Current Highest Bid:{" "}
                    <span className="text-green-700 font-bold">
                      RWF {highestBid}
                    </span>
                  </p>
                  <input
                    type="number"
                    placeholder="Enter your bid"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="w-full px-3 py-2 border rounded text-sm"
                  />
                  <button
                    onClick={handleBid}
                    disabled={Number(bidAmount) <= highestBid}
                    className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 transition disabled:opacity-50"
                  >
                    Submit Bid
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
