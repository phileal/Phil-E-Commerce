import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import adminImg from "../../assets/admin new istockphoto.com.jpeg";

export default function AdminLogin() {
  const [adminId, setAdminId] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1);

  const navigate = useNavigate();

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type }), 3000);
  };

  const admins = JSON.parse(localStorage.getItem("admins")) || [];

  const superAdmin = {
    id: import.meta.env.VITE_SUPERADMIN_ID,
    email: import.meta.env.VITE_SUPERADMIN_EMAIL,
    password: import.meta.env.VITE_SUPERADMIN_PASSWORD,
    role: "superadmin",
  };

  const handleSubmit = (e) => {
    e.preventDefault();

if (
  adminId === superAdmin.id &&
  adminEmail === superAdmin.email &&
  adminPassword === superAdmin.password
) {
  localStorage.setItem("currentAdmin", JSON.stringify(superAdmin));
  showToast("Super Admin login successful!", "success");

  // Wait 3 seconds, then navigate
  setTimeout(() => navigate("/AdminDashboard"), 3000);
  return;
}

const found = admins.find(
  (a) =>
    a.id === adminId &&
    a.email === adminEmail &&
    a.password === adminPassword
);

if (found) {
  localStorage.setItem(
    "currentAdmin",
    JSON.stringify({ ...found, role: "admin" })
  );
  showToast("Admin login successful!", "success");

  setTimeout(() => navigate("/AdminDashboard"), 2000);
} else {
  showToast("Invalid ID, email, or password!", "error");
}
  };

  const handleSendCode = async () => {
    try {
      const res = await fetch("http://localhost:5000/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message, "success");
        setStep(2);
      } else {
        showToast(data.error || "Failed to send code", "error");
      }
    } catch (err) {
      showToast("Error sending reset code", "error");
      console.error(err);
    }
  };

  const handleVerifyCode = async () => {
    try {
      const res = await fetch("http://localhost:5000/verify-reset-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail, code: resetCode }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message, "success");
        setStep(3);
      } else {
        showToast(data.error || "Invalid code", "error");
      }
    } catch (err) {
      showToast("Error verifying code", "error");
      console.error(err);
    }
  };

  const handleResetPassword = () => {
    let updatedAdmins = admins.map((a) =>
      a.email === resetEmail ? { ...a, password: newPassword } : a
    );
    localStorage.setItem("admins", JSON.stringify(updatedAdmins));
    showToast("Password reset successful! You can now log in.", "success");
    setShowForgot(false);
    setStep(1);
    setResetEmail("");
    setResetCode("");
    setNewPassword("");
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${adminImg})` }}
    >
      <div className="relative bg-opacity-60 backdrop-blur-md p-8 sm:p-10 rounded-3xl w-full max-w-md text-gray-200 shadow-2xl z-10 transform transition duration-300 hover:scale-105">
        <h2 className="text-3xl sm:text-4xl font-extrabold mb-8 text-blue-400 text-center">
          Admin Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            placeholder="ID"
            value={adminId}
            onChange={(e) => setAdminId(e.target.value)}
            className="w-full h-12 p-4 rounded-xl bg-gray-700 bg-opacity-70 text-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            className="w-full h-12 p-4 rounded-xl bg-gray-700 bg-opacity-70 text-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            className="w-full h-12 p-4 rounded-xl bg-gray-700 bg-opacity-70 text-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            required
          />
          <button
            type="submit"
            className="w-full h-12 bg-blue-500 hover:bg-blue-600 rounded-xl font-bold text-lg text-white transition"
          >
            Login
          </button>
        </form>

        <p
          onClick={() => setShowForgot(true)}
          className="mt-4 text-blue-300 text-center cursor-pointer hover:underline"
        >
          Forgot Password?
        </p>

        <Link
          to="/"
          className="block mt-6 text-center w-full p-4 bg-gray-700 bg-opacity-70 hover:bg-gray-600 rounded-xl font-bold text-lg text-gray-200 transition"
        >
          ⬅ Go Back Home
        </Link>
      </div>

      {showForgot && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-2xl w-full max-w-sm text-gray-200">
            {step === 1 && (
              <>
                <h3 className="text-xl font-bold mb-4">Forgot Password</h3>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full p-3 mb-4 rounded-xl bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400"
                />
                <button
                  onClick={handleSendCode}
                  className="w-full bg-blue-500 hover:bg-blue-600 p-3 rounded-xl font-bold"
                >
                  Send Reset Code
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <h3 className="text-xl font-bold mb-4">Enter Reset Code</h3>
                <input
                  type="text"
                  placeholder="Enter code"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  className="w-full p-3 mb-4 rounded-xl bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400"
                />
                <button
                  onClick={handleVerifyCode}
                  className="w-full bg-green-500 hover:bg-green-600 p-3 rounded-xl font-bold"
                >
                  Verify Code
                </button>
              </>
            )}

            {step === 3 && (
              <>
                <h3 className="text-xl font-bold mb-4">Reset Password</h3>
                <input
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-3 mb-4 rounded-xl bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400"
                />
                <button
                  onClick={handleResetPassword}
                  className="w-full bg-purple-500 hover:bg-purple-600 p-3 rounded-xl font-bold"
                >
                  Save New Password
                </button>
              </>
            )}

            <button
              onClick={() => {
                setShowForgot(false);
                setStep(1);
              }}
              className="mt-4 w-full p-3 bg-red-500 hover:bg-red-600 rounded-xl font-bold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ✅ Toast */}
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
    </div>
  );
}
