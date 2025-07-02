const express = require("express");
const router = express.Router();

const {
  placeBid,
  getBidsForProduct,
  getAllBids,
  getBidsByBuyer,
  getBidsByFarmer,
} = require("../controllers/bidController");

router.post("/placeBid", placeBid);
router.get("/product/:id", getBidsForProduct);
router.get("", getAllBids);
router.get("/buyer/:buyer_id", getBidsByBuyer);
router.get("/farmer/:farmer_id", getBidsByFarmer);

module.exports = router;
