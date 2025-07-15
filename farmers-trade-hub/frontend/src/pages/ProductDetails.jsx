import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../utils";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BarLoader, BeatLoader } from "react-spinners";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${API_URL}/products/${id}`);
        setProduct(res.data);
        setForm(res.data);
      } catch (err) {
        setError("Unable to fetch product.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    if (!form.name || !form.description || !form.price || !form.expiry_date) {
      toast.error("All fields are required.");
      return;
    }

    try {
      setUpdating(true);
      const { image, newImage, ...payload } = form; // exclude old image + new one temporarily

      // Step 1: Update text fields
      await axios.put(`${API_URL}/products/${id}`, payload);

      // Step 2: If image file was selected, upload it
      if (newImage) {
        const formData = new FormData();
        formData.append("image", newImage);
        await axios.put(`${API_URL}/products/${id}/image`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      toast.success("Product updated successfully!");
      setEditMode(false);
      setProduct({ ...product, ...payload });
    } catch (err) {
      console.error("Update failed:", err);
      toast.error("Update failed. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 space-y-4">
        {/* <BarLoader color="#16a34a" width={150} /> */}
        <BeatLoader color="#16a34a" size={14} />
        <p className="text-gray-600 text-lg font-medium">
          Loading product details...
        </p>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-10 text-red-600">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <ToastContainer />
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-semibold text-green-800">
            Product Details
          </h2>
          <button
            onClick={() => navigate(-1)}
            className="text-sm bg-gray-100 border border-gray-300 text-gray-700 px-4 py-1 rounded hover:bg-gray-200 transition-all"
          >
            &larr; Back
          </button>
        </div>

        <img
          src={`${API_URL}/products/image/${id}`}
          alt={product.name}
          onError={(e) => {
            e.target.src = "/placeholder.jpg";
          }}
          className="w-full h-64 object-cover rounded-lg border border-gray-200"
        />

        {editMode ? (
          <div className="space-y-4">
            <input
              className="w-full border p-2 rounded  h-10 px-3 text-sm font-normal 
     focus:outline-none focus:ring-2 text-gray-800 placeholder-black"
              value={form.name}
              onChange={handleChange}
              name="name"
              placeholder="Product Name"
            />
            <input
              className="w-full border p-2 rounded h-10 px-3 text-sm font-normal focus:outline-none focus:ring-2 text-gray-800 placeholder-black"
              value={form.category}
              onChange={handleChange}
              name="category"
              placeholder="Category"
            />
            <textarea
              className="w-full border p-2 rounded  h-20 px-3 text-sm font-normal 
     focus:outline-none focus:ring-2 text-gray-800 placeholder-black"
              value={form.description}
              onChange={handleChange}
              name="description"
              placeholder="Description"
              rows={2}
            />
            <input
              className="w-full border p-2 rounded  h-10 px-3 text-sm font-normal 
     focus:outline-none focus:ring-2 text-gray-800 placeholder-black"
              value={form.price}
              onChange={handleChange}
              name="price"
              type="number"
              placeholder="Price"
            />
            <input
              className="w-full border p-2 rounded  h-10 px-3 text-sm font-normal 
     focus:outline-none focus:ring-2 text-gray-800 placeholder-black"
              value={form.expiry_date?.split("T")[0]}
              onChange={handleChange}
              name="expiry_date"
              type="date"
              placeholder="Expiry Date"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setForm({ ...form, newImage: e.target.files[0] })
              }
              className="input-file"
            />

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={handleUpdate}
                disabled={updating}
                className="flex justify-center items-center bg-green-900 text-white px-10 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 text-sm"
              >
                {updating ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => {
                  setForm(product);
                  setEditMode(false);
                }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5 text-gray-700 bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-sm transition-all">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Inline DetailItem component usage */}
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Name
                </p>
                <p className="text-base font-semibold text-gray-800">
                  {product.name}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Category
                </p>
                <p className="text-base font-semibold text-gray-800">
                  {product.category}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Price
                </p>
                <p className="text-base font-semibold text-gray-800">
                  RWF {product.price}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Expiry Date
                </p>
                <p className="text-base font-semibold text-gray-800">
                  {product.expiry_date?.split("T")[0]}
                </p>
              </div>

              <div className="sm:col-span-2">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Description
                </p>
                <p className="text-base font-semibold text-gray-800">
                  {product.description}
                </p>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={() => setEditMode(true)}
                className=" justify-center items-center bg-green-900 text-white px-10 py-2.5 rounded hover:bg-green-700 transition-colors disabled:opacity-50 text-sm"
              >
                Edit Product
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
