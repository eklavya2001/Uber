const userModel = require("../models/user.model");

async function handleRegisterUser(req, res) {
  try {
    const { email, password, firstname, lastname, phone } = req.body;
    if (!firstname || !lastname || !password || !email || !phone) {
      return res.status(400).json({ msg: "all fields are required" });
    }

    const hashedPassword = await userModel.hashPassword(password);

    // const hashedPassword = userModel.hashPassword(password);
    const newUser = await userModel.create({
      fullname: { firstname, lastname },
      email,
      password: hashedPassword,
      phone,
    });

    const otpGenerated = await newUser.generateOtp();

    // await newUser.sendEmailOtp(otpGenerated);
    // await newUser.sendSmsOtp(otpGenerated);
    // req.users_phone = newUser.phone;

    res.status(201).json({ msg: "A new user has been created successfully" });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ msg: "internal server error" });
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
    const user = await userModel.findOne({ otp });
    // const userOtp = user.otp;
    if (!user) {
      return res.status(400).json({ msg: "OTP didn't match" });
    }

    return res.status(200).json({
      msg: "OTP has been verified",
    });
  } catch (error) {
    console.log("error", error);

    res.status(401).json({ msg: "an error occured" });
  }
}

async function handleUserLogin(req, res) {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email }).select("+password");
    console.log(user);
    // const hashedPassword = user.password
    const passCheck = await user.comparePassword(password);
    console.log(passCheck);

    if (passCheck) {
      const token = await user.generateAuthToken();
      res.cookie("uid", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Secure flag for HTTPS
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      });
      req.userId = user._id;
      return res
        .status(200)
        .json({ success: true, msg: "Auth token generated" });
    } else {
      return res
        .status(400)
        .json({ success: false, msg: "Wrong user credentials" });
    }
  } catch (error) {
    console.log("error", error);
    return res
      .status(400)
      .json({ success: false, msg: "error generating auth token" });
  }
}

module.exports = {
  handleRegisterUser,
  handleVerifyOtp,
  handleUserLogin,
};
