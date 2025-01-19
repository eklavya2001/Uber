const captainModel = require("../models/captain.model");

const handleNearbyCaptains = async (req, res) => {
  try {
    const { location, vehicle } = req.body; // Assuming `vehicle` is sent in payload
    const { latitude, longitude } = location;
    console.log(latitude, longitude);
    const radius = 5; // in kilometers

    const nearbyDrivers = await captainModel.find({
      location: {
        $geoWithin: {
          $centerSphere: [[longitude, latitude], radius / 6378.1], // radius in radians
        },
      },
      // Filter by vehicle type
    });
    // console.log(nearbyDrivers);
    if (nearbyDrivers.length > 0) {
      return res.status(200).json({ nearbyDrivers });
    } else {
      return res.status(203).json({ msg: "No drivers found nearby." });
    }
  } catch (error) {
    console.error("Error fetching nearby drivers:", error);
    return res.status(500).json({ msg: "Internal server error." });
  }
};

let activeCaptains = [];
let riders = [];

function init(io) {
  io.on("connection", (socket) => {
    console.log(`New Connection a : ${socket.id}`);

    socket.on("captain-online", (data) => {
      const { captainId, location, vehicleType } = data;

      // Avoid duplicate entries for same captain
      activeCaptains = activeCaptains.filter(
        (captain) => captain.captainId !== captainId
      );

      // captainSocketId = socket.id;

      // Add captain to active list
      activeCaptains.push({
        socketId: socket.id,
        captainId,
        location,
        vehicleType,
      });

      console.log("Active Captains:", activeCaptains);

      // Emit update to connected clients (optional)
      // io.emit("update-active-captains", activeCaptains);
    });

    // Handle disconnection
    socket.on("captain-offline", () => {
      console.log(` captain bhai ${socket.id} disconnected`);
      activeCaptains = activeCaptains.filter(
        (captain) => captain.socketId !== socket.id
      );
      console.log("Updated Active Captains:", activeCaptains);
    });

    // socket.on("cancel-ride-user", (data) => {
    //   console.log("chal raha ha", data);

    //   io.to(socket.id).emit("cancel-ride-user", data);
    // });
  });
}

function findNearbyCaptains(point1, point2, radiusInKm) {
  const toRadians = (degrees) => (degrees * Math.PI) / 180;

  const earthRadius = 6371; // Radius of Earth in kilometers

  const lat1 = point1.latitude;
  const lon1 = point1.longitude;
  const lat2 = point2.latitude;
  const lon2 = point2.longitude;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = earthRadius * c; // Distance in km

  return distance <= radiusInKm;
}

function handleRideRequest(io) {
  const radiusInKm = 10;
  io.on("connection", (socket) => {
    console.log(`New Connection c : ${socket.id}`);

    socket.on("ride-request", (data) => {
      const { location, user } = data;

      const availableCaptains = activeCaptains.filter(
        (captain) =>
          captain.location &&
          captain.vehicleType === location.vehicle &&
          findNearbyCaptains(captain.location, location, radiusInKm)
      );
      console.log("captain bros", availableCaptains);
      if (availableCaptains.length > 0) {
        // Emit ride request to each available captain
        availableCaptains.forEach((captain) => {
          io.to(captain.socketId).emit("ride-request", {
            userSocketId: socket.id,
            user,
            location,
          });
        });

        socket.emit("ride-request-acknowledged", { status: "success" });
      } else {
        socket.emit("ride-request-failed", {
          message: "No drivers found nearby.",
        });
      }

      // socket.on("ride-accepted", (data) => {
      //   console.log(data.payload);
      //   const { rideDetails, payload, otp, userSocketId, time } = data;
      //   io.to(userSocketId).emit("ride-accepted", {
      //     rideDetails,
      //     payload,
      //     otp,
      //     userSocketId,
      //     time,
      //   });
      // });
    });
  });
}

function handleAcceptRide(io) {
  io.on("connection", (socket) => {
    console.log(`New Connection p : ${socket.id}`);

    socket.on("ride-accepted", (data) => {
      console.log("e wala ", data);
      const { rideDetails, payload, otp, userSocketId } = data;
      io.to(userSocketId).emit("ride-accepted", {
        rideDetails,
        payload,
        otp,
        userSocketId,
      });
    });
  });
}

function handleLiveLocation(io) {
  io.on("connection", (socket) => {
    console.log(`New Connection l : ${socket.id}`);

    socket.on("live-location", (data) => {
      // console.log("location data", data);
      const { latitude, longitude, userSocketId } = data;
      // console.log(latitude, longitude, userSocketId);
      io.to(userSocketId).emit("live-location", {
        latitude,
        longitude,
        userSocketId,
      });
    });
  });
}

function handleCancelRideCaptain(io) {
  io.on("connection", (socket) => {
    console.log(`New Connection s : ${socket.id}`);
    const isRideCancelled = true;

    socket.on("cancel-ride-captain", (data) => {
      console.log("user wa ka socket id", data);
      const { userSocketId } = data;
      io.to(userSocketId).emit("cancel-ride-captain", { isRideCancelled });
    });
  });
}

function handleCancelRideUser(io) {
  io.on("connection", (socket) => {
    console.log(`new connection ${socket.id} `);
    socket.on("cancel-ride-user", (data) => {
      console.log("chal raha ha", data);

      io.to(socket.id).emit("cancel-ride-user", data);
    });
  });
}

module.exports = {
  handleNearbyCaptains,
  init,
  handleRideRequest,
  handleAcceptRide,
  handleLiveLocation,
  handleCancelRideCaptain,
  handleCancelRideUser,
};
