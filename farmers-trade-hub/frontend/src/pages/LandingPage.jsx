// frontend/src/pages/LandingPage.jsx
import { Link, useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-green-100 to-green-300 px-4">
      {/* HEADER */}
      <header className="flex justify-between items-center py-4 max-w-6xl mx-auto w-full">
        <h1
          className="text-2xl md:text-3xl font-bold text-green-800 cursor-pointer"
          onClick={() => navigate("/")}
        >
          Farmers Trade Hub
        </h1>
        <nav className="flex gap-4">
          <Link
            to="/login"
            className="text-green-800 font-medium hover:underline"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="text-green-800 font-medium hover:underline"
          >
            Register
          </Link>
        </nav>
      </header>

      {/* HERO */}
      <section className="flex flex-col justify-center items-center flex-1 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-green-900 mb-4">
          Welcome to Farmers Trade Hub 🌿
        </h2>
        <p className="text-lg md:text-xl text-green-800 max-w-2xl mb-8">
          Empowering Rwandan farmers and buyers with a secure, transparent, and
          efficient digital marketplace for agriculture.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="#">
            <button className="bg-green-700 text-white px-8 py-3 rounded hover:bg-green-800 transition-colors">
              Learn More
            </button>
          </Link>
          <Link to="#">
            <button className="bg-white border border-green-700 text-green-700 px-8 py-3 rounded hover:bg-green-100 transition-colors">
              Explore
            </button>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-center py-4 text-green-800 text-sm">
        © {new Date().getFullYear()} Farmers Trade Hub — Empowering Rwandan
        Agriculture.
      </footer>
    </main>
  );
}
