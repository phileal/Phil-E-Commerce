import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import registerImg from "../../assets/register pic_unsplash.com.jpeg";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  // ✅ Toast state
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // ✅ helper to show toast
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const handleRegister = (e) => {
    e.preventDefault();

    if (password !== confirm) {
      showToast("Passwords do not match!", "error");
      return;
    }

    let customers = JSON.parse(localStorage.getItem("customers")) || [];

    if (customers.find((c) => c.email === email)) {
      showToast("This email is already registered.", "error");
      return;
    }

    const newCustomer = { name, email, password };
    customers.push(newCustomer);
    localStorage.setItem("customers", JSON.stringify(customers));

    showToast("Account created successfully! You can now login.", "success");

    setTimeout(() => navigate("/"), 3000);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">

      {/* ✅ Toast UI */}
      {toast.show && (
        <div
          className={`fixed top-5 right-5 z-50 px-6 py-3 rounded-xl shadow-lg text-white backdrop-blur-md bg-gradient-to-r ${
            toast.type === "success"
              ? "from-green-400 to-green-600"
              : "from-red-400 to-red-600"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Left Image Panel */}
      <div
        className="md:w-1/2 h-64 md:h-auto bg-cover bg-center"
        style={{ backgroundImage: `url(${registerImg})` }}
      ></div>

      {/* Right Form Panel */}
      <div className="md:w-1/2 flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-2xl w-full max-w-md">
          <h2 className="text-3xl font-extrabold text-center mb-8 text-gray-800">
            Create an Account
          </h2>

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-12 border border-gray-300 rounded-xl pl-4 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 border border-gray-300 rounded-xl pl-4 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 border border-gray-300 rounded-xl pl-4 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm your password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full h-12 border border-gray-300 rounded-xl pl-4 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full h-12 bg-blue-500 hover:bg-blue-600 rounded-xl font-bold text-white text-lg transition"
            >
              Register
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/" className="text-blue-500 font-medium underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
