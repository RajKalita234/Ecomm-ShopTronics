const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");   //  cookie-parser is a middleware which parses cookies attached to the client request object.

const errorMiddleware = require("./middleware/error")

app.use(express.json());
app.use(cookieParser());
// Route Imports
const product = require("./routes/productRoute");
const user = require("./routes/userRoute");

app.use("/api/v1", product);
app.use("/api/v1", user);       // user has 2 routes register and login.

// Middleware for Errors
app.use(errorMiddleware);   // used to detect errors and display meaningful error messages.

module.exports = app