import "./App.css";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFoundPage";
import PostProductForm from "./pages/PostProductForm";
import FarmerDashboard from "./pages/FarmerDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import ProductDetails from "./pages/ProductDetails";
// Dedicated for Buyers
import BuyerDashboard from "./pages-Buyer/BuyerDashboard";
import ProductDetails_Bid from "./pages-Buyer/ProductDetails_Bid";
function App() {
  const router = createBrowserRouter([
    {
      path: "",
      element: <LandingPage />,
      errorElement: <NotFound />,
    },
    { path: "/login", element: <Login /> },
    { path: "/register", element: <Register /> },
    {
      path: "/products/post",
      element: (
        <ProtectedRoute
          element={<PostProductForm />}
          allowedRoles={["Farmer"]}
        />
      ),
    },
    {
      path: "/farmer/dashboard",
      element: (
        <ProtectedRoute
          element={<FarmerDashboard />}
          allowedRoles={["Farmer"]}
        />
      ),
    },
    { path: "/products/:id", element: <ProductDetails /> },
    { path: "/buyer/dashboard", element: <BuyerDashboard /> },
    { path: "/products/bid/:id", element: <ProductDetails_Bid /> },
  ]);
  return (
    <>
      <div className="text-center text-2xl font-bold text-green-600">
        <RouterProvider router={router} />
      </div>
    </>
  );
}

export default App;
