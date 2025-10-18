import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalCustomers: 0,
  });

  const [reviews, setReviews] = useState([]);

  const [menus, setMenus] = useState({});
  const [profilePic, setProfilePic] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  // Toast state
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type }), 3000);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (sidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen]);

  const toggleMenu = (id) => setMenus((prev) => ({ ...prev, [id]: !prev[id] }));

  useEffect(() => {
    const admin = JSON.parse(localStorage.getItem("currentAdmin"));
    if (!admin) return navigate("/AdminLogin");
    setCurrentAdmin(admin);

    const storedAdmins = JSON.parse(localStorage.getItem("admins")) || [];
    setAdmins(storedAdmins);

    const storedUsers = JSON.parse(localStorage.getItem("customers")) || [];
    setUsers(storedUsers);

    const products = JSON.parse(localStorage.getItem("shopsProducts")) || [];
    const orders = JSON.parse(localStorage.getItem("shopsOrders")) || [];
    setStats({
      totalProducts: products.length,
      totalOrders: orders.length,
      pendingOrders: orders.filter((o) => o.status === "Pending").length,
      totalCustomers: storedUsers.length,
    });

    const shopsReviews = JSON.parse(localStorage.getItem("shopsReviews") || "[]");
    let productReviewsRaw = JSON.parse(localStorage.getItem("productReviews") || "{}");
    const productReviews = Array.isArray(productReviewsRaw)
      ? productReviewsRaw
      : Object.values(productReviewsRaw).flat();

    const allReviews = [...shopsReviews, ...productReviews].reverse();
    setReviews(allReviews);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("currentAdmin");
    navigate("/AdminLogin");
  };

  const handleSaveBank = () => {
    const bankName = document.getElementById("bankName").value.trim();
    const accountName = document.getElementById("accountName").value.trim();
    const accountNumber = document.getElementById("accountNumber").value.trim();
    if (!bankName || !accountName || !accountNumber) return showToast("Fill all fields", "error");

    localStorage.setItem("superAdminBank", JSON.stringify({ bankName, accountName, accountNumber }));
    showToast("Bank info saved!", "success");
  };

  const handleCreateAdmin = () => {
    const id = document.getElementById("newAdminId").value.trim();
    const email = document.getElementById("newAdminEmail").value.trim();
    const password = document.getElementById("newAdminPassword").value.trim();
    const confirmPassword = document.getElementById("confirmNewAdminPassword").value.trim();
    if (!id || !email || !password) return showToast("Fill all fields", "error");
    if (password !== confirmPassword) return showToast("Passwords do not match!", "error");

    let adminsList = JSON.parse(localStorage.getItem("admins")) || [];
    if (adminsList.find((a) => a.id === id || a.email === email)) return showToast("Admin exists", "error");

    adminsList.push({ id, email, password, role: "admin" });
    localStorage.setItem("admins", JSON.stringify(adminsList));
    setAdmins(adminsList);
    showToast("Admin created!", "success");
  };

  const handleCreateSuperAdmin = () => {
    const id = document.getElementById("newSuperAdminId").value.trim();
    const email = document.getElementById("newSuperAdminEmail").value.trim();
    const password = document.getElementById("newSuperAdminPassword").value.trim();
    const confirmPassword = document.getElementById("confirmNewSuperAdminPassword").value.trim();
    if (!id || !email || !password) return showToast("Fill all fields", "error");
    if (password !== confirmPassword) return showToast("Passwords do not match!", "error");

    let adminsList = JSON.parse(localStorage.getItem("admins")) || [];
    if (adminsList.find((a) => a.id === id || a.email === email)) return showToast("Admin already exists", "error");

    adminsList.push({ id, email, password, role: "superadmin" });
    localStorage.setItem("admins", JSON.stringify(adminsList));
    setAdmins(adminsList);
    showToast("Super Admin created!", "success");
  };

  const handleDeleteAdmin = (index) => {
    let updated = [...admins];
    updated.splice(index, 1);
    localStorage.setItem("admins", JSON.stringify(updated));
    setAdmins(updated);
    showToast("Admin deleted", "success");
  };

  const handleDeleteUser = (index) => {
    let updated = [...users];
    updated.splice(index, 1);
    localStorage.setItem("customers", JSON.stringify(updated));
    setUsers(updated);
    showToast("User deleted", "success");
  };

  const handleProfilePicUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setProfilePic(reader.result);
      let updatedAdmin = { ...currentAdmin, profilePic: reader.result };
      localStorage.setItem("currentAdmin", JSON.stringify(updatedAdmin));
      let updatedAdmins = admins.map((a) => (a.id === currentAdmin.id ? updatedAdmin : a));
      localStorage.setItem("admins", JSON.stringify(updatedAdmins));
      setAdmins(updatedAdmins);
      setCurrentAdmin(updatedAdmin);
      showToast("Profile picture updated!", "success");
    };
    reader.readAsDataURL(file);
  };

// --- State for confirm modal ---
const [confirmModal, setConfirmModal] = useState({ show: false, action: null, message: "" });

// Call when user confirms the action
const handleConfirm = () => {
  if (confirmModal.action) confirmModal.action();
  setConfirmModal({ show: false, action: null, message: "" });
};

// Call when user cancels
const handleCancelConfirm = () => {
  setConfirmModal({ show: false, action: null, message: "" });
};

// --- Persist reviews ---
const persistReviewsToStorage = (list) => {
  try {
    const oldestFirst = [...list].reverse();
    localStorage.setItem("shopsReviews", JSON.stringify(oldestFirst));
    localStorage.setItem("productReviews", JSON.stringify(oldestFirst));
  } catch (err) {
    console.error("Failed saving reviews", err);
    showToast("Failed saving reviews", "error");
  }
};

// --- Delete a single review ---
const deleteReview = (index) => {
  if (currentAdmin?.role !== "superadmin") {
    return showToast("No permission to delete review", "error");
  }

  setConfirmModal({
    show: true,
    message: "Delete this review? This action cannot be undone.",
    action: () => {
      const newList = [...reviews];
      newList.splice(index, 1);
      setReviews(newList);
      persistReviewsToStorage(newList);
      showToast("Review deleted!", "success");
    },
  });
};

// --- Clear all reviews ---
const clearAllReviews = () => {
  if (currentAdmin?.role !== "superadmin") {
    return showToast("No permission to clear reviews", "error");
  }

  setConfirmModal({
    show: true,
    message: "Clear ALL reviews? This cannot be undone.",
    action: () => {
      setReviews([]);
      localStorage.removeItem("shopsReviews");
      localStorage.removeItem("productReviews");
      showToast("All reviews cleared!", "success");
    },
  });
};

// --- Helper functions ---
const reviewName = (r) => r?.name || r?.user || r?.username || r?.userName || "Anonymous";
const reviewText = (r) => r?.message || r?.text || r?.comment || r?.review || "";





  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-900 text-gray-100">
      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed md:static z-20 inset-y-0 left-0 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 transition-transform duration-300 ease-in-out w-72 bg-gray-800 p-6 flex flex-col overflow-y-auto max-h-screen`}
      >
        <h2 className="text-2xl font-bold text-blue-400 mb-6">Admin Panel</h2>

        <nav className="flex-1 space-y-2">
          {/* Profile */}
          <div>
            <button onClick={() => toggleMenu("profileMenu")} className="w-full text-left py-2 px-3 rounded-lg hover:bg-gray-700">
              Profile ▾
            </button>
            {menus.profileMenu && (
              <div className="pl-4 mt-1 space-y-2">
                <label className="block text-sm">Change Picture</label>
                <input type="file" accept="image/*" onChange={handleProfilePicUpload} className="w-full text-sm" />
              </div>
            )}
          </div>

          {/* Products */}
          <div>
            <button onClick={() => toggleMenu("productsMenu")} className="w-full text-left py-2 px-3 rounded-lg hover:bg-gray-700">
              Products ▾
            </button>
            {menus.productsMenu && (
              <div className="pl-4 mt-1 space-y-1">
                <Link to="/AddProduct" className="block py-2 px-3 rounded-lg hover:bg-gray-700">Add Product</Link>
                <Link to="/ViewProducts" className="block py-2 px-3 rounded-lg hover:bg-gray-700">View Products</Link>
              </div>
            )}
          </div>

          {/* Orders */}
          <div>
            <button onClick={() => toggleMenu("ordersMenu")} className="w-full text-left py-2 px-3 rounded-lg hover:bg-gray-700">
              Orders ▾
            </button>
            {menus.ordersMenu && (
              <div className="pl-4 mt-1 space-y-1">
                <Link to="/PendingOrders" className="block py-2 px-3 rounded-lg hover:bg-gray-700">Pending Orders</Link>
                <Link to="/CompleteOrders" className="block py-2 px-3 rounded-lg hover:bg-gray-700">Completed Orders</Link>
              </div>
            )}
          </div>

          {/* Customer Reviews Link */}
          <div>
            <Link
              to="/CustomerReviews"
              className="w-full flex justify-between items-center py-2 px-3 rounded-lg hover:bg-gray-700"
            >
              <span>Customer Reviews ▾</span>
              <span className="ml-2 inline-block bg-blue-500 px-2 py-0.5 rounded text-xs">{reviews.length}</span>
            </Link>
          </div>


          {/* Admin Tools */}
          <div className="mt-4">
            <button onClick={() => toggleMenu("adminMenu")} className="w-full text-left py-2 px-3 rounded-lg hover:bg-gray-700">
              Admin Tools ▾
            </button>

            {menus.adminMenu && (
              <div className="pl-4 mt-1 space-y-2">
                {currentAdmin?.role === "superadmin" && (
                  <>
                    {/* Bank Info */}
                    <div>
                      <button onClick={() => toggleMenu("bankMenu")} className="w-full text-left py-2 px-3 rounded-lg hover:bg-gray-700">
                        Super Admin Bank Info ▾
                      </button>
                      {menus.bankMenu && (
                        <div className="pl-4 mt-1 space-y-1">
                          <input type="text" id="bankName" placeholder="Bank Name" className="w-full p-2 rounded bg-gray-700 mb-1" />
                          <input type="text" id="accountName" placeholder="Account Name" className="w-full p-2 rounded bg-gray-700 mb-1" />
                          <input type="text" id="accountNumber" placeholder="Account Number" className="w-full p-2 rounded bg-gray-700 mb-1" />
                          <button onClick={handleSaveBank} className="w-full py-2 bg-blue-500 rounded hover:bg-blue-600">Save Bank Info</button>
                        </div>
                      )}
                    </div>

                    {/* Create Admin */}
                    <div>
                      <button
                        onClick={() => toggleMenu("createAdmin")}
                        className="w-full text-left py-2 px-3 rounded-lg hover:bg-gray-700"
                      >
                        Create Admin ▾
                      </button>

                      {menus.createAdmin && (
                        <div className="mt-2 space-y-2">
                          <input
                            type="text"
                            id="newAdminId"
                            placeholder="Admin ID"
                            className="w-full p-2 rounded bg-gray-700"
                          />
                          <input
                            type="email"
                            id="newAdminEmail"
                            placeholder="Admin Email"
                            className="w-full p-2 rounded bg-gray-700"
                          />
                          <input
                            type="password"
                            id="newAdminPassword"
                            placeholder="Admin Password"
                            className="w-full p-2 rounded bg-gray-700"
                          />
                          <input
                            type="password"
                            id="confirmNewAdminPassword"
                            placeholder="Confirm Admin Password"
                            className="w-full p-2 rounded bg-gray-700"
                          />
                          <button
                            onClick={handleCreateAdmin}
                            className="w-full py-2 bg-green-500 rounded hover:bg-green-600"
                          >
                            Create Admin
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Create Super Admin */}
                    <div className="mt-4">
                      <button
                        onClick={() => toggleMenu("createSuperAdmin")}
                        className="w-full text-left py-2 px-3 rounded-lg hover:bg-gray-700"
                      >
                        Create Super Admin ▾
                      </button>

                      {menus.createSuperAdmin && (
                        <div className="mt-2 space-y-2">
                          <input
                            type="text"
                            id="newSuperAdminId"
                            placeholder="Super Admin ID"
                            className="w-full p-2 rounded bg-gray-700"
                          />
                          <input
                            type="email"
                            id="newSuperAdminEmail"
                            placeholder="Super Admin Email"
                            className="w-full p-2 rounded bg-gray-700"
                          />
                          <input
                            type="password"
                            id="newSuperAdminPassword"
                            placeholder="Super Admin Password"
                            className="w-full p-2 rounded bg-gray-700"
                          />
                          <input
                            type="password"
                            id="confirmNewSuperAdminPassword"
                            placeholder="Confirm Super Admin Password"
                            className="w-full p-2 rounded bg-gray-700"
                          />
                          <button
                            onClick={handleCreateSuperAdmin}
                            className="w-full py-2 bg-purple-500 rounded hover:bg-purple-600"
                          >
                            Create Super Admin
                          </button>
                        </div>
                      )}
                    </div>


                    {/* Exchange Rate Config */}
                    <div className="mt-4">
                      <button
                        onClick={() => toggleMenu("exchangeRateConfig")}
                        className="w-full text-left py-2 px-3 rounded-lg hover:bg-gray-700"
                      >
                        Exchange Rate Config ▾
                      </button>

                      {menus.exchangeRateConfig && (
                        <div className="mt-2 space-y-2">
                          <input
                            type="number"
                            id="exchangeRate"
                            placeholder="₦ per $ (e.g. 50)"
                            className="w-full p-2 rounded bg-gray-700"
                            defaultValue={JSON.parse(localStorage.getItem("exchangeRate")) || ""}
                          />
                          <button
                            onClick={() => {
                              const rate = document.getElementById("exchangeRate").value.trim();
                              if (!rate) return showToast("Enter a valid rate", "error");
                              localStorage.setItem("exchangeRate", JSON.stringify(Number(rate)));
                              showToast("Exchange rate saved!", "success");
                            }}
                            className="w-full py-2 bg-yellow-500 rounded hover:bg-yellow-600"
                          >
                            Save Exchange Rate
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Manage Admins */}
                    <div>
                      <button onClick={() => toggleMenu("adminsList")} className="w-full text-left py-2 px-3 rounded-lg hover:bg-gray-700">Manage Admins ▾</button>
                      {menus.adminsList && (
                        <div className="pl-4 mt-1 space-y-1">
                          {admins.map((a, i) => (
                            <div key={i} className="flex justify-between items-center bg-gray-700 p-2 rounded">
                              <span>{a.id} ({a.email}) [{a.role}]</span>
                              <button className="bg-red-500 px-2 py-1 rounded text-sm" onClick={() => handleDeleteAdmin(i)}>Delete</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Manage Users */}
                <div>
                  <button onClick={() => toggleMenu("usersList")} className="w-full text-left py-2 px-3 rounded-lg hover:bg-gray-700">Manage Users ▾</button>
                  {menus.usersList && (
                    <div className="pl-4 mt-1 space-y-1">
                      {users.map((u, i) => (
                        <div key={i} className="flex justify-between items-center bg-gray-700 p-2 rounded">
                          <span>{u.name || u.email || "User"}</span>
                          <button className="bg-red-500 px-2 py-1 rounded text-sm" onClick={() => handleDeleteUser(i)}>Delete</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Logout */}
          <button onClick={handleLogout} className="mt-6 w-full py-2 px-3 bg-red-500 rounded hover:bg-red-600">Logout</button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:ml-0 ml-0">
        {/* Hamburger for mobile */}
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden mb-4 p-2 bg-gray-800 text-white rounded">☰ Menu</button>

        <div className="flex items-center gap-6 mb-6 flex-wrap">
          {/* Profile picture */}
          {currentAdmin?.profilePic ? (
            <img src={currentAdmin.profilePic} alt="Profile" className="w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-blue-400 object-cover" />
          ) : (
            <div className="w-28 h-28 md:w-36 md:h-36 flex items-center justify-center rounded-full bg-gray-700 border-4 border-gray-500 text-4xl">👤</div>
          )}

          <h1 className="text-2xl md:text-3xl font-bold text-blue-400">
            {currentAdmin?.role === "superadmin" ? `Welcome Super Admin, ${currentAdmin?.id}` : `Welcome Admin, ${currentAdmin?.id}`}
          </h1>
        </div>

        {/* Dashboard Summary (4 cards) + Reviews count badge */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-800 shadow rounded-xl p-6 text-center">
            <p className="text-3xl">🛍️</p>
            <h2 className="text-xl font-bold">{stats.totalProducts}</h2>
            <p className="text-gray-400">Total Products</p>
          </div>

          <div className="bg-gray-800 shadow rounded-xl p-6 text-center">
            <p className="text-3xl">📦</p>
            <h2 className="text-xl font-bold">{stats.totalOrders}</h2>
            <p className="text-gray-400">Total Orders</p>
          </div>

          <div className="bg-gray-800 shadow rounded-xl p-6 text-center">
            <p className="text-3xl">⏳</p>
            <h2 className="text-xl font-bold">{stats.pendingOrders}</h2>
            <p className="text-gray-400">Pending Orders</p>
          </div>

          <div className="bg-gray-800 shadow rounded-xl p-6 text-center relative">
            <p className="text-3xl">👤</p>
            <h2 className="text-xl font-bold">{stats.totalCustomers}</h2>
            <p className="text-gray-400">Total Customers</p>

            {/* small reviews count badge */}
            <div className="absolute top-2 right-3">
              <div className="bg-blue-500 text-xs px-2 py-1 rounded-full">
                ⭐ {reviews.length}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews feed with actions */}
        <div className="mt-8 bg-gray-800 p-4 rounded-xl shadow-lg max-h-72 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-blue-400">📢 Latest Reviews (newest first)</h2>
            <div className="flex items-center gap-2">
              {reviews.length > 0 && (
                <button onClick={clearAllReviews} className="bg-red-600 text-white py-1 px-3 rounded hover:bg-red-700 text-sm">Clear All</button>
              )}
            </div>
          </div>

          {reviews.length === 0 ? (
            <p className="text-gray-400">No reviews yet.</p>
          ) : (
            <ul className="space-y-3">
              {reviews.map((rev, i) => (
                <li key={i} className="bg-gray-700 p-3 rounded-lg shadow text-sm flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-green-300">{reviewName(rev)}</p>
                    <p className="text-gray-200 mt-1">{reviewText(rev)}</p>
                    {/* optionally show rating if present */}
                    {typeof rev.rating === "number" && (
                      <p className="text-yellow-400 mt-1">
                        {"★".repeat(Math.max(0, Math.min(5, rev.rating)))}
                        {"☆".repeat(5 - Math.max(0, Math.min(5, rev.rating)))}
                      </p>
                    )}
                    {/* show date/time if present */}
                    {rev.time && <p className="text-xs text-gray-400 mt-1">{rev.time}</p>}
                  </div>

                  <div className="ml-4 flex flex-col gap-2">
                    <button
                      onClick={() => {
                        if (currentAdmin?.role === "superadmin") {
                          deleteReview(i);
                        } else {
                          showToast("You don’t have permission to delete reviews. Please contact a Super Admin.", "error");
                        }
                      }}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
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

    {/* Confirm Modal */}
    {confirmModal.show && (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
        <div className="bg-gray-800 p-6 rounded shadow text-gray-100 w-80">
          <p>{confirmModal.message}</p>
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={handleCancelConfirm}
              className="px-4 py-2 bg-gray-500 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);
}