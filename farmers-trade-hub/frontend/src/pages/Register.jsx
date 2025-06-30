import React, { useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaMapMarkerAlt,
  FaSpinner,
} from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_URL } from "../utils";

export default function RegisterModal() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "Farmer",
      phone: "",
      location: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await axios.post(`${API_URL}/users/register`, data);
      toast.success("Registration successful!");
      reset();
    } catch (error) {
      toast.error(
        error.response?.data?.message || `Registration failed: ${error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-green-100 to-green-300 bg-opacity-40 flex justify-center items-center px-4 z-50">
      <ToastContainer />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 md:p-8 relative"
      >
        <h2 className="text-xl font-larger  text-green-900 pb-6">Register</h2>

        {[
          {
            name: "name",
            icon: FaUser,
            type: "text",
            placeholder: "Name",
          },
          {
            name: "email",
            icon: FaEnvelope,
            type: "email",
            placeholder: "Email",
          },
          {
            name: "password",
            icon: FaLock,
            type: "password",
            placeholder: "Password",
          },
          {
            name: "phone",
            icon: FaPhone,
            type: "tel",
            placeholder: "Phone",
          },
          {
            name: "location",
            icon: FaMapMarkerAlt,
            type: "text",
            placeholder: "Location",
          },
        ].map(({ name, icon: Icon, type, placeholder }) => (
          <div key={name} className="mb-6 relative h-12">
            {" "}
            {/* Set fixed height */}
            <div
              className={`absolute inset-y-0 left-2 flex items-center px-1 ${
                errors[name] ? "text-red-900" : "text-gray-600"
              }`}
            >
              <Icon className="text-base" />
            </div>
            <input
              type={type}
              placeholder={placeholder}
              {...register(name, {
                required: `${placeholder} is required`,
                ...(name === "email" && {
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Invalid email format",
                  },
                }),
                ...(name === "password" && {
                  minLength: {
                    value: 4,
                    message: "Password must be at least 4 characters",
                  },
                }),

                ...(name === "phone" && {
                  pattern: {
                    value: /^(\+25)?07[0-9]{8}$/,
                    message: "Enter a valid phone number",
                  },
                }),
              })}
              className={`h-10 w-full pl-10 pr-3 text-sm font-normal border rounded-md
                focus:outline-none focus:ring-2
                text-gray-800 placeholder-gray-400 placeholder:font-normal
                ${
                  errors[name]
                    ? "border-red-500 focus:ring-red-400"
                    : "border-gray-300 focus:ring-blue-400"
                }`}
            />
            {errors[name] && (
              <p className="text-red-500 text-xs absolute -bottom-4 left-0">
                {errors[name].message}
              </p>
            )}
          </div>
        ))}

        {/* Role Selector */}
        <div className="mb-5">
          <select
            {...register("role", { required: "Role is required" })}
            className={`w-full py-2.5 pl-3 pr-8 border rounded-md text-sm focus:outline-none focus:ring-2
              text-gray-800 
              ${
                errors.role
                  ? "border-red-500 focus:ring-red-400"
                  : "border-gray-300 focus:ring-blue-400"
              }`}
          >
            <option value="Farmer">Farmer</option>
            <option value="Buyer">Buyer</option>
          </select>
          {errors.role && (
            <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>
          )}
          <Link
            to={"/login"}
            className="text-gray-600 text-sm  hover:underline hover:text-blue-900"
          >
            Login instead?
          </Link>
        </div>

        {/* Buttons */}
        <div className="flex flex-col md:flex-row md:space-x-3 space-y-3 md:space-y-0">
          <button
            type="submit"
            disabled={loading}
            className="flex justify-center items-center bg-green-900 text-white w-full py-2.5 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 text-sm"
          >
            {loading && (
              <FaSpinner className="animate-spin mr-2 text-white text-sm" />
            )}
            {loading ? "Registering..." : "Register"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-full py-2.5 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors text-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
