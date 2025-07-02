import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { API_URL } from "../utils";
import { ClipLoader } from "react-spinners";

export default function MyProducts() {
  const user = JSON.parse(localStorage.getItem("user"));
  const farmerId = user?.id || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${API_URL}/products`);
        setProducts(res.data);
        setError("");
      } catch (err) {
        console.error("Failed to fetch products", err);
        setError("Failed to load your products. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (farmerId) fetchProducts();
  }, [farmerId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 space-y-4">
        <ClipLoader color="#16a34a" size={28} />
        <p className="text-gray-600 text-lg font-medium">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-600 font-semibold">
        {error}
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <h2 className="text-2xl font-semibold mb-4 text-green-700">
        All Products
      </h2>

      {products.length === 0 ? (
        <div className="text-gray-600 text-center">
          They haven't posted any products yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

// ✅ Reusable product card with blur-on-load image
function ProductCard({ product: p }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg border border-green-200 p-4 transition">
      <h3 className="text-xl font-bold text-green-800">{p.name}</h3>
      <p className="text-sm text-gray-500 mb-1">Category: {p.category}</p>
      <p className="text-sm">Quantity: {p.quantity}</p>
      <p className="text-sm">
        Price: <span className="font-medium text-green-700">RWF {p.price}</span>
      </p>
      <p className="text-sm">Expires: {p.expiry_date?.split("T")[0]}</p>

      <div className="relative w-full h-40 mt-3 overflow-hidden rounded bg-gray-100">
        <img
          src={`${API_URL}/products/image/${p.id}`}
          alt={p.name}
          onLoad={() => setImgLoaded(true)}
          onError={(e) => {
            e.target.src = "/placeholder.jpg";
            setImgError(true);
            setImgLoaded(true);
          }}
          className={`w-full h-full object-cover transition-all duration-500 ease-in-out ${
            imgLoaded ? "blur-0 opacity-100" : "blur-md opacity-60"
          }`}
        />
      </div>

      <Link to={`/products/bid/${p.id}`}>
        <button className="mt-3 bg-blue-600 text-white px-4 py-1 rounded text-sm hover:bg-blue-700">
          View details
        </button>
      </Link>
    </div>
  );
}
