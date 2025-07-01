import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { API_URL } from "../utils";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaSpinner } from "react-icons/fa";

export default function PostProductForm() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      farmer_id: user?.id || "",
      name: "",
      category: "",
      description: "",
      quantity: "",
      price: "",
      expiry_date: "",
    },
  });

  const onSubmit = async (data) => {
    if (!image) {
      toast.error("Please upload an image.");
      return;
    }

    const formData = new FormData();
    for (const key in data) {
      formData.append(key, data[key]);
    }
    formData.append("image", image);

    try {
      setLoading(true);
      await axios.post(`${API_URL}/products/post`, formData);
      toast.success("Product posted successfully!");
      reset();
      setImage(null);
      setPreview(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to post product");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `h-10 w-full px-3 text-sm font-normal border rounded-md
     focus:outline-none focus:ring-2 text-gray-800 placeholder-black
     ${
       errors[field]
         ? "border-red-500 focus:ring-red-400"
         : "border-gray-300 focus:ring-blue-400"
     }`;

  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow rounded">
      <ToastContainer />
      <h2 className="text-2xl font-bold mb-4 text-center text-green-700">
        Post New Product
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input
          {...register("name", { required: "Product name is required" })}
          placeholder="Product Name"
          className={inputClass("name")}
        />
        {errors.name && (
          <p className="text-sm text-red-600">{errors.name.message}</p>
        )}

        <input
          {...register("category", { required: "Category is required" })}
          placeholder="Category"
          className={inputClass("category")}
        />
        {errors.category && (
          <p className="text-sm text-red-600">{errors.category.message}</p>
        )}

        <textarea
          {...register("description", { required: "Description is required" })}
          placeholder="Description"
          className="w-full border p-2 rounded  h-30 px-3 text-sm font-normal 
     focus:outline-none focus:ring-2 text-gray-800 placeholder-black"
        />
        {errors.description && (
          <p className="text-sm text-red-600 border-red-500 focus:ring-red-400">
            {errors.description.message}
          </p>
        )}

        <input
          type="number"
          {...register("quantity", {
            required: "Quantity is required",
            min: { value: 1, message: "Minimum quantity is 1" },
          })}
          placeholder="Quantity (kg, pcs...)"
          className={inputClass("quantity")}
        />
        {errors.quantity && (
          <p className="text-sm text-red-600">{errors.quantity.message}</p>
        )}

        <input
          type="number"
          {...register("price", {
            required: "Price is required",
            min: { value: 1, message: "Price must be at least 1" },
          })}
          placeholder="Price (RWF)"
          className={inputClass("price")}
        />
        {errors.price && (
          <p className="text-sm text-red-600">{errors.price.message}</p>
        )}

        <input
          type="date"
          {...register("expiry_date", { required: "Expiry date is required" })}
          className="w-full border p-2 rounded  h-10 px-3 text-sm font-normal 
     focus:outline-none focus:ring-2 text-gray-800 placeholder-gray-400"
        />
        {errors.expiry_date && (
          <p className="text-sm text-red-600">{errors.expiry_date.message}</p>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files[0];
            setImage(file);
            setPreview(URL.createObjectURL(file));
          }}
          className="w-full  p-2 rounded `h-10 px-3 text-sm font-normal border focus:outline-none focus:ring-2 text-gray-800 placeholder-gray-400"
        />

        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="w-32 h-32 object-cover mt-2 rounded"
          />
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex justify-center items-center bg-green-900 text-white w-full py-2.5 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 text-sm"
        >
          {loading && <FaSpinner className="animate-spin mr-2" />}
          {loading ? "Posting..." : "Post Product"}
        </button>
      </form>
    </div>
  );
}
