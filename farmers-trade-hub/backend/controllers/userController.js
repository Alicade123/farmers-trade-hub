// backend/controllers/userController.js
const db = require("../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
// Upload middleware (Multer)
const multer = require("multer");

// Configure multer for image
const storage = multer.memoryStorage();
const upload = multer({ storage });
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
        profile_img: user.profile_img
          ? user.profile_img.toString("base64")
          : null,
        profile_img_mime: "image/png", // or store MIME type in DB and return it
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

// controllers/userController.js
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, phone, location, lat, lng } = req.body;

  try {
    const q = `
      UPDATE users
         SET name      = $1,
             phone     = $2,
             location  = $3,
             lat       = $4::double precision,
             lng       = $5::double precision,
             geom = CASE
                      WHEN $4 IS NOT NULL AND $5 IS NOT NULL
                      THEN ST_SetSRID(
                             ST_MakePoint($5::double precision, $4::double precision),
                             4326
                           )::geography
                      ELSE geom
                    END
       WHERE id = $6
       RETURNING id, name, email, role, phone, location,
                 lat, lng, created_at,
                 encode(profile_img,'base64') AS profile_img,
                 profile_img_mime;
    `;

    const { rows } = await db.query(q, [
      name,
      phone,
      location,
      lat, // raw values; casts happen in SQL
      lng,
      id,
    ]);

    if (rows.length === 0)
      return res.status(404).json({ message: "User not found." });

    res.json({
      message: "Profile updated successfully.",
      user: rows[0],
    });
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ message: "Failed to update user profile." });
  }
};

// Change Password
const changePassword = async (req, res) => {
  const { id } = req.params;
  const { oldPassword, newPassword } = req.body;

  try {
    const result = await db.query("SELECT password FROM users WHERE id = $1", [
      id,
    ]);
    if (result.rowCount === 0)
      return res.status(404).json({ message: "User not found." });

    const user = result.rows[0];
    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match)
      return res.status(400).json({ message: "Old password incorrect." });

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE users SET password = $1 WHERE id = $2", [
      hashed,
      id,
    ]);

    res.json({ message: "Password changed successfully." });
  } catch (err) {
    console.error("Password update error:", err.message);
    res.status(500).json({ message: "Failed to change password." });
  }
};

// Update Profile Image
// const uploadProfileImage = async (req, res) => {
//   const { id } = req.params;
//   if (!req.file) return res.status(400).json({ message: "No image uploaded." });

//   try {
//     await db.query("UPDATE users SET profile_img = $1 WHERE id = $2", [
//       req.file.buffer,
//       id,
//     ]);
//     res.json({ message: "Profile image updated successfully." });
//   } catch (err) {
//     console.error("Profile image upload error:", err.message);
//     res.status(500).json({ message: "Failed to upload image." });
//   }
// };

// PUT /users/:id/profile-img
const uploadProfileImage = async (req, res) => {
  const { id } = req.params;
  if (!req.file) return res.status(400).json({ message: "No image uploaded." });

  try {
    const q = `
      UPDATE users
         SET profile_img = $1,
             profile_img_mime = $2      
       WHERE id = $3
       RETURNING id,name,email,phone,location,role,created_at,
                 encode(profile_img,'base64') AS profile_img,
                 profile_img_mime;
    `;
    const {
      rows: [user],
    } = await db.query(q, [req.file.buffer, req.file.mimetype, id]);
    res.json({ user });
  } catch (err) {
    console.error("Profile image upload error:", err);
    res.status(500).json({ message: "Failed to upload image." });
  }
};

module.exports = {
  register,
  login,
  getAllUsers,
  updateUser,
  changePassword,
  uploadProfileImage,
  upload,
};
