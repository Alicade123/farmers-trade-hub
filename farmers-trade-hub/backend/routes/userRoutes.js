// backend/routes/userRoutes.js
const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getAllUsers,
} = require("../controllers/userController");

router.post("/register", register);
router.post("/login", login);
router.get("", getAllUsers);
module.exports = router;
