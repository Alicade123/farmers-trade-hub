const express = require("express");
const router = express.Router();

const {
  requestToPay,
  getPaymentStatus,
} = require("../controllers/momoController");

router.post("/pay", requestToPay);
router.get("/status/:referenceId", getPaymentStatus);

module.exports = router;
