import { Link, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
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
import ProtectedRoute from "./Components/ProtectedRoute.jsx";
import AdminProtectedRoute from "./Components/AdminProtectedRoute.jsx";
import customerImg from "./assets/perfect customer istockphoto.com.jpeg";
import loading from "./assets/45.svg"



// ✅ GLOBAL LOADER + NETWORK STATUS + ROUTE LOADER
function GlobalNetworkAndLoader({ children }) {
  const [firstLoad, setFirstLoad] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showNetworkBar, setShowNetworkBar] = useState(false);
  const [routeLoading, setRouteLoading] = useState(false);
  const location = useLocation();



  // First load
  useEffect(() => {
    const timer = setTimeout(() => setFirstLoad(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Route change loader
  // Route change loader (skip first mount)
  const firstRouteChange = useRef(true);
  useEffect(() => {
    if (firstRouteChange.current) {
      firstRouteChange.current = false;
      return;
    }

    setRouteLoading(true);
    const timer = setTimeout(() => setRouteLoading(false), 2000);
    return () => clearTimeout(timer);
  }, [location]);


  // Handle online/offline
  useEffect(() => {
    const goOnline = () => {
      setIsOnline(true);
      setShowNetworkBar(true);
      // hide after 4 sec when online
      setTimeout(() => setShowNetworkBar(false), 4000);
    };

    const goOffline = () => {
      setIsOnline(false);
      setShowNetworkBar(true); // stay visible when offline
    };

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    if (!navigator.onLine) {
      setIsOnline(false);
      setShowNetworkBar(true);
    }

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  if (firstLoad) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <img src={loading} alt="Loading..." className="w-14 h-14 animate-spin" />
      </div>
    );
  }

  // ✅ If offline → hide entire app and only show message
  if (!isOnline) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-[99999]">
        <p className="text-red-500 text-2xl font-bold mb-2">❌ You are Offline</p>
        <p className="text-gray-600">Please check your internet connection</p>
      </div>
    );
  }

  return (
    <>
      {/* Overlay loader */}
      {!firstLoad && routeLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white z-[9999]">
          <img src={loading} alt="Loading..." className="w-14 h-14 animate-spin" />
        </div>
      )}



      {/* Network Toast */}
      {showNetworkBar && (
        <div
          className={`fixed top-0 left-0 w-full text-center text-white py-4 text-xl z-[9999] transition-all ${isOnline ? "bg-green-500" : "bg-red-500"
            }`}
        >
          {isOnline ? "✅ You are Online" : "❌ You are Offline"}
        </div>
      )}

      {/* Only render children if online */}
      {isOnline && children}
    </>
  );
}




export default function App() {
  // your login logic stays unchanged
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const customers = JSON.parse(localStorage.getItem("customers")) || [];

  // ✅ ADD THIS (toast state)
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // ✅ ADD THIS (function to trigger toast)
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

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

      showToast("Login successful! Welcome " + found.name, "success");

      // ✅ wait 3s before navigating
      setTimeout(() => navigate("/Menu"), 3000);
    } else {
      showToast("Invalid login details!", "error");
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen">

      {toast.show && (
        <div className={`fixed top-5 right-5 z-50 px-6 py-3 rounded-xl shadow-lg text-white backdrop-blur-md bg-gradient-to-r ${toast.type === "success"
          ? "from-green-400 to-green-600"
          : "from-red-400 to-red-600"
          }`}>
          {toast.message}
        </div>
      )}


      {/* ✅ GLOBAL OVERLAY INSERTED HERE */}
      <GlobalNetworkAndLoader>
        <Routes>
          {/* ✅ Home Page / Customer Login */}
          <Route
            path="/"
            element={
              <div
                className="flex items-center justify-center min-h-screen bg-cover bg-center"
                style={{ backgroundImage: `url(${customerImg})` }}
              >
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

          {/* ✅ Non-Protected Routes */}
          <Route path="/AdminLogin" element={<AdminLogin />} />
          <Route path="/register" element={<Register />} />
          <Route path="/ForgotPassword" element={<ForgotPassword />} />

          {/* ✅ Admin Protected Routes */}
          <Route
            path="/AdminDashboard"
            element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/AddProduct"
            element={
              <AdminProtectedRoute>
                <AddProduct />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/ViewProducts"
            element={
              <AdminProtectedRoute>
                <ViewProducts />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/PendingOrders"
            element={
              <AdminProtectedRoute>
                <PendingOrders />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/CompleteOrders"
            element={
              <AdminProtectedRoute>
                <CompletedOrders />
              </AdminProtectedRoute>
            }
          />

          {/* ✅ Customer Protected Routes */}
          <Route
            path="/Menu"
            element={
              <ProtectedRoute>
                <Menu />
              </ProtectedRoute>
            }
          />
          <Route
            path="/MyOrders"
            element={
              <ProtectedRoute>
                <MyOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/CustomerReviews"
            element={
              <ProtectedRoute>
                <CustomerReviews />
              </ProtectedRoute>
            }
          />
        </Routes>
      </GlobalNetworkAndLoader>
    </div>
  );
}
