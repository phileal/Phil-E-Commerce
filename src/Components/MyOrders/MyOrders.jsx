import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PaystackButton } from "react-paystack";

export default function MyOrders() {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [paidOrders, setPaidOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [currentCustomer, setCurrentCustomer] = useState(null);

  // Toast
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
  };

  const PAYSTACK_PUBLIC_KEY = "YOUR_PAYSTACK_PUBLIC_KEY"; // replace with real key!

  // Load orders from localStorage
  useEffect(() => {
    const customer = JSON.parse(localStorage.getItem("currentCustomer"));
    setCurrentCustomer(customer);

    const storedPending = JSON.parse(localStorage.getItem("shopsOrders")) || [];
    const storedPaid = JSON.parse(localStorage.getItem("paidOrders")) || [];
    const storedCompleted =
      JSON.parse(localStorage.getItem("completedOrders")) || [];

    setPendingOrders(storedPending);
    setPaidOrders(storedPaid);
    setCompletedOrders(storedCompleted);
  }, []);

  // Remove pending order
  const removePendingOrder = (index) => {
    const updated = [...pendingOrders];
    updated.splice(index, 1);
    localStorage.setItem("shopsOrders", JSON.stringify(updated));
    setPendingOrders(updated);
    showToast("🗑️ Removed from pending orders", "success");
  };

  // Handle Paystack payment success
  const handlePaymentSuccess = (order, index, reference) => {
    const updatedPending = [...pendingOrders];
    updatedPending.splice(index, 1);
    setPendingOrders(updatedPending);
    localStorage.setItem("shopsOrders", JSON.stringify(updatedPending));

    // Add to paidOrders
    const updatedPaid = [
      ...paidOrders,
      { ...order, paystackRef: reference.reference },
    ];
    setPaidOrders(updatedPaid);
    localStorage.setItem("paidOrders", JSON.stringify(updatedPaid));

    showToast("✅ Payment successful!", "success");
  };

  // Cancel paid order
  const cancelPaidOrder = (index) => {
    const updatedPaid = [...paidOrders];
    const canceled = updatedPaid.splice(index, 1)[0];
    setPaidOrders(updatedPaid);
    localStorage.setItem("paidOrders", JSON.stringify(updatedPaid));

    const canceledOrders =
      JSON.parse(localStorage.getItem("canceledOrders")) || [];
    canceledOrders.push(canceled);
    localStorage.setItem("canceledOrders", JSON.stringify(canceledOrders));

    showToast("❌ Order canceled", "error");
  };

  // Delete completed order
  const deleteCompletedOrder = (index) => {
    const updated = [...completedOrders];
    updated.splice(index, 1);
    setCompletedOrders(updated);
    localStorage.setItem("completedOrders", JSON.stringify(updated));
    showToast("🗑️ Completed order deleted", "success");
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4 md:p-6 relative">
      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed top-4 right-4 px-4 py-2 rounded shadow-lg text-white z-50 transition-all duration-500 ${
            toast.type === "error"
              ? "bg-red-600"
              : toast.type === "success"
              ? "bg-green-600"
              : "bg-blue-600"
          }`}
        >
          {toast.message}
        </div>
      )}

      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center md:text-left">
        My Orders
      </h1>

      <Link
        to="/Menu"
        className="inline-block mb-6 text-blue-500 hover:underline text-center md:text-left"
      >
        ← Back to Menu
      </Link>

      {/* Pending Orders */}
      {pendingOrders.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Pending Orders</h2>

          <p className="font-bold mb-3">
            Total for all pending items: $
            {pendingOrders.reduce(
              (sum, order) => sum + order.price * (order.quantity || 1),
              0
            )}
          </p>

          <div className="flex flex-col gap-4">
            {pendingOrders.map((order, index) => {
              const totalAmount = order.price * (order.quantity || 1);
              return (
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
                    <p className="font-semibold text-base sm:text-lg">
                      {order.name}
                    </p>
                    <p className="text-sm text-gray-500">{order.category}</p>
                    <p className="text-sm font-bold">Price: ${order.price}</p>
                    <p className="text-sm font-bold">
                      Quantity: {order.quantity || 1}
                    </p>
                    <p className="text-sm font-bold">Total: ${totalAmount}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => removePendingOrder(index)}
                      className="text-red-500 underline"
                    >
                      Remove
                    </button>
                    {currentCustomer && PAYSTACK_PUBLIC_KEY && (
                      <PaystackButton
                        reference={new Date().getTime().toString()}
                        email={currentCustomer.email}
                        amount={totalAmount * 100}
                        publicKey={PAYSTACK_PUBLIC_KEY}
                        onSuccess={(ref) =>
                          handlePaymentSuccess(order, index, ref)
                        }
                        onClose={() =>
                          showToast("⚠️ Payment cancelled", "error")
                        }
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Paid Orders */}
      {paidOrders.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Paid Orders</h2>
          <div className="flex flex-col gap-4">
            {paidOrders.map((order, index) => (
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
                  <p className="font-semibold text-base sm:text-lg">
                    {order.name}
                  </p>
                  <p className="text-sm text-gray-500">{order.category}</p>
                  <p className="text-sm font-bold">Price: ${order.price}</p>
                  <p className="text-xs text-gray-400">
                    Ordered at: {order.time || "Unknown"}
                  </p>
                </div>
                <button
                  onClick={() => cancelPaidOrder(index)}
                  className="text-red-500 underline self-start sm:self-auto"
                >
                  Cancel
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Orders */}
      {completedOrders.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Completed Orders</h2>
          <div className="flex flex-col gap-4">
            {completedOrders.map((order, index) => (
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
                  <p className="font-semibold text-base sm:text-lg">
                    {order.name}
                  </p>
                  <p className="text-sm text-gray-500">{order.category}</p>
                  <p className="text-sm font-bold">Price: ${order.price}</p>
                  <p className="text-xs text-gray-400">
                    Ordered
                    at: {order.time || "Unknown"}
                  </p>
                </div>
                <button
                  onClick={() => deleteCompletedOrder(index)}
                  className="text-red-500 underline self-start sm:self-auto"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {pendingOrders.length === 0 &&
        paidOrders.length === 0 &&
        completedOrders.length === 0 && (
          <p className="text-gray-500 text-center md:text-left">
            You have no orders.
          </p>
        )}
    </div>
  );
}
