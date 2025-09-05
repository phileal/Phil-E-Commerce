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

  // Sidebar toggle state
  const [menus, setMenus] = useState({
    productsMenu: false,
    ordersMenu: false,
    adminMenu: false,
    bankMenu: false,
    adminsList: false,
    usersList: false,
    profileMenu: false,
  });

  const [profilePic, setProfilePic] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  // Close sidebar when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (sidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen]);

  const toggleMenu = (id) => {
    setMenus((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    const admin = JSON.parse(localStorage.getItem("currentAdmin"));
    if (!admin) {
      navigate("/AdminLogin");
      return;
    }
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
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("currentAdmin");
    navigate("/AdminLogin");
  };

  const handleSaveBank = () => {
    const bankName = document.getElementById("bankName").value.trim();
    const accountName = document.getElementById("accountName").value.trim();
    const accountNumber = document.getElementById("accountNumber").value.trim();
    if (!bankName || !accountName || !accountNumber) {
      alert("Fill all fields");
      return;
    }
    localStorage.setItem(
      "superAdminBank",
      JSON.stringify({ bankName, accountName, accountNumber })
    );
    alert("Bank info saved!");
  };

  const handleCreateAdmin = () => {
    const id = document.getElementById("newAdminId").value.trim();
    const email = document.getElementById("newAdminEmail").value.trim();
    const password = document.getElementById("newAdminPassword").value.trim();
    if (!id || !email || !password) {
      alert("Fill all fields");
      return;
    }
    let admins = JSON.parse(localStorage.getItem("admins")) || [];
    if (admins.find((a) => a.id === id || a.email === email)) {
      alert("Admin exists");
      return;
    }
    admins.push({ id, email, password, role: "admin" });
    localStorage.setItem("admins", JSON.stringify(admins));
    setAdmins(admins);
    alert("Admin created!");
  };

  const handleCreateSuperAdmin = () => {
    const id = document.getElementById("newSuperAdminId").value.trim();
    const email = document.getElementById("newSuperAdminEmail").value.trim();
    const password = document.getElementById("newSuperAdminPassword").value.trim();
    if (!id || !email || !password) {
      alert("Fill all fields");
      return;
    }
    let admins = JSON.parse(localStorage.getItem("admins")) || [];
    if (admins.find((a) => a.id === id || a.email === email)) {
      alert("Admin already exists");
      return;
    }
    admins.push({ id, email, password, role: "superadmin" });
    localStorage.setItem("admins", JSON.stringify(admins));
    setAdmins(admins);
    alert("Super Admin created!");
  };

  const handleDeleteAdmin = (index) => {
    let updated = [...admins];
    updated.splice(index, 1);
    localStorage.setItem("admins", JSON.stringify(updated));
    setAdmins(updated);
  };

  const handleDeleteUser = (index) => {
    let updated = [...users];
    updated.splice(index, 1);
    localStorage.setItem("customers", JSON.stringify(updated));
    setUsers(updated);
  };

  // ✅ Handle profile pic upload only
  const handleProfilePicUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setProfilePic(reader.result);
      let updatedAdmin = { ...currentAdmin, profilePic: reader.result };
      localStorage.setItem("currentAdmin", JSON.stringify(updatedAdmin));

      let updatedAdmins = admins.map((a) =>
        a.id === currentAdmin.id ? updatedAdmin : a
      );
      localStorage.setItem("admins", JSON.stringify(updatedAdmins));
      setAdmins(updatedAdmins);
      setCurrentAdmin(updatedAdmin);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-900 text-gray-100">
      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed md:static z-20 inset-y-0 left-0 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 ease-in-out w-72 bg-gray-800 p-6 flex flex-col`}
      >
        <h2 className="text-2xl font-bold text-blue-400 mb-6">Admin Panel</h2>

        <nav className="flex-1 space-y-2">
          {/* ✅ Profile Section */}
          <div>
            <button
              onClick={() => toggleMenu("profileMenu")}
              className="w-full text-left py-2 px-3 rounded-lg hover:bg-gray-700"
            >
              Profile ▾
            </button>
            {menus.profileMenu && (
              <div className="pl-4 mt-1 space-y-2">
                <div>
                  <label className="block text-sm">Change Picture</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePicUpload}
                    className="w-full text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Products */}
          <div>
            <button
              onClick={() => toggleMenu("productsMenu")}
              className="w-full text-left py-2 px-3 rounded-lg hover:bg-gray-700"
            >
              Products ▾
            </button>
            {menus.productsMenu && (
              <div className="pl-4 mt-1 space-y-1">
                <Link to="/AddProduct" className="block py-2 px-3 rounded-lg hover:bg-gray-700">
                  Add Product
                </Link>
                <Link to="/ViewProducts" className="block py-2 px-3 rounded-lg hover:bg-gray-700">
                  View Products
                </Link>
              </div>
            )}
          </div>

          {/* Orders */}
          <div>
            <button
              onClick={() => toggleMenu("ordersMenu")}
              className="w-full text-left py-2 px-3 rounded-lg hover:bg-gray-700"
            >
              Orders ▾
            </button>
            {menus.ordersMenu && (
              <div className="pl-4 mt-1 space-y-1">
                <Link to="/PendingOrders" className="block py-2 px-3 rounded-lg hover:bg-gray-700">
                  Pending Orders
                </Link>
                <Link to="/CompleteOrders" className="block py-2 px-3 rounded-lg hover:bg-gray-700">
                  Completed Orders
                </Link>
              </div>
            )}
          </div>

          {/* Admin Tools */}
          <div className="mt-4">
            <button
              onClick={() => toggleMenu("adminMenu")}
              className="w-full text-left py-2 px-3 rounded-lg hover:bg-gray-700"
            >
              Admin Tools ▾
            </button>

            {menus.adminMenu && (
              <div className="pl-4 mt-1 space-y-2">
                {currentAdmin?.role === "superadmin" && (
                  <>
                    {/* Bank Info */}
                    <div>
                      <button
                        onClick={() => toggleMenu("bankMenu")}
                        className="w-full text-left py-2 px-3 rounded-lg hover:bg-gray-700"
                      >
                        Super Admin Bank Info ▾
                      </button>
                      {menus.bankMenu && (
                        <div className="pl-4 mt-1 space-y-1">
                          <input type="text" id="bankName" placeholder="Bank Name" className="w-full p-2 rounded bg-gray-700 mb-1" />
                          <input type="text" id="accountName" placeholder="Account Name" className="w-full p-2 rounded bg-gray-700 mb-1" />
                          <input type="text" id="accountNumber" placeholder="Account Number" className="w-full p-2 rounded bg-gray-700 mb-1" />
                          <button onClick={handleSaveBank} className="w-full py-2 bg-blue-500 rounded hover:bg-blue-600">
                            Save Bank Info
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Create Admin */}
                    <div>
                      <input type="text" id="newAdminId" placeholder="Admin ID" className="w-full p-2 rounded bg-gray-700 mb-1" />
                      <input type="email" id="newAdminEmail" placeholder="Admin Email" className="w-full p-2 rounded bg-gray-700 mb-1" />
                      <input type="password" id="newAdminPassword" placeholder="Admin Password" className="w-full p-2 rounded bg-gray-700 mb-1" />
                      <button onClick={handleCreateAdmin} className="w-full py-2 bg-green-500 rounded hover:bg-green-600">
                        Create Admin
                      </button>
                    </div>

                    {/* Create Super Admin */}
                    <div className="mt-4">
                      <input type="text" id="newSuperAdminId" placeholder="Super Admin ID" className="w-full p-2 rounded bg-gray-700 mb-1" />
                      <input type="email" id="newSuperAdminEmail" placeholder="Super Admin Email" className="w-full p-2 rounded bg-gray-700 mb-1" />
                      <input type="password" id="newSuperAdminPassword" placeholder="Super Admin Password" className="w-full p-2 rounded bg-gray-700 mb-1" />
                      <button onClick={handleCreateSuperAdmin} className="w-full py-2 bg-purple-500 rounded hover:bg-purple-600">
                        Create Super Admin
                      </button>
                    </div>

                    {/* Manage Admins */}
                    <div>
                      <button
                        onClick={() => toggleMenu("adminsList")}
                        className="w-full text-left py-2 px-3 rounded-lg hover:bg-gray-700"
                      >
                        Manage Admins ▾
                      </button>
                      {menus.adminsList && (
                        <div className="pl-4 mt-1 space-y-1">
                          {admins.map((a, i) => (
                            <div key={i} className="flex justify-between items-center bg-gray-700 p-2 rounded">
                              <span>
                                {a.id} ({a.email}) [{a.role}]
                              </span>
                              <button
                                className="bg-red-500 px-2 py-1 rounded text-sm"
                                onClick={() => handleDeleteAdmin(i)}
                              >
                                Delete
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Manage Users */}
                <div>
                  <button
                    onClick={() => toggleMenu("usersList")}
                    className="w-full text-left py-2 px-3 rounded-lg hover:bg-gray-700"
                  >
                    Manage Users ▾
                  </button>
                  {menus.usersList && (
                    <div className="pl-4 mt-1 space-y-1">
                      {users.map((u, i) => (
                        <div key={i} className="flex justify-between items-center bg-gray-700 p-2 rounded">
                          <span>{u.name || u.email || "User"}</span>
                          <button
                            className="bg-red-500 px-2 py-1 rounded text-sm"
                            onClick={() => handleDeleteUser(i)}
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="mt-6 w-full py-2 px-3 bg-red-500 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:ml-0 ml-0">
        {/* Hamburger for mobile */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden mb-4 p-2 bg-gray-800 text-white rounded"
        >
          ☰ Menu
        </button>

        <div className="flex items-center gap-6 mb-6 flex-wrap">
          {/* ✅ Show profile pic next to greeting, bigger */}
          {currentAdmin?.profilePic ? (
            <img
              src={currentAdmin.profilePic}
              alt="Profile"
              className="w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-blue-400 object-cover"
            />
          ) : (
            <div className="w-28 h-28 md:w-36 md:h-36 flex items-center justify-center rounded-full bg-gray-700 border-4 border-gray-500 text-4xl">
              👤
            </div>
          )}

          <h1 className="text-2xl md:text-3xl font-bold text-blue-400">
            {currentAdmin?.role === "superadmin"
              ? `Welcome Super Admin, ${currentAdmin?.id}`
              : `Welcome Admin, ${currentAdmin?.id}`}
          </h1>
        </div>

        {/* Dashboard Summary */}
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

          <div className="bg-gray-800 shadow rounded-xl p-6 text-center">
            <p className="text-3xl">👤</p>
            <h2 className="text-xl font-bold">{stats.totalCustomers}</h2>
            <p className="text-gray-400">Total Customers</p>
          </div>
        </div>
      </main>
    </div>
  );
}
