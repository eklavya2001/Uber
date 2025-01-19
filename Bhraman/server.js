// const http = require("http");
// const app = require("./app");
// const { Server } = require("socket.io");
// const cors = require("cors");
// const port = process.env.PORT || 3000;
// const rideController = require("./controllers/ride.controller");
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: process.env.FRONTEND_BASE_URL,
//     methods: ["GET", "POST"],
//   },
// });
// io.on("connection", (socket) => {
//   console.log(`A user connected x : ${socket.id}`);

//   socket.on("disconnect", () => {
//     console.log(`user disconnected x ${socket.id}`);
//   });
// });

// rideController.init(io);
// rideController.handleRideRequest(io);
// rideController.handleAcceptRide(io);
// rideController.handleLiveLocation(io);
// rideController.handleCancelRideCaptain(io);
// rideController.handleCancelRideUser(io);

// server.listen(port, () => {
//   console.log(`server is running on PORT :  ${port}`);
// });

// module.exports = { io };
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");

const cors = require("cors");
const app = express();
const http = require("http");
const path = require("path");

const { Server } = require("socket.io");
const cookieParser = require("cookie-parser");

const port = process.env.PORT || 3000;

const server = http.createServer(app);

const connectToDb = require("./db/db");
const userRouter = require("./routes/user.routes");
const captainRouter = require("./routes/captain.routes");
const paymentRouter = require("./routes/payment");

const rideController = require("./controllers/ride.controller");
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_BASE_URL,
    methods: ["GET", "POST"],
  },
});

connectToDb();
io.on("connection", (socket) => {
  console.log(`A user connected x : ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`user disconnected x ${socket.id}`);
  });
});

app.use(
  cors({
    origin: [process.env.FRONTEND_BASE_URL], // Your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Required for cookies/sessions
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false })); // Parse URL-encoded bodies

app.use("/user", userRouter);
app.use("/captain", captainRouter);
app.use("/api", paymentRouter);

rideController.init(io);
rideController.handleRideRequest(io);
rideController.handleAcceptRide(io);
rideController.handleLiveLocation(io);
rideController.handleCancelRideCaptain(io);
rideController.handleCancelRideUser(io);

app.use(express.static(path.join(__dirname, "./Frontend/dist")));

// **6. React Routing Fallback**
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "./Frontend/dist", "index.html"));
});

app.listen(port, () => {
  console.log(`server is running on PORT :  ${port}`);
});
