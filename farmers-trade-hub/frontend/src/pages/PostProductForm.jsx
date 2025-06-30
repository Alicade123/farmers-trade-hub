import { useState } from "react";
import axios from "axios";
import { API_URL } from "../utils";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/ReactToastify.css";
export default function PostProductForm() {
  const [form, setForm] = useState({
    farmer_id: "1", // replace with actual logged-in farmer ID
    name: "",
    category: "",
    description: "",
    quantity: "",
    price: "",
    expiry_date: "",
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    for (const key in form) {
      formData.append(key, form[key]);
    }
    formData.append("image", image);

    try {
      await axios.post(`${API_URL}/products/post`, formData);
      toast.success("Product posted successfully!");
    } catch (error) {
      toast.error("Error: " + (err.response?.data?.message || "Failed"));
    }
  };
  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow rounded">
      <ToastContainer />
      <h2 className="text-2xl font-bold mb-4 text-center">Post New Product</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          name="name"
          type="text"
          onChange={handleChange}
          placeholder="Product Name"
          required
          className="w-full border p-2"
        />
        <input
          name="category"
          type="text"
          onChange={handleChange}
          placeholder="Category"
          required
          className="w-full border p-2"
        />
        <textarea
          name="description"
          onChange={handleChange}
          placeholder="Description"
          required
          className="w-full border p-2"
        />
        <input
          name="quantity"
          type="number"
          onChange={handleChange}
          placeholder="Quantity (kg, pcs...)"
          required
          className="w-full border p-2"
        />
        <input
          name="price"
          type="number"
          onChange={handleChange}
          placeholder="Price (RWF)"
          required
          className="w-full border p-2"
        />
        <input
          name="expiry_date"
          type="date"
          onChange={handleChange}
          required
          className="w-full border p-2"
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full border p-2"
        />

        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="w-32 h-32 object-cover mt-2"
          />
        )}

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Post Product
        </button>
      </form>
    </div>
  );
}
