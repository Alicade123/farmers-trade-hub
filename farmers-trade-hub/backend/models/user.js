// backend/models/User.js
const db = require("../config/db");

const createUser = async (name, email, password, role, phone, location) => {
  const query = `INSERT INTO users (name, email, password, role, phone, location) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`;
  const values = [name, email, password, role, phone, location];
  const results = await db.query(query, values);
  return results.rows[0];
};

const getUserByEmail = async (email) => {
  const results = await db.query(`SELECT * FROM users WHERE email=$1`, [email]);
  return results.rows[0];
};

const getAllUsers = async () => {
  const results = await db.query("SELECT * FROM users");
  return results.rows;
};
module.exports = { createUser, getUserByEmail, getAllUsers };
