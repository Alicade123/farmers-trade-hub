import { useState } from "react";
import axios from "axios";
import { API_URL } from "../utils";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function SendPayment() {
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [sending, setSending] = useState(false);

  const handleDisbursement = async () => {
    if (!phone || !amount) {
      toast.error("Phone number and amount are required.");
      return;
    }

    setSending(true);
    try {
      const res = await axios.post(`${API_URL}/payments/send`, {
        phone,
        amount,
      });

      toast.success(`💸 Sent! Ref: ${res.data.referenceId}`);
      setPhone("");
      setAmount("");
    } catch (err) {
      toast.error(
        "❌ Failed to send payment: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <ToastContainer />
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-xl font-bold mb-6 text-green-700">
          MoMo Disbursement
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              📱 Phone Number (MTN)
            </label>
            <input
              type="text"
              placeholder="e.g. 25078xxxxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              💰 Amount (RWF)
            </label>
            <input
              type="number"
              placeholder="e.g. 10000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <button
            onClick={handleDisbursement}
            disabled={sending}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition disabled:opacity-50"
          >
            {sending ? "Sending..." : "Send Payment"}
          </button>
        </div>
      </div>
    </div>
  );
}
