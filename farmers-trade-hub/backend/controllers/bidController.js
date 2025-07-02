const db = require("../config/db");

// ➕ Place new bid
const placeBid = async (req, res) => {
  const { buyer_id, product_id, amount } = req.body;

  if (!buyer_id || !product_id || !amount) {
    return res.status(400).json({ message: "Missing bid fields." });
  }

  try {
    // Get current highest bid for the product
    const highestBidRes = await db.query(
      "SELECT MAX(amount) AS max_bid FROM bids WHERE product_id = $1",
      [product_id]
    );
    const maxBid = highestBidRes.rows[0].max_bid || 0;

    // Check if bid is greater than current highest
    if (Number(amount) <= Number(maxBid)) {
      return res.status(400).json({
        message: `Your bid must be higher than current highest bid (RWF ${maxBid})`,
      });
    }

    // Insert bid
    const result = await db.query(
      `INSERT INTO bids (buyer_id, product_id, amount) 
       VALUES ($1, $2, $3) RETURNING *`,
      [buyer_id, product_id, amount]
    );

    res.status(201).json({ message: "Bid placed!", bid: result.rows[0] });
  } catch (error) {
    console.error("Bid error:", error);
    res
      .status(500)
      .json({ message: "Failed to place bid", error: error.message });
  }
};

// 📄 Get all bids for a product
const getBidsForProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      `SELECT * FROM bids WHERE product_id = $1 ORDER BY amount DESC`,
      [id]
    );
    if (result.rows.length === 0) {
      return res
        .status(400)
        .json({ message: `There is no bid for this product place yet!` });
    }
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Get bids error:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch bids", error: error.message });
  }
};
const getAllBids = async (req, res) => {
  try {
    const results = await db.query(`SELECT * FROM bids`);
    if (results.rows.length === 0) {
      return res.status(400).json({ message: `There is no bid placed yet!` });
    }
    return res.status(200).json(results.rows);
  } catch (error) {
    console.error("failed to fetch", error);
    return res.status(500).json({ message: "failed to fetch data", error });
  }
};
// 📘 Get all bids placed by a specific buyer
const getBidsByBuyer = async (req, res) => {
  const { buyer_id } = req.params;

  try {
    const result = await db.query(
      `SELECT b.*, p.name AS product_name
         FROM bids b
         JOIN products p ON b.product_id = p.id
         WHERE b.buyer_id = $1
         ORDER BY b.created_at DESC`,
      [buyer_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No bids found for this buyer." });
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("getBidsByBuyer error:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch buyer bids", error: error.message });
  }
};

// 📘 Get all bids on products owned by a farmer
const getBidsByFarmer = async (req, res) => {
  const { farmer_id } = req.params;

  try {
    const result = await db.query(
      `SELECT b.*, p.name AS product_name, p.farmer_id
         FROM bids b
         JOIN products p ON b.product_id = p.id
         WHERE p.farmer_id = $1
         ORDER BY b.created_at DESC`,
      [farmer_id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No bids found for this farmer." });
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("getBidsByFarmer error:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch farmer bids", error: error.message });
  }
};

module.exports = {
  getAllBids,
  placeBid,
  getBidsForProduct,
  getBidsByBuyer,
  getBidsByFarmer,
};
