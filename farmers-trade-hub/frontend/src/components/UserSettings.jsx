import { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { FaUserEdit, FaLock, FaImage, FaSpinner } from "react-icons/fa";
import { API_URL } from "../utils";
import LocationPicker from "./LocationPicker";
import { useRef } from "react";

export default function UserSettings({ user, onUpdate }) {
  const [activeTab, setActiveTab] = useState("info");
  const geocodeTimer = useRef(null);
  const [formData, setFormData] = useState({
    name: user.name,
    phone: user.phone,
    location: user.location,
    coords: user.coords || null, // { lat, lng }
  });
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ------------- handler ------------- */
  const handleCoordsChange = (coords) => {
    // optimistic update (sets marker immediately)
    setFormData((f) => ({ ...f, coords }));

    // clear previous timer
    clearTimeout(geocodeTimer.current);

    // wait 400 ms, then reverse‑geocode
    geocodeTimer.current = setTimeout(async () => {
      try {
        const r = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lng}&format=json`
        );
        const data = await r.json();
        const address = data.display_name || "";
        setFormData((f) => ({ ...f, location: address }));
      } catch {
        console.log("Reverse‑geocode failed");
      }
    }, 400);
  };

  async function reverseGeocode({ lat, lng }) {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
    );
    const data = await r.json();
    return data.display_name; // human‑readable address
  }

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        location: formData.location,
        lat: formData.coords?.lat,
        lng: formData.coords?.lng,
      };
      const { data } = await axios.put(`${API_URL}/users/${user.id}`, payload);
      onUpdate?.(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success("Profile info updated!");
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`${API_URL}/users/${user.id}/password`, {
        oldPassword,
        newPassword,
      });
      setOldPassword("");
      setNewPassword("");
      toast.success("Password changed!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async () => {
    if (!profileImage) return toast.error("Choose an image first.");
    const fd = new FormData();
    fd.append("profile_img", profileImage);
    setLoading(true);
    try {
      const { data } = await axios.put(
        `${API_URL}/users/${user.id}/profile-img`,
        fd,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      onUpdate?.(data.user); // refresh parent state
      localStorage.setItem("user", JSON.stringify(data.user)); // keep in storage
      toast.success("Profile image updated!");
    } catch (err) {
      toast.error("Image upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-6 bg-white rounded-xl shadow-lg overflow-hidden">
      <ToastContainer />

      {/* Tab Navigation */}
      <nav className="flex">
        {[
          { id: "info", label: "Edit Info", icon: <FaUserEdit /> },
          { id: "password", label: "Edit Pas", icon: <FaLock /> },
          { id: "image", label: "Profile ", icon: <FaImage /> },
        ].map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition duration-200
              ${
                activeTab === id
                  ? "bg-green-700 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
          >
            {icon}
            {label}
          </button>
        ))}
      </nav>

      {/* Tab Content */}
      <div className="p-6 space-y-6">
        {activeTab === "info" && (
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="  gap-4 sm:grid-cols-2">
              <div className="grid gap-4 sm:grid-cols-2 py-4">
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  required
                  className="input"
                />
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone"
                  required
                  className="input"
                />
              </div>

              <input
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Location"
                required
                readOnly={!!formData.coords}
                className="input sm:col-span-2"
              />

              <div className="">
                <LocationPicker
                  value={formData.coords}
                  onChange={handleCoordsChange}
                />
                {formData.coords && (
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((f) => ({ ...f, coords: null, location: "" }))
                    }
                    className="text-xs text-blue-600 underline"
                  >
                    Clear & pick location again
                  </button>
                )}
              </div>
            </div>
            <button
              type="submit"
              className="btn-green w-full sm:w-auto"
              disabled={loading}
            >
              {loading && <FaSpinner className="animate-spin mr-2" />}
              {loading ? "Saving..." : "Save Info"}
            </button>
          </form>
        )}

        {activeTab === "password" && (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Old Password"
              required
              className="input"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Password"
              required
              className="input"
            />
            <button
              type="submit"
              className="btn-green w-full sm:w-auto"
              disabled={loading}
            >
              {loading && <FaSpinner className="animate-spin mr-2" />}
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}

        {activeTab === "image" && (
          <div className="space-y-6">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-2">
              <img
                src={
                  preview
                    ? preview
                    : user.profile_img
                    ? `data:${user.profile_img_mime || "image/png"};base64,${
                        user.profile_img
                      }`
                    : "/placeholder.jpg"
                }
                alt="Current profile"
                className="w-32 h-32 rounded-full object-cover border-2 border-green-600 shadow-sm"
              />
              <p className="text-xs text-gray-500">
                {preview
                  ? "New preview — save to apply"
                  : "Current profile photo"}
              </p>
            </div>

            {/* File picker */}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;
                setProfileImage(file);
                setPreview(URL.createObjectURL(file));
              }}
              className="input-file"
            />

            {/* Upload button */}
            <button
              onClick={handleImageUpload}
              className="btn-green w-full sm:w-auto"
              disabled={loading}
            >
              {loading && <FaSpinner className="animate-spin mr-2" />}
              {loading ? "Uploading…" : "Upload Image"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
