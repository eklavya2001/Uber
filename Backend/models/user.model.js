const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const twilio = require("twilio");
const nodemailer = require("nodemailer");

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

//USER SCHEMA
const userSchema = new mongoose.Schema(
  {
    fullname: {
      firstname: {
        type: String,
        required: true,
        minlength: [3, "First name must be at least 3 characters long"],
      },
      lastname: {
        type: String,

        minlength: [3, "Last name must be at least 3 characters long"],
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      minlength: [5, "Email must be 5 characters long"],
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    phone: {
      type: String,
      unique: true,
    },
    otp: {
      type: String,
      select: false,
    },
    otpExpires: {
      type: Date,
      select: false,
    },
    isVerified: {
      type: Boolean,
    },
    socketId: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET);
  return token;
};

userSchema.methods.verifyAuthToken = function (token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { success: true, payload: decoded };
  } catch (error) {
    return { success: false, msg: "Invalid or Expired Token" };
  }
};

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.statics.hashPassword = async function (password) {
  return await bcrypt.hash(password, 10);
};

userSchema.methods.generateOtp = async function () {
  const otp = crypto.randomInt(100000, 999999).toString(); //optional to use crypto i guess
  const hashedOtp = await bcrypt.hash(otp, 10); // hashing the otp

  this.otp = otp;
  this.otpExpires = Date.now() + 5 * 60 * 1000; //otp valid for 5 minutes

  await this.save();
  return otp; //return plain otp
};

userSchema.methods.verifyOtp = async function (otp) {
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

userSchema.methods.sendEmailOtp = async function (otp) {
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

userSchema.methods.sendSmsOtp = async function (otp) {
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

const userModel = mongoose.model("User", userSchema);
module.exports = userModel;

//2
// rfwl nkej mxlo snyu
