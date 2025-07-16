// backend/routes/userRoutes.js
const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getAllUsers,
  updateUser,
  changePassword,
  uploadProfileImage,
  upload,
} = require("../controllers/userController");

router.post("/register", register);
router.post("/login", login);
router.get("", getAllUsers);
router.put("/:id", updateUser);
router.put("/:id/password", changePassword);
router.put(
  "/:id/profile-img",
  upload.single("profile_img"),
  uploadProfileImage
);
module.exports = router;
