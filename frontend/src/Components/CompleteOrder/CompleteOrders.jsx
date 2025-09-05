import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";

export default function CompletedOrders() {
  const [completedOrders, setCompletedOrders] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ordersMenuOpen, setOrdersMenuOpen] = useState(true);
  const sidebarRef = useRef(null);

  useEffect(() => {
    const storedCompleted = JSON.parse(localStorage.getItem("completedOrders")) || [];
    setCompletedOrders(storedCompleted);
  }, []);

  // Close sidebar if clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        !event.target.closest("#menuButton")
      ) {
        setSidebarOpen(false);
      }
    };
    if (sidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen]);

  const deleteCompleted = (index) => {
    const updated = [...completedOrders];
    updated.splice(index, 1);
    localStorage.setItem("completedOrders", JSON.stringify(updated));
    setCompletedOrders(updated);
  };

  const clearAllCompleted = () => {
    if (window.confirm("Are you sure you want to clear all completed orders?")) {
      localStorage.removeItem("completedOrders");
      setCompletedOrders([]);
    }
  };

  // Calculate total revenue
  const totalRevenue = completedOrders.reduce((total, order) => {
    if (order.cart && order.cart.length > 0) {
      order.cart.forEach(item => total += item.price * item.quantity);
    } else {
      total += order.price * order.quantity;
    }
    return total;
  }, 0);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-900 text-gray-200">
      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed md:static z-20 inset-y-0 left-0 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 ease-in-out w-60 bg-gray-800 p-6`}
      >
        <h2 className="text-xl font-bold text-blue-400 mb-6">Admin Panel</h2>
        <nav className="space-y-2">
          <Link
            to="/AdminDashboard"
            className="block py-2 px-3 rounded-lg hover:bg-gray-700"
          >
            Dashboard
          </Link>

          {/* Orders Menu */}
          <div>
            <button
              onClick={() => setOrdersMenuOpen(!ordersMenuOpen)}
              className="w-full text-left py-2 px-3 rounded-lg bg-gray-700"
            >
              Orders ▾
            </button>
            {ordersMenuOpen && (
              <div className="space-y-1 pl-4 mt-1">
                <Link
                  to="/PendingOrders"
                  className="block py-2 px-3 rounded-lg hover:bg-gray-700"
                >
                  Pending Orders
                </Link>
                <Link
                  to="/CompleteOrders"
                  className="block py-2 px-3 rounded-lg bg-gray-700"
                >
                  Completed Orders
                </Link>
              </div>
            )}
          </div>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 md:ml-0 ml-0">
        {/* Hamburger */}
        <button
          id="menuButton"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden mb-4 p-2 bg-gray-800 text-white rounded"
        >
          ☰ Menu
        </button>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-blue-400">Completed Orders</h1>
          <button
            onClick={clearAllCompleted}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-white text-sm"
          >
            Clear All
          </button>
        </div>

        <div className="mb-4 text-lg font-semibold text-green-400">
          Total Revenue: ${totalRevenue.toFixed(2)}
        </div>

        <div className="space-y-4">
          {completedOrders.length === 0 && <p className="text-gray-400">No completed orders.</p>}

          {completedOrders.map((order, index) => (
            <div key={index} className="bg-gray-800 rounded-xl p-4 flex flex-col gap-3">
              <div>
                <p className="font-bold text-lg">{order.customer || "Unnamed Customer"}</p>
                <ul className="ml-4 list-disc">
                  {order.cart && order.cart.length > 0
                    ? order.cart.map((item, idx) => (
                        <li key={idx}>{item.name} × {item.quantity} • ${item.price * item.quantity}</li>
                      ))
                    : order.name
                    ? <li>{order.name} × {order.quantity} • ${order.price * order.quantity}</li>
                    : <li>No items found</li>}
                </ul>
                <p className="text-xs text-gray-400 mt-2">Completed at: {order.time || "Unknown time"}</p>
                <p className="text-sm text-gray-300">Delivery Address: {order.deliveryAddress || "No address provided"}</p>
              </div>
              <div className="mt-3">
                <button
                  className="text-red-400 underline"
                  onClick={() => deleteCompleted(index)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
