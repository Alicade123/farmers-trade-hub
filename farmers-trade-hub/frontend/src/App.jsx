import "./App.css";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFoundPage";
import PostProductForm from "./pages/PostProductForm";
import FarmerDashboard from "./pages/FarmerDashboard";
function App() {
  const router = createBrowserRouter([
    {
      path: "",
      element: <LandingPage />,
      errorElement: <NotFound />,
    },
    { path: "/login", element: <Login /> },
    { path: "/register", element: <Register /> },
    { path: "/products/post", element: <PostProductForm /> },
    { path: "/farmer/dashboard", element: <FarmerDashboard /> },
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
