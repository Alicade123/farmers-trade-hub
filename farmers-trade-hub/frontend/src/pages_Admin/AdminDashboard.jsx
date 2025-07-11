import { lazy, useState } from "react";
import {
  FaUser,
  FaBoxOpen,
  FaTruck,
  FaMoneyBill,
  FaCog,
  FaSignOutAlt,
  FaGavel,
  FaPaperclip,
  FaUserFriends,
  FaMoneyCheck,
} from "react-icons/fa";

import MyProducts from "./MyProducts";
import UserProfile from "../components/UserProfile";
import AdminAllBids from "./AdminAllBids";
import SendPayment from "./SendPayment";
import AdminAllUsers from "./AdminAllUsers";
const TABS = {
  profile: { label: "Profile", icon: <FaUser /> },
  view: { label: "All Products", icon: <FaBoxOpen /> },
  users: { label: "All users", icon: <FaUserFriends /> },
  bids: { label: "Bids", icon: <FaGavel /> },
  delivery: { label: "Delivery", icon: <FaTruck /> },
  payload: { label: "payload", icon: <FaMoneyBill /> },
  payments: { label: "Payment History", icon: <FaMoneyCheck /> },
  report: { label: "Report", icon: <FaPaperclip /> },
  settings: { label: "Settings", icon: <FaCog /> },
};

export default function FarmerDashboard() {
  const [activeTab, setActiveTab] = useState("profile");
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="min-h-screen flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-green-800 text-white p-6 space-y-6 shadow-lg hidden md:block">
        <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>

        {/* Navigation */}
        <nav className="space-y-2">
          {Object.entries(TABS).map(([key, { label, icon }]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center w-full gap-3 py-2 px-4 rounded-lg transition-colors duration-200 ${
                activeTab === key
                  ? "bg-green-600 text-white"
                  : "hover:bg-green-700 text-gray-100"
              }`}
            >
              <span className="text-lg">{icon}</span>
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </nav>

        {/* Logout */}
        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
          }}
          className="flex items-center gap-3 py-2 px-4 mt-10 bg-red-600 hover:bg-red-700 w-full rounded-lg transition-colors duration-200"
        >
          <FaSignOutAlt className="text-lg" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </aside>

      {/* Main content area */}
      <main className="flex-1 p-6 bg-gray-100 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {activeTab === "profile" && <UserProfile user={user} />}

          {activeTab === "view" && <MyProducts />}
          {activeTab === "bids" && <AdminAllBids />}
          {activeTab === "users" && <AdminAllUsers />}
          {activeTab === "delivery" && (
            <p className="text-gray-600">Delivery status will appear here</p>
          )}
          {activeTab === "payments" && (
            <p className="text-gray-600">Payment history to be implemented</p>
          )}
          {activeTab === "report" && (
            <p className="text-gray-600">Report data coming soon</p>
          )}
          {activeTab === "settings" && (
            <p className="text-gray-600">Account settings coming soon</p>
          )}
          {activeTab === "payload" && <SendPayment />}
        </div>
      </main>
    </div>
  );
}
