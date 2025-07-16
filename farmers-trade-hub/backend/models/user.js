// backend/models/User.js
const db = require("../config/db");

const createUser = async (name, email, password, role, phone, location) => {
  const query = `INSERT INTO users (name, email, password, role, phone, location) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`;
  const values = [name, email, password, role, phone, location];
  const results = await db.query(query, values);
  return results.rows[0];
};

// Get user by email
const getUserByEmail = async (email) => {
  const results = await db.query(
    `SELECT id, name, email, password, role, phone, location, created_at, profile_img,profile_img_mime FROM users WHERE email=$1`,
    [email]
  );

  if (results.rows.length === 0) return null;

  const user = results.rows[0];

  if (user.profile_img) {
    user.profile_img = user.profile_img.toString("base64");
  }

  return user;
};

const getAllUsers = async () => {
  const results = await db.query("SELECT * FROM users");
  return results.rows;
};
module.exports = { createUser, getUserByEmail, getAllUsers };
