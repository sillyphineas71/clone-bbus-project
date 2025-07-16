require("dotenv").config();

const express = require("express");
const sequelize = require("./config/database-connect");
const cors = require("cors");
const bodyParser = require("body-parser");
const models = require("./model");

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

// Middleware
app.use("/user", require("./routes/userRoutes"));
app.use("/auth", require("./routes/authRoutes"));
app.use("/parent", require("./routes/parentRoutes"));

// Error handling middleware
app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const errors = error.data;
  res.status(status).json({ message: message, errors: errors });
});

// Connect to PostgreSQL
sequelize
  .authenticate()
  .then(() => {
    console.log("Connected to PostgreSQL successfully");
    return sequelize.sync();
  })
  .then(() => {
    // Start server
    app.listen(8090, () => {
      console.log("Server running on http://localhost:8090");
    });
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });
