// backend/controllers/userController.js
const db = require("../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const {
  createUser,
  getUserByEmail,
  getAllUsers: getAllUsersModel,
} = require("../models/user");

// Register a new user
const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, location } = req.body;

    const isUserExists = await getUserByEmail(email);
    if (isUserExists) {
      return res.status(400).json({ message: "User already exists!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await createUser(
      name,
      email,
      hashedPassword,
      role,
      phone,
      location
    );

    res.status(201).json({
      message: `User registered successfully.`,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Registration failed: " + error.message });
  }
};

// Login a user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "360d" }
    );

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        location: user.location,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Login failed: " + error.message });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await getAllUsersModel();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to get users: " + error.message });
  }
};

module.exports = { register, login, getAllUsers };
