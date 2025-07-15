// src/components/UserProfile.jsx
import React from "react";

export default function UserProfile({ user }) {
  if (!user)
    return (
      <div className="text-center py-10 text-gray-600">Loading profile...</div>
    );

  return (
    <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-3xl mx-auto mt-6">
      <h2 className="text-3xl font-bold mb-6 text-green-700 text-center">
        👤 Welcome, {user.name}
      </h2>

      <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
        {/* Profile Image */}
        <div className="flex-shrink-0">
          <img
            src={
              user.profile_img
                ? `data:image/png;base64,${user.profile_img}`
                : "/placeholder.jpg"
            }
            alt="Profile"
            className="w-40 h-40 rounded-full object-cover border-4 border-green-600 shadow-sm"
          />
        </div>

        {/* Info Grid */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <p className="mb-2">
              <strong>Name:</strong> {user.name}
            </p>
            <p className="mb-2">
              <strong>Email:</strong> {user.email}
            </p>
            <p className="mb-2">
              <strong>Phone:</strong> {user.phone}
            </p>
            <p className="mb-2">
              <strong>Location:</strong> {user.location}
            </p>
          </div>
          <div>
            <p className="mb-2">
              <strong>Role:</strong> {user.role}
            </p>
            <p className="mb-2">
              <strong>Account Created:</strong>{" "}
              {new Date(user.created_at).toLocaleDateString()}
            </p>
            {user.lat && user.lng && (
              <p className="mb-2">
                <strong>Coordinates:</strong>{" "}
                <span className="text-gray-500">
                  ({user.lat.toFixed(5)}, {user.lng.toFixed(5)})
                </span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
