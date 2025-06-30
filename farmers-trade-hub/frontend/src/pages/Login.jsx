import React, { useState } from "react";
import logo from "../assets/images/logo.jpg";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import {
  FaSpinner,
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaLock,
} from "react-icons/fa";
import { Links, useNavigate, Link } from "react-router-dom";
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
      const res = await axios.post(`${API_URL}/users/login`, {
        email,
        password,
      });

      const { token, user } = res.data;
      toast.success("Login successful");

      // Store in localStorage or context
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Redirect based on role
      if (user.role === "Farmer") {
        navigate("/farmer/dashboard");
      } else if (user.role === "Buyer") {
        navigate("/buyer/dashboard");
      } else if (user.role === "Admin") {
        navigate("/admin/dashboard");
      } else {
        toast.error("Unknown user role!");
      }

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
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-green-100 to-green-300 px-4">
      <ToastContainer />
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 md:p-8 rounded-lg shadow-md w-full max-w-sm"
      >
        <h2 className="text-xl font-larger  text-green-900 pb-6">Login</h2>
        <div className="relative w-full mb-4">
          <div className="absolute inset-y-0 left-2 flex items-center text-gray-500">
            <FaEnvelope className="text-sm" />
          </div>

          <input
            type="email"
            value={email}
            placeholder="Email"
            className="w-full pl-10 pr-3 py-2 text-xs font-normal text-black border placeholder-gray-400 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Password input with toggle */}
        <div className="relative w-full mb-4">
          <div className="absolute inset-y-0 left-2 flex items-center text-gray-500">
            <FaLock className="text-sm" />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            placeholder="Password"
            className="w-full pl-10 px-3 py-2 border text-black font-normal placeholder-gray-400 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {/* Toggle icon */}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer hover:text-green-900 text-gray-500"
            aria-label="Toggle password visibility"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        {/* Forgot password link */}
        <div className="mb-6 text-right ">
          <Link
            to={"/register"}
            className="text-gray-600 text-sm  hover:underline hover:text-blue-900"
          >
            Register instead?
          </Link>
          <Link
            to={"#"}
            className="text-gray-600 text-sm  hover:underline hover:text-blue-900 pl-15"
          >
            Forgot password?
          </Link>
        </div>

        <div className="flex flex-col md:flex-row md:space-x-3 space-y-3 md:space-y-0">
          <button
            type="submit"
            disabled={loading}
            className="flex justify-center items-center bg-green-900 text-white w-full py-2.5 rounded hover:bg-green-700 transition-colors disabled:opacity-50 text-sm"
          >
            {loading && (
              <FaSpinner className="animate-spin mr-2 text-white text-sm" />
            )}
            {loading ? "Logging in..." : "Login"}
          </button>

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
