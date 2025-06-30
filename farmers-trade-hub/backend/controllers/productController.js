const db = require("../config/db");

const createProduct = async (req, res) => {
  const {
    farmer_id,
    name,
    category,
    description,
    quantity,
    price,
    expiry_date,
  } = req.body;
  const image = req.file ? req.file.buffer : "";
  try {
    const results = await db.query(
      `INSERT INTO products (
    farmer_id,
    name,
    category,
    description,
    quantity,
    price,
    image,
    expiry_date,
    created_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,now())  RETURNING *`,
      [
        farmer_id,
        name,
        category,
        description,
        quantity,
        price,
        image,
        expiry_date,
      ]
    );
    res.status(201).json({
      message: `The product uploaded successful`,
      product: results.rows[0],
    });
  } catch (error) {
    console.error("product insert error", error);
    res
      .status(500)
      .json({ message: "Product upload failed", error: error.message });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await db.query(`SELECT id, farmer_id,
        name,
        category,
        description,
        quantity,
        price,
      
        expiry_date FROM products`);
    return res.status(200).json(products.rows);
  } catch (error) {
    console.error("Error fetching products:", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch products", error: error.message });
  }
};
module.exports = [createProduct, getAllProducts];
    