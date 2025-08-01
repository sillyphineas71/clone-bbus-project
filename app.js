require("dotenv").config();

const express = require("express");
const sequelize = require("./config/database-connect");
const cors = require("cors");
const bodyParser = require("body-parser");
const models = require("./model");
const http = require("http");

console.log("ENV S3_BUCKET=", process.env.S3_BUCKET);
console.log("ENV AWS_REGION=", process.env.AWS_REGION);

const app = express();

// Allow JSON parsing
app.use(
  bodyParser.json({
    limit: "10mb",
  })
);

// Allow text parsing
app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

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
app.use("/student", require("./routes/studentRoutes"));
app.use("/parent", require("./routes/parentRoutes"));
app.use("/driver", require("./routes/driverRoutes"));
app.use("/assistant", require("./routes/assistantRoutes"));
app.use("/bus", require("./routes/busRoutes"));
app.use("/bus-schedule", require("./routes/busScheduleRoutes"));
app.use("/event", require("./routes/eventRoutes"));
app.use("/checkpoint", require("./routes/checkpointRoutes"));
app.use("/dashboard", require("./routes/dashboardRoutes"));
app.use("/route", require("./routes/routeRoutes"));
app.use("/request-type", require("./routes/requestTypeRoute"));
app.use("/request", require("./routes/requestRoutes"));

// Error handling middleware
app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  res.status(status).json({
    timestamp: new Date().toISOString(),
    status,
    path: req.originalUrl,
    error: http.STATUS_CODES[status] || "Error",
    message: error.message,
    details: error.data || {},
  });
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
