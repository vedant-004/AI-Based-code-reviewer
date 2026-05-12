// controllers/auth.controller.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authService = require("../services/auth.service");

module.exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return res.status(400).send("Name is required and must be at least 2 characters.");
    }
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).send("Valid email is required.");
    }
    if (!password || typeof password !== "string" || password.length < 6) {
      return res.status(400).send("Password must be at least 6 characters.");
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await authService.findUserByEmail(normalizedEmail);
    if (existingUser) return res.status(400).send("User already exists.");

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await authService.createUser({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    return res.status(201).json({ id: newUser.id, email: newUser.email, name: newUser.name });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).send("Registration failed");
  }
};

module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send("Email and password are required.");
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await authService.findUserByEmail(normalizedEmail);
    if (!user) return res.status(400).send("Invalid credentials.");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send("Invalid credentials.");

    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    return res.json({ token, email: user.email, name: user.name });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).send("Login failed");
  }
};

module.exports.authMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
  if (!token) return res.status(401).send("Access denied. No token provided.");

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("JWT verification failed:", err);
      return res.status(401).send("Invalid token.");
    }

    req.user = decoded;
    next();
  });
};
