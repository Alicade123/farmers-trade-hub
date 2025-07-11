const express = require("express");
const router = express.Router();
const multer = require("multer");

const [
  createProduct,
  getAllProducts,
  getProductByFarmerId,
  getProductById,
  getProductImage,
  updateProduct,
  updateProductImage,
  closeBiddingManually,
] = require("../controllers/productController");

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/post", upload.single("image"), createProduct);
router.get("", getAllProducts);
router.get("/farmer/:id", getProductByFarmerId);
router.get("/:id", getProductById);
router.get("/bid/:id", getProductById);
router.get("/image/:id", getProductImage);
router.put("/:id", updateProduct);
router.put("/:id/image", upload.single("image"), updateProductImage);
router.put("/:id/close-bidding", closeBiddingManually);
module.exports = router;
