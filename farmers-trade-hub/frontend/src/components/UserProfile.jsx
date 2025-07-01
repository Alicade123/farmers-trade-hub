// src/components/UserProfile.jsx
import React from "react";

export default function UserProfile({ user }) {
  if (!user)
    return (
      <div className="text-center py-10 text-gray-600">Loading profile...</div>
    );

  return (
    <div className="bg-white p-6 rounded shadow-md w-full max-w-2xl mx-auto mt-6">
      <h2 className="text-3xl font-bold mb-4 text-green-700">
        👤 Welcome, {user.name}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left text-sm">
        <div>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Phone:</strong> {user.phone}
          </p>
          <p>
            <strong>Location:</strong> {user.location}
          </p>
        </div>
        <div>
          <p>
            <strong>Role:</strong> {user.role}
          </p>
          <p>
            <strong>Account Created:</strong>{" "}
            {new Date(user.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
