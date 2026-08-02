const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// Routes
const authRoute = require("./routes/auth.route");
const eventRoute = require("./routes/event.route");

const app = express();

// Middlewares
app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

// API Routes
app.use("/api/v1/auth", authRoute);

app.use("/api/v1/events", eventRoute);

// Home Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "EventEase API Running Successfully",
  });
});

module.exports = app;