const dotenv = require("dotenv");
// dotenv.config();
// const express = require("express");

// const cors = require("cors");
// const app = express();
// const connectToDb = require("./db/db");
// const userRouter = require("./routes/user.routes");
// const captainRouter = require("./routes/captain.routes");
// const paymentRouter = require("./routes/payment");
// const cookieParser = require("cookie-parser");
// const path = require("path");

// app.use(
//   cors({
//     origin: [process.env.FRONTEND_BASE_URL], // Your frontend URL
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//     credentials: true, // Required for cookies/sessions
//   })
// );

// connectToDb();

// app.use(express.json());
// app.use(cookieParser());
// app.use(express.urlencoded({ extended: false })); // Parse URL-encoded bodies

// app.use("/user", userRouter);
// app.use("/captain", captainRouter);
// app.use("/api", paymentRouter);

// app.use(express.static(path.join(__dirname, "./Frontend/dist")));

// // **6. React Routing Fallback**
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "./Frontend/dist", "index.html"));
// });
// module.exports = app;
