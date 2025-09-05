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

  // Load admins from localStorage
  const admins = JSON.parse(localStorage.getItem("admins")) || [];

  // ✅ Super Admin credentials (from Vite .env file)
  const superAdmin = {
    id: import.meta.env.VITE_SUPERADMIN_ID,
    email: import.meta.env.VITE_SUPERADMIN_EMAIL,
    password: import.meta.env.VITE_SUPERADMIN_PASSWORD,
    role: "superadmin",
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // ✅ Super Admin login
    if (
      adminId === superAdmin.id &&
      adminEmail === superAdmin.email &&
      adminPassword === superAdmin.password
    ) {
      localStorage.setItem("currentAdmin", JSON.stringify(superAdmin));
      alert("Super Admin login successful!");
      navigate("/AdminDashboard");
      return;
    }

    // ✅ Normal Admin login
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
      alert("Admin login successful!");
      navigate("/AdminDashboard");
    } else {
      alert("Invalid ID, email, or password!");
    }
  };

  // --- Forgot Password Handlers ---
  const handleSendCode = async () => {
    try {
      const res = await fetch("http://localhost:5000/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setStep(2);
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Error sending reset code");
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
        alert(data.message);
        setStep(3);
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Error verifying code");
      console.error(err);
    }
  };

  const handleResetPassword = () => {
    // Since backend doesn’t yet handle saving new password,
    // we’ll update it in localStorage (admins array).
    let updatedAdmins = admins.map((a) =>
      a.email === resetEmail ? { ...a, password: newPassword } : a
    );
    localStorage.setItem("admins", JSON.stringify(updatedAdmins));
    alert("Password reset successful! You can now log in.");
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
      {/* ✅ Transparent login box with responsive styles */}
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

        {/* ✅ Forgot Password Link */}
        <p
          onClick={() => setShowForgot(true)}
          className="mt-4 text-blue-300 text-center cursor-pointer hover:underline"
        >
          Forgot Password?
        </p>

        {/* ✅ Go Back Home Button */}
        <Link
          to="/"
          className="block mt-6 text-center w-full p-4 bg-gray-700 bg-opacity-70 hover:bg-gray-600 rounded-xl font-bold text-lg text-gray-200 transition"
        >
          ⬅ Go Back Home
        </Link>
      </div>

      {/* ✅ Forgot Password Modal */}
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
    </div>
  );
}
