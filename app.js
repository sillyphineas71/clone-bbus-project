const express = require("express");
const sequelize = require("./config/database-connect");
const cors = require("cors");
const bodyParser = require("body-parser");
const models = require("./model");
require("dotenv").config();

console.log("ENV S3_BUCKET=", process.env.S3_BUCKET);
console.log("ENV AWS_REGION=", process.env.AWS_REGION);

const app = express();

// Allow JSON parsing
app.use(bodyParser.json());

// Allow CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const errors = error.data;
  res.status(status).json({ message: message, errors: errors });
});

app.use("/user", require("./routes/UserRoutes"));

// Connect to PostgreSQL
sequelize
  .authenticate()
  .then(() => {
    console.log("Connected to PostgreSQL successfully");
    return sequelize.sync();
  })
  .then(() => {
    app.use("/user", require("./routes/UserRoutes"));

    // Start server
    app.listen(8090, () => {
      console.log("Server running on http://localhost:8090");
    });
  })
  .catch((err) => {
    console.error("Database connection error:", err.message);
  });
