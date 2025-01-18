const http = require("http");
const app = require("./app");
const { Server, Socket } = require("socket.io");
const cors = require("cors");
const port = process.env.PORT || 3000;
const rideController = require("./controllers/ride.controller");
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});
io.on("connection", (socket) => {
  console.log(`A user connected x : ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`user disconnected x ${socket.id}`);
  });
});

rideController.init(io);
rideController.handleRideRequest(io);
rideController.handleAcceptRide(io);
rideController.handleLiveLocation(io);
rideController.handleCancelRideCaptain(io);
rideController.handleCancelRideUser(io);

server.listen(port, () => {
  console.log(`server is running on PORT :  ${port}`);
});

module.exports = { io };
