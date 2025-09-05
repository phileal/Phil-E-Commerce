import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import MenuImg from "../../assets/world_unsplash.com.jpeg";

export default function Store() {
  const navigate = useNavigate();
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [basketItems, setBasketItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [basketOpen, setBasketOpen] = useState(false);
  const [bankDetails, setBankDetails] = useState("Loading...");

  useEffect(() => {
    const customer = JSON.parse(localStorage.getItem("currentCustomer"));
    if (!customer) {
      alert("Please login first!");
      navigate("/customer-login");
      return;
    }
    setCurrentCustomer(customer);

    const productsList = JSON.parse(localStorage.getItem("shopsProducts")) || [];
    setProducts(productsList);

    const bank = JSON.parse(localStorage.getItem("superAdminBank"));
    setBankDetails(
      bank
        ? `Bank: ${bank.bankName}, Account Name: ${bank.accountName}, Account Number: ${bank.accountNumber}`
        : "No bank account set. Please choose another payment method."
    );

    let activeUsers = JSON.parse(localStorage.getItem("activeUsers")) || [];
    if (!activeUsers.some((u) => u.email === customer.email)) {
      activeUsers.push({ name: customer.name, email: customer.email });
      localStorage.setItem("activeUsers", JSON.stringify(activeUsers));
    }
  }, [navigate]);

  const handleLogout = () => {
    let activeUsers = JSON.parse(localStorage.getItem("activeUsers")) || [];
    activeUsers = activeUsers.filter((u) => u.email !== currentCustomer.email);
    localStorage.setItem("activeUsers", JSON.stringify(activeUsers));
    localStorage.removeItem("currentCustomer");
    alert("Logged out successfully!");
    navigate("/");
  };

  const toggleBasket = () => setBasketOpen(!basketOpen);

  const addToBasket = (product) => {
    setBasketItems((prev) => {
      const exists = prev.find((i) => i.name === product.name);
      if (exists) {
        return prev.map((i) =>
          i.name === product.name ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        return [...prev, { ...product, quantity: 1, time: new Date().toLocaleString() }];
      }
    });

    Toastify({
      text: `${product.name} added to basket ✅`,
      duration: 3000,
      close: true,
      gravity: "top",
      position: "right",
      backgroundColor: "linear-gradient(to right, #2563eb, #1e40af)",
      stopOnFocus: true,
    }).showToast();
  };

  const removeBasketItem = (index) => {
    setBasketItems((prev) => prev.filter((_, i) => i !== index));
  };

  const placeOrder = (e) => {
    e.preventDefault();
    const address = e.target.deliveryAddress.value.trim();
    const receiptFile = e.target.receipt.files[0];

    if (!address) return alert("Please enter delivery address.");
    if (!receiptFile) return alert("Please upload payment receipt.");
    if (basketItems.length === 0) return alert("Your basket is empty!");

    const reader = new FileReader();
    reader.onload = function (event) {
      const orders = JSON.parse(localStorage.getItem("shopsOrders")) || [];
      basketItems.forEach((item) => {
        orders.push({
          ...item,
          deliveryAddress: address,
          paymentMethod: "Bank Transfer",
          receipt: event.target.result,
          status: "Pending",
          customerEmail: currentCustomer.email,
        });
      });
      localStorage.setItem("shopsOrders", JSON.stringify(orders));
      setBasketItems([]);
      alert("Order placed! Admin will verify your payment.");
      setBasketOpen(false);
    };
    reader.readAsDataURL(receiptFile);
  };

  const filteredProducts = products.filter((p) => {
    const value = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(value) ||
      p.category.toLowerCase().includes(value) ||
      p.description.toLowerCase().includes(value) ||
      (`$${p.price}`.toLowerCase().includes(value))
    );
  });

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section
        className="text-white py-12 text-center relative bg-cover bg-center"
        style={{ backgroundImage: `url(${MenuImg})` }}
      >
        {/* Logout button top-right */}
        <button
          onClick={handleLogout}
          className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-bold"
        >
          Logout
        </button>

        <div className="bg-black bg-opacity-40 p-6 md:p-12 rounded-xl inline-block">
          <h1 className="text-3xl md:text-5xl font-bold">Welcome to Our Store</h1>
          <p className="mt-2 text-lg md:text-xl italic">
            Hello <span className="font-semibold">{currentCustomer?.name || currentCustomer?.email}</span>, find your best products here!
          </p>

          {/* My Orders button top-left */}
          <Link
            to="/my-orders"
            className="absolute top-4 left-4 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-bold"
          >
            My Orders
          </Link>
        </div>
      </section>

      {/* Search */}
      <div className="p-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          type="text"
          placeholder="Search products"
          className="w-full max-w-xl mx-auto h-10 pl-4 rounded-lg border border-gray-300 outline-none"
        />
      </div>

      {/* Products List */}
      <section className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-6 pb-10">
        {filteredProducts.map((p, i) => (
          <div
            key={i}
            className="group bg-white rounded-xl shadow p-4 hover:shadow-lg transition-transform duration-300 transform hover:scale-105"
          >
            <img src={p.image} className="h-48 w-full object-contain mb-3" alt={p.name} />
            <p className="font-semibold">{p.name}</p>
            <p className="text-sm text-gray-500">{p.category}</p>
            <p className="font-bold mb-2">${p.price} | ₦{p.price * 50}</p>
            <p className="text-sm text-gray-400 truncate" title={p.description}>{p.description}</p>
            {/* Always visible Order button */}
            <button
              onClick={() => addToBasket(p)}
              className="bg-black text-white w-full py-2 rounded-lg mt-2 hover:bg-gray-800"
            >
              Order Now
            </button>
          </div>
        ))}
      </section>

      {/* Basket */}
      <div
        className={`fixed right-0 top-0 w-96 h-full bg-gray-50 shadow-lg p-6 overflow-y-auto transition-transform ${basketOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <h2 className="text-xl font-bold mb-4 text-blue-400">Your Basket</h2>
        <div className="space-y-4">
          {basketItems.map((item, idx) => (
            <div key={idx} className="bg-white p-2 rounded shadow flex justify-between items-center">
              <span>
                {item.name} x {item.quantity} - ${item.price * item.quantity} | ₦
                {item.price * item.quantity * 50}
              </span>
              <button className="text-red-500" onClick={() => removeBasketItem(idx)}>
                Remove
              </button>
            </div>
          ))}
        </div>
        <p className="font-bold mt-2">
          Total: ${basketItems.reduce((sum, i) => sum + i.price * i.quantity, 0)} | ₦
          {basketItems.reduce((sum, i) => sum + i.price * i.quantity * 50, 0)}
        </p>

        <form className="mt-4" onSubmit={placeOrder}>
          <label className="block mb-1">Delivery Address:</label>
          <input
            name="deliveryAddress"
            type="text"
            className="w-full p-2 border rounded-lg mb-4"
            placeholder="Enter delivery address"
            required
          />

          <h3 className="font-semibold mb-1">Bank Transfer Details:</h3>
          <p className="text-sm text-gray-700 mb-2">{bankDetails}</p>

          <label className="block mb-1">Upload Payment Receipt:</label>
          <input name="receipt" type="file" className="mb-4" required />

          <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 w-full">
            Place Order
          </button>
        </form>
      </div>

      {/* Basket Toggle */}
      <button
        onClick={toggleBasket}
        className="fixed bottom-4 right-4 bg-black text-white py-2 px-4 rounded-lg hover:bg-blue-600"
      >
        Basket 🛒 ({basketItems.reduce((sum, i) => sum + i.quantity, 0)})
      </button>
    </div>
  );
}
