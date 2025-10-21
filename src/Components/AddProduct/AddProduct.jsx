import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

export default function AddProduct() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Men's Clothing");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [rating, setRating] = useState(0);
  const [productsMenu, setProductsMenu] = useState(true);

  // Marquee states
  const [marqueeText, setMarqueeText] = useState("");
  const [marqueeColor, setMarqueeColor] = useState("#ffffff");
  const [marqueeBgColor, setMarqueeBgColor] = useState("#1f2937"); // default gray-800

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  // Toast state
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type }), 3000);
  };

// Load marquee from localStorage
useEffect(() => {
  const savedMarquee = localStorage.getItem("marquee");
  if (savedMarquee) {
    const { text: loadedText, color: loadedColor, bgColor: loadedBg } = JSON.parse(savedMarquee);
    setMarqueeText(loadedText || "");
    setMarqueeColor(loadedColor || "#ffffff");
    setMarqueeBgColor(loadedBg || "#1f2937");
  }
}, []);


  // Close sidebar when clicking outside
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

  // Submit product (mock API)
const handleSubmit = (e) => {
  e.preventDefault();

  const newProduct = {
    id: Date.now(),
    name,
    price: parseFloat(price),
    category,
    image,
    description,
    rating,
  };

const existingProducts = JSON.parse(localStorage.getItem("shopsProducts")) || [];
existingProducts.push(newProduct);
localStorage.setItem("shopsProducts", JSON.stringify(existingProducts));


  showToast("Product added successfully!", "success");

  // Reset form
  setName("");
  setPrice("");
  setCategory("All");
  setImage("");
  setDescription("");
  setRating(0);
};


  // Save marquee to localStorage
  const saveMarquee = () => {
   const marquee = { text: marqueeText, textColor: marqueeColor, bgColor: marqueeBgColor };
    localStorage.setItem("marquee", JSON.stringify(marquee));
    showToast("Marquee saved successfully!", "success");
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-900 text-gray-200 relative">
      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed md:static z-20 inset-y-0 left-0 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 ease-in-out w-60 bg-gray-800 p-6`}
      >
        <h2 className="text-xl font-bold text-blue-400 mb-6">Admin Panel</h2>
        <nav className="space-y-2">
          <Link to="/AdminDashboard" className="block py-2 px-3 rounded-lg hover:bg-gray-700">
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
                <Link to="/AddProduct" className="block py-2 px-3 rounded-lg bg-gray-700">
                  Add Product
                </Link>
                <Link to="/ViewProducts" className="block py-2 px-3 rounded-lg hover:bg-gray-700">
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

        <h1 className="text-2xl font-bold mb-6 text-blue-400">Add New Product</h1>

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
            <option>All</option>
            <option>Men's Clothing</option>
            <option>Women's Clothing</option>
            <option>Electronics</option>
            <option>Jewelery</option>
            <option>Accessories</option>
            <option>Shoes</option>
            <option>Bag</option>
            <option>T-Shirts</option>
            <option>Trouser</option>
          </select>

          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full h-10 bg-gray-800 border border-gray-700 rounded-lg px-3"
              placeholder="Image URL"
            />
            <input
              type="file"
              accept="image/*"
              id="productImageUpload"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => setImage(reader.result);
                reader.readAsDataURL(file);
              }}
            />
            <button
              type="button"
              onClick={() => document.getElementById("productImageUpload").click()}
              className="w-full py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white text-sm font-semibold"
            >
              📁 Upload Image
            </button>
            {image && (
              <img
                src={image}
                alt="Preview"
                className="w-32 h-32 object-cover rounded mt-2 border border-gray-600"
              />
            )}
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
            rows="4"
            placeholder="Description"
            required
          ></textarea>

          <div className="flex items-center gap-3">
            <label className="text-gray-200">Rating (0.5-5):</label>
            <input
              type="number"
              value={rating}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val < 0.5) setRating(0.5);
                else if (val > 5) setRating(5);
                else setRating(val);
              }}
              className="w-20 h-10 bg-gray-800 border border-gray-700 rounded-lg px-3"
              placeholder="0.5"
              min="0.5"
              max="5"
              step="0.5"
              required
            />
          </div>

          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600"
          >
            Add Product
          </button>
        </form>

        {/* Marquee Section */}
        <div className="mt-6 space-y-4">
          <div>
            <label className="block font-semibold mb-1">Marquee Text</label>
            <input
              type="text"
              value={marqueeText}
              onChange={(e) => setMarqueeText(e.target.value)}
              placeholder="Enter marquee text"
              className="w-full p-2 border rounded bg-gray-800 text-white"
            />
          </div>

          <div className="flex gap-4">
            <div>
              <label className="block font-semibold mb-1">Text Color</label>
              <input
                type="color"
                value={marqueeColor}
                onChange={(e) => setMarqueeColor(e.target.value)}
                className="w-16 h-10 p-0 border-none rounded"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Background Color</label>
              <input
                type="color"
                value={marqueeBgColor}
                onChange={(e) => setMarqueeBgColor(e.target.value)}
                className="w-16 h-10 p-0 border-none rounded"
              />
            </div>
          </div>

          <button
            onClick={saveMarquee}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Save Marquee
          </button>

          {/* Live Preview */}
          {marqueeText && (
            <div
              className="mt-4 overflow-hidden border rounded"
              style={{ backgroundColor: marqueeBgColor }}
            >
              <marquee style={{ color: marqueeColor, padding: "10px" }}>
                {marqueeText}
              </marquee>
            </div>
          )}
        </div>

        {/* Toast */}
        {toast.show && (
          <div
            className={`fixed top-5 right-5 z-50 px-6 py-3 rounded-xl shadow-lg text-white backdrop-blur-md bg-gradient-to-r ${
              toast.type === "success"
                ? "from-green-400 to-green-600"
                : "from-red-400 to-red-600"
            } transform transition duration-300`}
          >
            {toast.message}
          </div>
        )}
      </main>
    </div>
  );
}
