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
  if (!farmer_id)
    res.status(400).json({ message: `id:${farmer_id} doesn't exist` });
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

const getProductByFarmerId = async (req, res) => {
  const farmer_id = Number(req.params.id);
  if (isNaN(farmer_id)) {
    return res.status(400).json({ message: "Invalid farmer ID" });
  }
  try {
    const results = await db.query(
      `SELECT id, farmer_id,
        name,
        category,
        description,
        quantity,
        price,
        expiry_date FROM products WHERE farmer_id= $1`,
      [farmer_id]
    );
    return res.status(200).json(results.rows);
  } catch (error) {
    console.error("Failed to fetch products by Farmer_id", error);
    res
      .status(500)
      .json({ message: `failed to fetch products by farmer_id, ${error}` });
  }
};

const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const results = await db.query(`SELECT * FROM products WHERE id = $1`, [
      id,
    ]);
    if (results.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.status(200).json(results.rows[0]);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch product", error: error.message });
  }
};

const getProductImage = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query("SELECT image FROM products WHERE id = $1", [
      id,
    ]);
    if (result.rows.length === 0 || !result.rows[0].image) {
      return res.status(404).send("Image not found");
    }

    res.setHeader("Content-Type", "image/jpg");
    res.end(Buffer.from(result.rows[0].image), "binary");
  } catch (error) {
    console.error("Error retrieving image:", error);
    res.status(500).send("Error retrieving image");
  }
};

//Update Product Function
const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, category, description, quantity, price, expiry_date } =
    req.body;

  try {
    const existing = await db.query(`SELECT * FROM products WHERE id = $1`, [
      id,
    ]);
    if (existing.rows.length === 0) {
      return res
        .status(400)
        .json({ message: `Product with id:${id} not found.` });
    }

    const fields = [];
    const values = [];
    let index = 1;

    if (name) {
      fields.push(`name = $${index++}`);
      values.push(name);
    }
    if (category) {
      fields.push(`category = $${index++}`);
      values.push(category);
    }
    if (description) {
      fields.push(`description = $${index++}`);
      values.push(description);
    }
    if (quantity) {
      fields.push(`quantity = $${index++}`);
      values.push(quantity);
    }
    if (price) {
      fields.push(`price = $${index++}`);
      values.push(price);
    }
    if (expiry_date) {
      fields.push(`expiry_date = $${index++}`);
      values.push(expiry_date);
    }

    if (fields.length === 0) {
      return res.status(400).json({ message: "No fields to update." });
    }

    values.push(id);
    const query = `
      UPDATE products
      SET ${fields.join(", ")}
      WHERE id = $${index}
      RETURNING *`;

    const result = await db.query(query, values);

    res.status(200).json({
      message: "Product updated successfully",
      product: result.rows[0],
    });
  } catch (error) {
    console.error("Product update error:", error);
    res.status(500).json({
      message: "Failed to update product",
      error: error.message,
    });
  }
};

const updateProductImage = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: "No image file uploaded." });
    }

    const imageBuffer = req.file.buffer;

    // Check if product exists
    const existing = await db.query(`SELECT * FROM products WHERE id = $1`, [
      id,
    ]);
    if (existing.rows.length === 0) {
      return res
        .status(404)
        .json({ message: `Product with id:${id} not found.` });
    }

    // Update image
    const result = await db.query(
      `UPDATE products SET image = $1 WHERE id = $2 RETURNING *`,
      [imageBuffer, id]
    );

    res.status(200).json({
      message: "Product image updated successfully",
      product: result.rows[0],
    });
  } catch (error) {
    console.error("Image update error:", error);
    res
      .status(500)
      .json({ message: "Failed to update image", error: error.message });
  }
};

const closeBiddingManually = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query("UPDATE products SET bidding_closed = TRUE WHERE id = $1", [
      id,
    ]);
    res.status(200).json({ message: "Bidding closed manually." });
  } catch (error) {
    console.error("Manual bidding close error:", error.message);
    res.status(500).json({ message: "Failed to close bidding" });
  }
};

module.exports = [
  createProduct,
  getAllProducts,
  getProductByFarmerId,
  getProductById,
  getProductImage,
  updateProduct,
  updateProductImage,
  closeBiddingManually,
];
