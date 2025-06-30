// src/pages/FarmerDashboard.jsx
import { useState } from "react";
import PostProductForm from "./PostProductForm";
import MyProducts from "./MyProducts";

const TABS = {
  upload: "Upload Product",
  view: "My Products",
};

export default function FarmerDashboard() {
  const [activeTab, setActiveTab] = useState("upload");

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64 bg-green-700 text-white p-5 space-y-4">
        <h1 className="text-2xl font-bold mb-6">🌾 Farmer Panel</h1>
        {Object.entries(TABS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`block w-full text-left py-2 px-3 rounded hover:bg-green-600 ${
              activeTab === key ? "bg-green-800" : ""
            }`}
          >
            {label}
          </button>
        ))}
        <button
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
          className="block w-full text-left py-2 px-3 mt-6 rounded bg-red-600 hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 bg-gray-50">
        {activeTab === "upload" && <PostProductForm />}
        {activeTab === "view" && <MyProducts />}
      </div>
    </div>
  );
}
