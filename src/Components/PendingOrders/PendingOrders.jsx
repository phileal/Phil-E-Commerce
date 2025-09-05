import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";

export default function PendingOrders() {
  const [orders, setOrders] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ordersMenuOpen, setOrdersMenuOpen] = useState(true); // Orders submenu
  const sidebarRef = useRef(null);

  useEffect(() => {
    const storedOrders = JSON.parse(localStorage.getItem("shopsOrders")) || [];
    setOrders(storedOrders);
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

  const updateOrders = (newOrders) => {
    setOrders(newOrders);
    localStorage.setItem("shopsOrders", JSON.stringify(newOrders));
  };

  const completeOrder = (index) => {
    const completed = JSON.parse(localStorage.getItem("completedOrders")) || [];
    completed.push(orders[index]);

    const updatedOrders = [...orders];
    updatedOrders.splice(index, 1);

    localStorage.setItem("completedOrders", JSON.stringify(completed));
    updateOrders(updatedOrders);
  };

  const cancelOrder = (index) => {
    const updatedOrders = [...orders];
    updatedOrders[index].canceled = true;

    // Store in canceledOrders
    const canceledOrders = JSON.parse(localStorage.getItem("canceledOrders")) || [];
    canceledOrders.push(updatedOrders[index]);
    localStorage.setItem("canceledOrders", JSON.stringify(canceledOrders));

    updateOrders(updatedOrders);
  };

  const verifyPayment = (index) => {
    const updatedOrders = [...orders];
    updatedOrders[index].paymentVerified = true;
    updateOrders(updatedOrders);
    alert("Payment verified!");
  };

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
                  className="block py-2 px-3 rounded-lg hover:bg-gray-700"
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

        <h1 className="text-2xl font-bold mb-6 text-blue-400">Pending Orders</h1>

        {orders.length === 0 && <p className="text-gray-400">No pending orders.</p>}

        <div className="space-y-4">
          {orders.map((order, index) => (
            <div
              key={index}
              className={`bg-gray-800 rounded-xl p-4 flex flex-col gap-3 md:flex-row justify-between ${
                order.canceled ? "opacity-60" : ""
              }`}
            >
              <div className="max-w-xl">
                <p className="font-bold text-lg">{order.customer || "Unnamed Customer"}</p>
                <ul className="ml-4 list-disc space-y-1">
                  {order.cart && order.cart.length > 0
                    ? order.cart.map((item, idx) => (
                        <li key={idx}>
                          {item.name} × {item.quantity} • ${(item.price * item.quantity).toFixed(2)}
                        </li>
                      ))
                    : order.name
                    ? <li>{order.name} × {order.quantity} • ${(order.price * order.quantity).toFixed(2)}</li>
                    : <li>No items found</li>}
                </ul>
                <p className="text-xs text-gray-400 mt-2">Ordered at: {order.time || "Unknown time"}</p>
                <p className="text-sm text-gray-300">Delivery Address: {order.deliveryAddress || "N/A"}</p>
                <p className="text-sm text-gray-300">Payment Method: {order.paymentMethod || order.payment || "Not specified"}</p>
                {order.payment === "transfer" && (
                  <>
                    <p className="text-sm text-gray-400">Transfer to: {order.account || "Super Admin Account"}</p>
                    {order.receipt
                      ? <p className="text-sm text-green-400 break-words">Receipt uploaded: {order.receipt}</p>
                      : <p className="text-red-400">No receipt uploaded yet</p>}
                    {order.paymentVerified
                      ? <p className="text-green-400 font-bold">Payment Verified ✅</p>
                      : !order.canceled && <p className="text-yellow-400">Awaiting Verification</p>}
                  </>
                )}
              </div>

              <div className="flex flex-col gap-2 mt-3 md:mt-0 md:ml-4">
                {!order.canceled && order.payment === "transfer" && !order.paymentVerified && (
                  <button
                    className="text-yellow-400 underline"
                    onClick={() => verifyPayment(index)}
                  >
                    Verify Payment
                  </button>
                )}
                {!order.canceled && (
                  <button
                    className="text-green-400 underline"
                    onClick={() => completeOrder(index)}
                  >
                    Complete
                  </button>
                )}
                {!order.canceled && (
                  <button
                    className="text-red-400 underline"
                    onClick={() => cancelOrder(index)}
                  >
                    Cancel
                  </button>
                )}
                {order.canceled && (
                  <span className="text-red-400 font-bold">Order Canceled ❌</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
