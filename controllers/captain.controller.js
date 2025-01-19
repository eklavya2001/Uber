const captainModel = require("../models/captain.model");
const blackListTokenModel = require("../models/blacklistToken.model");
const { validationResult } = require("express-validator");

async function handleRegisterCaptain(req, res) {
  try {
    const {
      email,
      password,
      firstname,
      lastname,
      phone,
      vehicleName,
      color,
      plateNo,
      capacity,
      vehicleType,
    } = req.body;
    if (
      !email ||
      !password ||
      !firstname ||
      !lastname ||
      !phone ||
      !vehicleName ||
      !color ||
      !plateNo ||
      !capacity ||
      !vehicleType
    ) {
      return res.status(400).json({ msg: "All fields are required" });
    }
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //   return res.status(400).json({ errors: errors.array() });
    // }
    const existingUser = await captainModel.findOne({ email });
    if (existingUser) {
      // If user exists but not verified, delete the unverified record
      if (!existingUser.isVerified) {
        await captainModel.deleteOne({ email });
      } else {
        return res.status(400).json({ msg: "Email already registered" });
      }
    }
    const hashedPassword = await captainModel.hashPassword(password);
    // const urlId = req.params;
    const newUser = await captainModel.create({
      fullname: { firstname, lastname },
      email,
      password: hashedPassword,
      phone,
      vehicle: {
        vehicleName,
        capacity,
        color,
        vehicleType,
        plateNo,
      },
    });
    console.log(newUser);

    const generatedOtp = await newUser.generateOtp();
    await newUser.sendEmailOtp(generatedOtp);
    await newUser.sendSmsOtp(generatedOtp);
    res.cookie("cap_id", newUser._id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Secure flag for HTTPS
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    });

    return res.status(200).json({
      msg: "otp sent successfully",
      captainId: newUser._id,
      isOtpSent: true,
    });
  } catch (error) {
    console.error("ERROR : -", error);
    res.status(400).json({ msg: "OTP not sent" });
  }
}

async function handleVerifyOtp(req, res) {
  try {
    const { otp } = req.body;
    if (!otp) {
      return res.json({
        msg: "Please enter your OTP! OTP is valid for 5 minutes only",
      });
    }

    const captain = await captainModel.findOne({ otp }).select("+otp");
    // const userOtp = user.otp;
    if (captain.otp == otp) {
      captain.otp = undefined;
      captain.otpExpires = undefined;
      captain.isVerified = true;
      await captain.save();

      return res.status(200).json({
        msg: "OTP has been verified,A new captain has been created successfully",
        captainId: captain._id,
      });
    } else {
      return res.status(400).json({ msg: "Invalid OTP" });
    }
  } catch (error) {
    console.log("error", error);

    res.status(401).json({ msg: "an error occured" });
  }
}

// async function handleVehicleAuthentication(req, res) {
//   try {
//     const { vehicleName, color, plateNo, capacity, vehicleType } = req.body;
//     const imagePath = req.file.path;
//     const _id = req.params.id;
//     const rider = await captainModel.findOne({ _id });
//     console.log(rider);

//     const payload = await rider.checkPlateNo(imagePath, plateNo);
//     console.log(payload);

//     if (payload && payload.success == true {
//       (rider.vehicle.vehicleName = vehicleName),
//         (rider.vehicle.color = color),
//         (rider.vehicle.capacity = capacity),
//         (rider.vehicle.vehicleType = vehicleType),
//         (rider.vehicle.plateNo = plateNo);
//       rider.isVerified = true;
//       await rider.save();
//       return res
//         .status(200)
//         .json({ success: true, msg: "Vehicle details updated successfully" });
//     }
//   } catch (error) {
//     console.error("error", error);
//     return res.status(400).json({ msg: "plate number mismatch" });
//   }
// }

async function handleCaptainLogin(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;

    const captain = await captainModel.findOne({ email }).select("+password");
    if (!captain) {
      return res.status(401).json({ msg: "Invalid email or password" });
    }
    // console.log(captain);
    // const hashedPassword = user.password
    if (captain.isVerified) {
      const passCheck = await captain.comparePassword(password);
      console.log(passCheck);

      if (passCheck) {
        const token = await captain.generateAuthToken();
        res.cookie("cap_uid", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production", // Secure flag for HTTPS
          sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        });

        await captain.save();
        return res.status(200).json({
          success: true,
          msg: "Auth token generated",
          payload: captain,
          isAuthenticated: true,
        });
      } else {
        return res
          .status(400)
          .json({ success: false, msg: "Wrong user credentials" });
      }
    } else {
      return res
        .status(400)
        .json({ success: false, msg: "captain not registered" });
    }
  } catch (error) {
    console.log("error", error);
    return res
      .status(400)
      .json({ success: false, msg: "error generating auth token" });
  }
}

async function handleCaptainLogout(req, res) {
  const token = req.cookies.cap_uid;
  await blackListTokenModel.create({
    token,
  });

  res.clearCookie("cap_uid"); // Clear the JWT token cookie
  res.status(200).json({ message: "Logout successful" });
}

async function handleGetCaptainProfile(req, res) {
  res.status(200).json(req.captain);
}

async function handleUpdateLocation(req, res) {
  try {
    const { payload } = req.body; // Extract payload from request body
    const { _id, latitude, longitude } = payload;

    if (!_id || latitude == null || longitude == null) {
      return res.status(400).json({ message: "Invalid payload data." });
    }

    // Update the location field
    const updatedCaptain = await captainModel.findByIdAndUpdate(
      { _id },
      {
        location: {
          type: "Point",
          coordinates: [longitude, latitude], // Ensure [longitude, latitude] order
        },
      },
      { new: true } // Return the updated document
    );

    if (!updatedCaptain) {
      return res.status(404).json({ message: "Captain not found." });
    }

    return res.status(200).json({
      message: "Location updated successfully.",
      data: updatedCaptain,
    });
  } catch (error) {
    console.error("Error updating location:", error);
    return res
      .status(500)
      .json({ message: "Server error.", error: error.message });
  }
}

async function handleDeleteLocation(req, res) {
  try {
    const { _id } = req.body;

    if (!_id) {
      return res
        .status(400)
        .json({ message: "Captain ID (_id) missing from request." });
    }

    const updatedCaptain = await captainModel.findByIdAndUpdate(
      _id,
      {
        $unset: { location: "" }, // Location field ko completely remove kar raha hai
      },
      { new: true } // Updated document return karega
    );

    if (!updatedCaptain) {
      return res.status(404).json({ message: "Captain not found." });
    }

    res.status(200).json({
      message: "Captain location reset successfully.",
      data: updatedCaptain,
    });
  } catch (error) {
    console.error("Error resetting location:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
}

// function init(io) {
//   io.on("connection", (socket) => {
//     console.log(`New Connection : ${socket.id}`);

//     socket.on("captain-online", (data) => {
//       const { captainId, location, vehicleType } = data;

//       // Avoid duplicate entries for same captain
//       activeCaptains = activeCaptains.filter(
//         (captain) => captain.captainId !== captainId
//       );

//       // Add captain to active list
//       activeCaptains.push({
//         socketId: socket.id,
//         captainId,
//         location,
//         vehicleType,
//       });

//       console.log("Active Captains:", activeCaptains);

//       // Emit update to connected clients (optional)
//       io.emit("update-active-captains", activeCaptains);
//     });

//     // Handle disconnection
//     socket.on("captain-offline", () => {
//       console.log(`Connection ${socket.id} disconnected`);
//       activeCaptains = activeCaptains.filter(
//         (captain) => captain.socketId !== socket.id
//       );
//       console.log("Updated Active Captains:", activeCaptains);
//     });
//   });
// }

module.exports = {
  handleCaptainLogin,
  handleRegisterCaptain,
  handleUpdateLocation,
  // handleVehicleAuthentication,
  handleVerifyOtp,
  handleCaptainLogout,
  handleGetCaptainProfile,
  handleDeleteLocation,
  // init,
};
