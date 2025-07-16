import { useState, useEffect } from "react";
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
import UserSettings from "../components/UserSettings";
const TABS = {
  profile: { label: "Profile", icon: <FaUser /> },
  view: { label: "All Products", icon: <FaBoxOpen /> },
  users: { label: "All Users", icon: <FaUserFriends /> },
  bids: { label: "Bids", icon: <FaGavel /> },
  delivery: { label: "Delivery", icon: <FaTruck /> },
  payload: { label: "Payload", icon: <FaMoneyBill /> },
  payments: { label: "Payment History", icon: <FaMoneyCheck /> },
  report: { label: "Report", icon: <FaPaperclip /> },
  settings: { label: "Settings", icon: <FaCog /> },
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("profile");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // const user = JSON.parse(localStorage.getItem("user"));
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  }, []);

  return (
    <div className="min-h-screen flex font-sans relative">
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-green-800 text-white p-6 space-y-6 shadow-lg transform transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:relative md:translate-x-0 md:block`}
      >
        <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>

        {/* Navigation */}
        <nav className="space-y-2">
          {Object.entries(TABS).map(([key, { label, icon }]) => (
            <button
              key={key}
              onClick={() => {
                setActiveTab(key);
                setSidebarOpen(false); // Close on selection (mobile)
              }}
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

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-6 bg-gray-100 overflow-y-auto">
        {/* Hamburger Button */}
        <div className="md:hidden flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-green-800">
            Admin Dashboard
          </h2>
          <button onClick={() => setSidebarOpen(true)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-green-800"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        <div className="max-w-6xl mx-auto">
          {activeTab === "profile" && user && <UserProfile user={user} />}
          {activeTab === "view" && <MyProducts />}
          {activeTab === "users" && <AdminAllUsers />}
          {activeTab === "bids" && <AdminAllBids />}
          {activeTab === "payload" && <SendPayment />}
          {activeTab === "delivery" && (
            <p className="text-gray-600">Delivery status will appear here</p>
          )}
          {activeTab === "payments" && (
            <p className="text-gray-600">Payment history to be implemented</p>
          )}
          {activeTab === "report" && (
            <p className="text-gray-600">Report data coming soon</p>
          )}
          {activeTab === "settings" && user && (
            <UserSettings user={user} onUpdate={setUser} />
          )}
        </div>
      </main>
    </div>
  );
}
