const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const twilio = require("twilio");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const Tesseract = require("tesseract.js");
const fs = require("fs");
const path = require("path");

//TWILIO CONFIG
const client = new twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
//NODEMAILER CONFIG
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const captainSchema = new mongoose.Schema(
  {
    urlId: {
      type: String,
    },
    fullname: {
      firstname: {
        type: String,
        required: true,
        minLength: [3, "Firstname must be at least 3 characters long"],
      },
      lastname: {
        type: String,

        minLength: [3, "Lastname must be at least 3 characters long"],
      },
    },
    email: {
      type: String,
      requried: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    phone: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      select: false,
    },
    otpExpires: {
      type: Date,
      select: false,
    },
    socketId: {
      type: String,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
    },
    isVerified: {
      type: Boolean,
    },

    vehicle: {
      vehicleName: {
        type: String,
        // required: true,
      },
      color: {
        type: String,
        // required: true,
        minLength: [3, "Color must be at least 3 characters long"],
      },
      plateNo: {
        type: String,
        // required: true,
        minLength: [3, "Plate Number must be at least 3 characters long "],
      },
      plateImagePath: {
        type: String,
        // required: true,
      },
      capacity: {
        type: Number,
        // required: true,
        min: [1, "Capacity must be at least 1 "],
      },
      vehicleType: {
        type: String,
        // required: true,
        enum: ["car", "motorcycle", "auto"],
      },
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number], // [lat,long]
      },
    },
  },
  { timestamps: true }
);
//
captainSchema.index({ location: "2dsphere" });
//

captainSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
  return token;
};

captainSchema.methods.verifyAuthToken = function (token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { success: true, payload: decoded };
  } catch (error) {
    console.log("error", error);
    return { success: false, msg: "Invalid or Expired token" };
  }
};

captainSchema.statics.hashPassword = async function (password) {
  const hashedPassword = await bcrypt.hash(password, 10);
  return hashedPassword;
};

captainSchema.methods.comparePassword = async function (password) {
  const check = await bcrypt.compare(password, this.password);
  return check;
};

captainSchema.methods.generateOtp = async function () {
  const otp = crypto.randomInt(100000, 999999).toString(); //optional to use crypto i guess
  const hashedOtp = await bcrypt.hash(otp, 10); // hashing the otp

  this.otp = otp;
  this.otpExpires = Date.now() + 5 * 60 * 1000; //otp valid for 5 minutes

  await this.save();
  return hashedOtp; //return plain otp
};

captainSchema.methods.verifyOtp = async function (otp) {
  if (!this.otp || this.otpExpires || Date.now() > this.otpExpires) {
    return { success: false, message: "OTP is invalid or expired!" };
  }
  //compare the provided otp with the stored otp
  const isOtpValid = await bcrypt.compare(otp, this.otp);
  //If otp is incorrect
  if (!isOtpValid) {
    return { success: false, message: "Incorrect OTP" };
  }
  //Clear otp and expiration after succesful verification
  this.otp = undefined;
  this.otpExpires = undefined;
  // save changes
  await this.save();
  //return success message
  return { success: true, message: "OTP is valid" };
};

captainSchema.methods.sendEmailOtp = async function (otp) {
  if (!this.email) {
    return { success: false, message: "Email not provided" };
  }
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: this.email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}`,
    });
    console.log("Otp sent via email");
  } catch (error) {
    console.error("Failed to send Email OTP", error);
  }
};

captainSchema.methods.sendSmsOtp = async function (otp) {
  if (!this.phone) {
    return { success: false, msg: "Phone number not found" };
  }
  try {
    const formattedPhone = this.phone.startsWith("+")
      ? this.phone
      : `+${this.phone}`;
    await client.messages.create({
      body: `Your OTP is ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone,
    });
    console.log("OTP sent via SMS");
    return { success: true, msg: "OTP sent via SMS" };
  } catch (error) {
    console.error("Failed to send SMS OTP ");
    return { success: false, msg: "Failed to send SMS otp" };
  }
};

captainSchema.methods.checkPlateNo = async function (path, licNo) {
  try {
    const imagePath = path;
    const {
      data: { text },
    } = await Tesseract.recognize(imagePath, "eng", {
      logger: (m) => console.log(m),
    });

    const extractedPlate = text.replace("/s/g", "").toUpperCase();
    console.log(extractedPlate);

    if (extractedPlate.includes(licNo)) {
      // console.log("Plate number matched:", licNo);
      return { success: true, msg: "Plate Number Matched" };
    } else {
      // console.log("Plate number mismatch:", licNo);
      return { success: false, msg: "Plate Number Mismatch" };
    }
  } catch (error) {
    console.error("Error in checkPlateNo", error);
    return { success: false, msg: "Failed to verify image" };
  }
};

const captainModel = mongoose.model("Captain", captainSchema);
module.exports = captainModel;
