const express = require("express");
const app = express();

const errorMiddleware = require("./middleware/error")

app.use(express.json())
// Route Imports
const productrouter = require("./routes/productRoute");

app.use("/api/v1", productrouter);

// Middleware for Errors
app.use(errorMiddleware);   // used to detect errors and display meaningful error messages.

module.exports = app