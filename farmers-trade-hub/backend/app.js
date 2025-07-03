//Backend/app.js

const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const bidRoutes = require("./routes/bidRoutes");
const momoRoutes = require("./routes/momoRoutes");
const paymentRoutes = require("./routes/payments");
const app = express();

//Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/bids", bidRoutes);
app.use("/api/momo", momoRoutes);
app.use("/api/payments", paymentRoutes);
module.exports = app;
