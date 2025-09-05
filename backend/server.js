require("dotenv").config(); 
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

// --- Email Transporter (Gmail + App Password) ---
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, 
  },
});

// --- Multer setup for uploads ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });
app.use("/uploads", express.static("uploads"));

// --- In-memory store for reset codes ---
let resetCodes = {}; 
// Format: { "user@example.com": { code: 123456, expires: 1234567890 } }

// --- Routes ---

// ✅ Forgot Password (Send Code)
app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  const resetCode = Math.floor(100000 + Math.random() * 900000);

  resetCodes[email] = {
    code: resetCode,
    expires: Date.now() + 10 * 60 * 1000, // expires in 10 minutes
  };

  try {
    await transporter.sendMail({
      from: `"My Store" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset Code",
      text: `Your password reset code is: ${resetCode}`,
      html: `<h2>Password Reset</h2>
             <p>Your reset code is <b>${resetCode}</b></p>
             <p>This code will expire in 10 minutes.</p>`,
    });

    res.json({ message: "Reset code sent to email!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send reset email" });
  }
});

// ✅ Verify Reset Code
app.post("/verify-reset-code", (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ error: "Email and code are required" });
  }

  const record = resetCodes[email];
  if (!record) {
    return res.status(400).json({ error: "No reset request found for this email" });
  }

  if (Date.now() > record.expires) {
    delete resetCodes[email];
    return res.status(400).json({ error: "Code expired" });
  }

  if (parseInt(code) !== record.code) {
    return res.status(400).json({ error: "Invalid code" });
  }

  delete resetCodes[email];
  res.json({ message: "Code verified successfully!" });
});

// ✅ Profile Picture Upload
app.post("/upload", upload.single("profilePic"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  res.json({ imageUrl: `http://localhost:${port}/uploads/${req.file.filename}` });
});

// ✅ Root test route
app.get("/", (req, res) => {
  res.send("Backend is working!");
});

// --- Start Server ---
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
