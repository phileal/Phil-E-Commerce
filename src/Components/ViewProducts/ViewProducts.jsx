import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [productsMenu, setProductsMenu] = useState(true);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

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

  // Load products
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("shopsProducts")) || [];
    // Check if old price expired
    const updated = stored.map((p) => {
      if (p.oldPrice && p.oldPriceExpiry) {
        const now = new Date();
        if (new Date(p.oldPriceExpiry) <= now) {
          return { ...p, oldPrice: null, oldPriceExpiry: null };
        }
      }
      return p;
    });
    setProducts(updated);
    localStorage.setItem("shopsProducts", JSON.stringify(updated));
  }, []);

  const saveProducts = (updated) => {
    localStorage.setItem("shopsProducts", JSON.stringify(updated));
    setProducts(updated);
  };

  const deleteProduct = (index) => {
    const updated = [...products];
    updated.splice(index, 1);
    saveProducts(updated);
  };

  const openEdit = (index) => {
    setEditIndex(index);
    setEditProduct(products[index]);
  };

  const closeModal = () => {
    setEditIndex(null);
    setEditProduct(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSave = (e) => {
    e.preventDefault();
    const updated = [...products];

    // Handle old price logic
    let oldPriceExpiry = null;
    if (editProduct.oldPrice && editProduct.oldPriceDuration) {
      const now = new Date();
      const duration = parseInt(editProduct.oldPriceDuration) || 0;
      const unit = editProduct.oldPriceUnit || "days";

      switch (unit) {
        case "days":
          oldPriceExpiry = new Date(now.setDate(now.getDate() + duration));
          break;
        case "weeks":
          oldPriceExpiry = new Date(now.setDate(now.getDate() + duration * 7));
          break;
        case "months":
          oldPriceExpiry = new Date(now.setMonth(now.getMonth() + duration));
          break;
        default:
          oldPriceExpiry = null;
      }
    }

    updated[editIndex] = {
      ...editProduct,
      price: parseFloat(editProduct.price),
      oldPrice: editProduct.oldPrice ? parseFloat(editProduct.oldPrice) : null,
      oldPriceExpiry,
      stock: parseInt(editProduct.stock || 0),
      rating: parseFloat(editProduct.rating || 0),
    };
    saveProducts(updated);
    closeModal();
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
                <Link to="/AddProduct" className="block py-2 px-3 rounded-lg hover:bg-gray-700">
                  Add Product
                </Link>
                <Link to="/ViewProducts" className="block py-2 px-3 rounded-lg bg-gray-700">
                  View Products
                </Link>
              </div>
            )}
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:ml-0 ml-0">
        <button
          id="menuButton"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden mb-4 p-2 bg-gray-800 text-white rounded"
        >
          ☰ Menu
        </button>

        <h1 className="text-2xl font-bold mb-6 text-blue-400">Products</h1>

        <div className="bg-gray-800 rounded-xl shadow p-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2">Product</th>
                <th className="text-left py-2">Category</th>
                <th className="text-left py-2">Price</th>
                <th className="text-left py-2">Stock</th>
                <th className="text-left py-2">Rating</th>
                <th className="text-left py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map((p, index) => (
                  <tr key={index} className="border-b border-gray-700">
                    <td className="py-2">{p.name}</td>
                    <td>{p.category}</td>
                    <td>
                      {p.oldPrice && p.oldPrice !== p.price && (
                        <span className="line-through text-gray-400 mr-2">${p.oldPrice}</span>
                      )}
                      ${p.price}
                    </td>
                    <td>{p.stock || 0}</td>
                    <td>{p.rating?.toFixed(1) || 0}</td>
                    <td>
                      <button className="text-blue-400 underline mr-2" onClick={() => openEdit(index)}>
                        Edit
                      </button>
                      <button className="text-red-400 underline" onClick={() => deleteProduct(index)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-4 text-center text-gray-400">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Edit Modal */}
      {editProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-bold text-blue-400 mb-4">Edit Product</h2>
            <form onSubmit={handleEditSave} className="space-y-3">
              <input
                type="text"
                name="name"
                value={editProduct.name}
                onChange={handleEditChange}
                className="w-full p-2 rounded bg-gray-700 text-gray-200"
                placeholder="Product Name"
                required
              />
              <input
                type="text"
                name="category"
                value={editProduct.category}
                onChange={handleEditChange}
                className="w-full p-2 rounded bg-gray-700 text-gray-200"
                placeholder="Category"
                required
              />
              <input
                type="number"
                name="price"
                value={editProduct.price}
                onChange={handleEditChange}
                className="w-full p-2 rounded bg-gray-700 text-gray-200"
                placeholder="Price"
                required
              />
              <input
                type="number"
                name="oldPrice"
                value={editProduct.oldPrice || ""}
                onChange={handleEditChange}
                className="w-full p-2 rounded bg-gray-700 text-gray-200"
                placeholder="Old Price"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  name="oldPriceDuration"
                  value={editProduct.oldPriceDuration || ""}
                  onChange={handleEditChange}
                  className="w-1/2 p-2 rounded bg-gray-700 text-gray-200"
                  placeholder="Duration"
                />
                <select
                  name="oldPriceUnit"
                  value={editProduct.oldPriceUnit || "days"}
                  onChange={handleEditChange}
                  className="w-1/2 p-2 rounded bg-gray-700 text-gray-200"
                >
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                  <option value="months">Months</option>
                </select>
              </div>
              <input
                type="number"
                name="stock"
                value={editProduct.stock || 0}
                onChange={handleEditChange}
                className="w-full p-2 rounded bg-gray-700 text-gray-200"
                placeholder="Stock"
                required
              />
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                name="rating"
                value={editProduct.rating || 0}
                onChange={handleEditChange}
                className="w-full p-2 rounded bg-gray-700 text-gray-200"
                placeholder="Rating (0-5)"
              />
              <input
                type="text"
                name="image"
                value={editProduct.image || ""}
                onChange={handleEditChange}
                className="w-full p-2 rounded bg-gray-700 text-gray-200"
                placeholder="Image URL"
              />

              <div className="flex justify-between mt-4">
                <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
