const express = require("express");
const router = express.Router();
const momoService = require("../services/momoservice");

// POST /api/payments/send
router.post("/send", async (req, res) => {
  const { phone, amount } = req.body;
  if (!phone || !amount)
    return res.status(400).json({ message: "Missing data" });

  try {
    const ref = await momoService.sendMoney(phone, amount);
    // TODO: Save to DB if needed
    res.json({ success: true, referenceId: ref });
  } catch (err) {
    console.log("Send Money Error:", err.response?.data || err.message);
    res.status(500).json({
      success: false,
      message: "Disbursement failed",
    });
  }
});



module.exports = router;
