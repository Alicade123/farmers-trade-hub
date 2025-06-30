const express = require("express");
const router = express.Router();
const multer = require("multer");

const [
  createProduct,
  getAllProducts,
] = require("../controllers/productController");

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/post", upload.single("image"), createProduct);
router.get("", getAllProducts);
module.exports = router;
