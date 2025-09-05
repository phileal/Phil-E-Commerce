import { useState } from "react";
import { useNavigate } from "react-router-dom";
import forgotBg from "../../assets/forgotpassword_unsplash.com.jpeg";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();

  const sendResetCode = async () => {
    try {
      const res = await fetch("http://localhost:5000/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        alert("Reset code sent to your email!");
        setStep(2);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  const verifyCode = async () => {
    try {
      const res = await fetch("http://localhost:5000/verify-reset-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        alert("Code verified! Please enter a new password.");
        setStep(3);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  const updatePassword = () => {
    let customers = JSON.parse(localStorage.getItem("customers")) || [];
    const customerIndex = customers.findIndex((c) => c.email === email);

    if (customerIndex === -1) {
      alert("No customer found with this email");
      return;
    }

    if (newPassword.length < 4) {
      alert("Password must be at least 4 characters.");
      return;
    }

    customers[customerIndex].password = newPassword;
    localStorage.setItem("customers", JSON.stringify(customers));

    alert("Password updated successfully!");
    navigate("/");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-900 text-white relative"
      style={{
        backgroundImage: `url(${forgotBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >

      {/* Card */}
      <div className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8">
        <h2 className="text-3xl font-extrabold text-center mb-6 text-blue-600">
          Forgot Password
        </h2>

        {step === 1 && (
          <>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-xl bg-gray-800/70 text-white placeholder-gray-400 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={sendResetCode}
              className="w-full bg-blue-500 hover:bg-blue-600 transition-colors p-3 rounded-xl font-bold mb-3"
            >
              Send Reset Code
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <input
              type="text"
              placeholder="Enter reset code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full p-3 rounded-xl bg-gray-800/70 text-white placeholder-gray-400 mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={verifyCode}
              className="w-full bg-green-500 hover:bg-green-600 transition-colors p-3 rounded-xl font-bold mb-3"
            >
              Verify Code
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 rounded-xl bg-gray-800/70 text-white placeholder-gray-400 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={updatePassword}
              className="w-full bg-purple-500 hover:bg-purple-600 transition-colors p-3 rounded-xl font-bold mb-3"
            >
              Update Password
            </button>
          </>
        )}

        {/* Back to Login */}
        <button
          onClick={() => navigate("/")}
          className="w-full bg-gray-700 hover:bg-gray-800 transition-colors p-3 rounded-xl font-bold mt-4"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}
