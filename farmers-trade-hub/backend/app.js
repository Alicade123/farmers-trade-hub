//Backend/app.js

const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");

const app = express();

//Middleware
app.use(cors());
app.use(express.json());

//Routes
app.use("/api/users", userRoutes);

module.exports = app;
