const express = require("express");

const cors = require("cors");

const cookieParser = require("cookie-parser");

const globalErrorHandler = require("./middlewares/globalErrorHandler");


// Routes

const categoryRoute = require("./routes/category.route");

const authRoute = require("./routes/auth.route");

const eventRoute = require("./routes/event.route");

const bookingRoute = require("./routes/booking.route");

const paymentRoute = require("./routes/payment.route");

const reviewRoute = require("./routes/review.route");

const notificationRoute = require("./routes/notification.route");

const dashboardRoute = require("./routes/dashboard.route");

const userRoutes = require("./routes/user.route");

const adminRoute = require("./routes/admin.route");

const attendanceRoutes = require("./routes/attendance.route");

const refundRoutes = require("./routes/refund.route");

const uploadRoute = require("./routes/upload.route");

const { startRefundJob } = require("./jobs/refund.job");

const aiRoutes = require("./routes/ai.route");


const app = express();


// Middlewares

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());


// API Routes

app.use("/api/v1/auth", authRoute);

app.use("/api/v1/users", userRoutes);

app.use("/api/v1/events", eventRoute);

app.use("/api/v1/categories", categoryRoute);

app.use("/api/v1/bookings", bookingRoute);

app.use("/api/v1/payments", paymentRoute);

app.use("/api/v1/reviews", reviewRoute);

app.use("/api/v1/notifications", notificationRoute);

app.use("/api/v1/dashboard", dashboardRoute);

app.use("/api/v1/admin", adminRoute);

app.use("/api/v1/attendance", attendanceRoutes);

app.use("/api/v1/refunds", refundRoutes);

app.use("/api/v1/upload", uploadRoute);

app.use( "/api/v1/ai", aiRoutes);


// Home Route

app.get("/", (req, res) => {

  res.json({

    success: true,

    message: "EventEase API Running Successfully",

  });

});


// Global Error Handler

app.use(globalErrorHandler);


module.exports = app;