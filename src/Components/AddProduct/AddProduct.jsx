import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

export default function AddProduct() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Men's Clothing");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [productsMenu, setProductsMenu] = useState(true); // default open

  // ✅ Sidebar open/close for small screens
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  // ✅ Close sidebar when clicking outside
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

  const handleSubmit = (e) => {
    e.preventDefault();

    const product = { name, price, category, image, description };

    const existing = JSON.parse(localStorage.getItem("shopsProducts")) || [];
    existing.push(product);
    localStorage.setItem("shopsProducts", JSON.stringify(existing));

    alert("Product added!");
    setName("");
    setPrice("");
    setCategory("Men's Clothing");
    setImage("");
    setDescription("");
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
          <div>
            <button
              onClick={() => setProductsMenu(!productsMenu)}
              className="w-full text-left py-2 px-3 rounded-lg bg-gray-700"
            >
              Products ▾
            </button>
            {productsMenu && (
              <div className="space-y-1 pl-4 mt-1">
                <Link
                  to="/AddProduct"
                  className="block py-2 px-3 rounded-lg bg-gray-700"
                >
                  Add Product
                </Link>
                <Link
                  to="/ViewProducts"
                  className="block py-2 px-3 rounded-lg hover:bg-gray-700"
                >
                  View Products
                </Link>
              </div>
            )}
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:ml-0 ml-0">
        {/* Hamburger for mobile */}
        <button
          id="menuButton"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden mb-4 p-2 bg-gray-800 text-white rounded"
        >
          ☰ Menu
        </button>

        <h1 className="text-2xl font-bold mb-6 text-blue-400">
          Add New Product
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-10 bg-gray-800 border border-gray-700 rounded-lg px-3"
            placeholder="Product Name"
            required
          />
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full h-10 bg-gray-800 border border-gray-700 rounded-lg px-3"
            placeholder="Price"
            required
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full h-10 bg-gray-800 border border-gray-700 rounded-lg px-3"
          >
            <option>Men's Clothing</option>
            <option>Women's Clothing</option>
            <option>Electronics</option>
            <option>Jewelery</option>
            <option>Accessories</option>
            <option>Shoes</option>
          </select>
          <input
            type="text"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="w-full h-10 bg-gray-800 border border-gray-700 rounded-lg px-3"
            placeholder="Image URL"
            required
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
            rows="4"
            placeholder="Description"
            required
          ></textarea>

          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600"
          >
            Add Product
          </button>
        </form>
      </main>
    </div>
  );
}
