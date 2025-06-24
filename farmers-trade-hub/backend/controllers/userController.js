// backend/controllers/userController.js
const db = require("../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const {
  createUser,
  getUserByEmail,
  getAllUsers: getAllUsersModel,
} = require("../models/user");

const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, location } = req.body;
    const isUserExists = await getUserByEmail(email);
    if (isUserExists)
      return res.status(400).json({ message: "User Already Exists!" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await createUser(
      name,
      email,
      hashedPassword,
      role,
      phone,
      location
    );
    res
      .status(401)
      .json({
        message: `The user with ${user.id} registred successfull`,
        user,
      });
  } catch (error) {
    res.status(500).json({ message: "Registration failed " + error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await getUserByEmail(email);
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(400)
        .json({ message: "The invalid email or password!" });
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "360d" }
    );
    return res.json({
      token,
      user: { id: user.id, name: user.name, role: user.role },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "The failed login " + error.message });
  }
};
const getAllUsers = async (req, res) => {
  try {
    const user = await getAllUsersModel();
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Failed to get users: " + error.message });
  }
};

module.exports = { register, login, getUserByEmail, getAllUsers };
