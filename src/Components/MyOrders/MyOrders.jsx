import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const storedOrders = JSON.parse(localStorage.getItem("shopsOrders")) || [];
    setOrders(storedOrders);
  }, []);

  const cancelOrder = (index) => {
    const currentOrders = [...orders];
    const canceled = currentOrders.splice(index, 1)[0]; 
    const canceledOrders = JSON.parse(localStorage.getItem("canceledOrders")) || [];
    canceledOrders.push(canceled);
    localStorage.setItem("canceledOrders", JSON.stringify(canceledOrders));
    localStorage.setItem("shopsOrders", JSON.stringify(currentOrders));
    setOrders(currentOrders);
    alert("Order canceled successfully!");
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center md:text-left">
        My Orders
      </h1>

      <Link
        to="/Menu"
        className="inline-block mb-6 text-blue-500 hover:underline text-center md:text-left"
      >
        ← Back to Menu
      </Link>

      {orders.length === 0 && (
        <p className="text-gray-500 text-center md:text-left">You have no active orders.</p>
      )}

      <div className="flex flex-col gap-4">
        {orders.map((order, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-4 shadow flex flex-col sm:flex-row items-start sm:items-center gap-4"
          >
            <img
              src={order.image}
              alt={order.name}
              className="h-20 w-20 sm:h-16 sm:w-16 object-cover rounded-md flex-shrink-0"
            />
            <div className="flex-1 flex flex-col gap-1">
              <p className="font-semibold text-base sm:text-lg">{order.name}</p>
              <p className="text-sm text-gray-500">{order.category}</p>
              <p className="text-sm font-bold">${order.price}</p>
              <p className="text-xs text-gray-400">Ordered at: {order.time || "Unknown"}</p>
            </div>
            <button
              onClick={() => cancelOrder(index)}
              className="text-red-500 underline self-start sm:self-auto"
            >
              Cancel
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
