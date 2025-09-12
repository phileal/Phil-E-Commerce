import { Link, Routes, Route, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./App.css";
import "./index.css";
import AdminLogin from "./Components/AdminLogin/AdminLogin.jsx";
import Register from "./Components/Register/Register.jsx";
import AdminDashboard from "./Components/AdminDashboard/AdminDashboard.jsx";
import AddProduct from "./Components/AddProduct/AddProduct.jsx";
import ViewProducts from "./Components/ViewProducts/ViewProducts.jsx";
import PendingOrders from "./Components/PendingOrders/PendingOrders.jsx";
import CompletedOrders from "./Components/CompleteOrder/CompleteOrders.jsx";
import Menu from "./Components/Menu/Menu.jsx";
import MyOrders from "./Components/MyOrders/MyOrders.jsx";
import ForgotPassword from "./Components/ForgotPassword/ForgotPassword.jsx";
import CustomerReviews from "./Components/CustomerReviews/CustomerReviews.jsx";
import customerImg from "./assets/perfect customer istockphoto.com.jpeg";

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const customers = JSON.parse(localStorage.getItem("customers")) || [];

  const handleLogin = (e) => {
    e.preventDefault();

    const found = customers.find(
      (c) => c.email === email && c.password === password
    );

    if (found) {
      localStorage.setItem("currentCustomer", JSON.stringify(found));

      let activeUsers = JSON.parse(localStorage.getItem("activeUsers")) || [];
      if (!activeUsers.some((u) => u.email === found.email)) {
        activeUsers.push({
          id: found.id || Date.now(),
          name: found.name || "Customer",
          email: found.email,
          role: "customer",
          isActive: true,
        });
      }
      localStorage.setItem("activeUsers", JSON.stringify(activeUsers));

      alert("Login successful! Welcome " + found.name);
      navigate("/menu");
    } else {
      alert("Invalid login details!");
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen">
      <Routes>
        {/* ✅ Home Page with Customer Login */}
        <Route
          path="/"
          element={
            <div
              className="flex items-center justify-center min-h-screen bg-cover bg-center"
              style={{ backgroundImage: `url(${customerImg})` }}
            >
              {/* ✅ Responsive Transparent Login Box */}
              <div className="bg-opacity-80 backdrop-blur-md p-8 sm:p-10 rounded-xl w-full max-w-sm text-gray-200 shadow-lg mx-4 transform transition duration-300 hover:scale-105">
                <h2 className="text-3xl sm:text-4xl font-extrabold mb-8 text-blue-700 text-center">
                  <em>Customer Login</em>
                </h2>

                <form onSubmit={handleLogin} className="space-y-5">
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-12 p-4 rounded-xl bg-gray-700 bg-opacity-70 text-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                    required
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-12 p-4 rounded-xl bg-gray-700 bg-opacity-70 text-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full h-12 bg-blue-500 hover:bg-blue-600 rounded-xl font-bold text-lg text-white transition"
                  >
                    Login
                  </button>
                </form>

                {/* ✅ Link to Forgot Password Page */}
                <p className="mt-4 text-center text-blue-600 text-lg cursor-pointer hover:underline">
                  <Link to="/ForgotPassword">Forgot Password?</Link>
                </p>

                <p className="mt-2 text-center text-lg">
                  Don&apos;t have an account?{" "}
                  <Link
                    to="/register"
                    className="text-blue-600 hover:underline font-bold"
                  >
                    <em>Sign Up</em>
                  </Link>
                </p>

                <p className="mt-2 text-center text-lg">
                  Or Sign in as{" "}
                  <Link
                    to="/AdminLogin"
                    className="text-blue-600 hover:underline font-bold"
                  >
                    <em>Admin</em>
                  </Link>
                </p>
              </div>
            </div>
          }
        />

        {/* ✅ Other Routes */}
        <Route path="/AdminLogin" element={<AdminLogin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/AdminDashboard" element={<AdminDashboard />} />
        <Route path="/AddProduct" element={<AddProduct />} />
        <Route path="/ViewProducts" element={<ViewProducts />} />
        <Route path="/PendingOrders" element={<PendingOrders />} />
        <Route path="/CompleteOrders" element={<CompletedOrders />} />
        <Route path="/Menu" element={<Menu />} />
        <Route path="/MyOrders" element={<MyOrders />} />
        <Route path="/ForgotPassword" element={<ForgotPassword />} />
         <Route path="/CustomerReviews" element={<CustomerReviews />} />
      </Routes>
    </div>
  );
}

