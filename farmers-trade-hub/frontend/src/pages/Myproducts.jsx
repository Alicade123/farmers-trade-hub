// src/pages/MyProducts.jsx
import { useEffect, useState } from "react";
import axios from "../api/axios";
import { API_URL } from "../utils";
export default function MyProducts() {
  const [products, setProducts] = useState([]);
  const farmerId = 1; // Replace with real ID from auth context

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${API_URL}/products`);
        setProducts(res.data);
      } catch (err) {
        console.error("Failed to fetch products", err);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">My Products</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {products.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded shadow p-4 border border-green-200"
          >
            <h3 className="text-xl font-bold">{p.name}</h3>
            <p className="text-sm text-gray-600">{p.category}</p>
            <p>{p.description}</p>
            <p>Qty: {p.quantity}</p>
            <p>Price: RWF {p.price}</p>
            <p>Expires: {p.expiry_date?.split("T")[0]}</p>
            {/* Optional: Show image if route implemented */}
            {/* <img src={`http://localhost:5000/api/products/image/${p.id}`} alt={p.name} /> */}
          </div>
        ))}
      </div>
    </div>
  );
}
