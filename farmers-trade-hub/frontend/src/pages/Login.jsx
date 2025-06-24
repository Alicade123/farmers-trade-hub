import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { FaSpinner, FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { API_URL } from "../utils";
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post(`${API_URL}/login`, { email, password });
      toast.success("Login successful");

      setEmail("");
      setPassword("");
    } catch (error) {
      toast.error(
        error.response?.data?.message || `Login failed: ${error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 px-4">
      <ToastContainer />
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 md:p-8 rounded-lg shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">
          Login
        </h2>

        <input
          type="email"
          value={email}
          placeholder="Email"
          className="w-full mb-4 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* Password input with toggle */}
        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            placeholder="Password"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {/* Toggle icon */}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            aria-label="Toggle password visibility"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        {/* Forgot password link */}
        <div className="mb-6 text-right">
          <a href="#" className="text-gray-600 text-sm  hover:underline">
            Forgot password?
          </a>
        </div>

        {/* Buttons container - responsive layout */}
        <div className="flex flex-col md:flex-row md:space-x-3 space-y-3 md:space-y-0">
          {/* Submit button with spinner */}
          <button
            type="submit"
            disabled={loading}
            className="flex justify-center items-center bg-blue-600 text-white w-full py-2.5 rounded hover:bg-green-700 transition-colors disabled:opacity-50 text-sm"
          >
            {loading && (
              <FaSpinner className="animate-spin mr-2 text-white text-sm" />
            )}
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* Cancel button */}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-full py-2.5 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors text-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
