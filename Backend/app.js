const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const { Server, Socket } = require("socket.io");
const cors = require("cors");
const app = express();
const connectToDb = require("./db/db");
const userRouter = require("./routes/user.routes");
const captainRouter = require("./routes/captain.routes");
const paymentRouter = require("./routes/payment");
const cookieParser = require("cookie-parser");
// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:5173",
//     methods: ["GET", "POST"],
//   },
// });
app.use(
  cors({
    origin: [process.env.FRONTEND_BASE_URL], // Your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Required for cookies/sessions
  })
);

const path = require("path");

// Serve React's build files
app.use(express.static(path.join(__dirname, "../Frontend/dist")));

// Handle React routing by serving index.html for any unknown routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../Frontend/dist/index.html"));
});

// io.on("connection", (socket) => {
//   console.log(`A user connected : ${socket.id}`);

//   socket.on("disconnect", () => {
//     console.log(`user disconnected ${socket.id}`);
//   });
// });
connectToDb();

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello world");
});
app.use("/user", userRouter);
app.use("/captain", captainRouter);
app.use("/api", paymentRouter);

module.exports = app;
