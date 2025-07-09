const express = require("express");
const router = express.Router();

const {
  placeBid,
  getBidsForProduct,
  getAllBids,
  getBidsByBuyer,
  getBidsByFarmer,
  declareWinner,
  getFarmerWinners,
} = require("../controllers/bidController");

router.post("/placeBid", placeBid);
router.get("/product/:id", getBidsForProduct);
router.get("", getAllBids);
router.get("/buyer/:buyer_id", getBidsByBuyer);
router.get("/farmer/:farmer_id", getBidsByFarmer);
router.post("/declare-winner", declareWinner);
router.get("/winners/:farmer_id", getFarmerWinners);

module.exports = router;
