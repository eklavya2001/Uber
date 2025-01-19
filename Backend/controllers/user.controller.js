const blacklistTokenModel = require("../models/blacklistToken.model");
const userModel = require("../models/user.model");

async function handleRegisterUser(req, res) {
  try {
    const { email, password, firstname, lastname, phone } = req.body;
    if (!firstname || !lastname || !password || !email || !phone) {
      return res.status(400).json({ msg: "all fields are required" });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      // If user exists but not verified, delete the unverified record
      if (!existingUser.isVerified) {
        await userModel.deleteOne({ email });
      } else {
        return res.status(400).json({ msg: "Email already registered" });
      }
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
    console.log(otpGenerated);

    await newUser.sendEmailOtp(otpGenerated);
    await newUser.sendSmsOtp(otpGenerated);

    res.cookie("_id", newUser._id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Secure flag for HTTPS
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    });

    return res.status(201).json({
      msg: "otp generated successfully",
      userid: newUser._id,
      otpsent: true,
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ msg: "internal server error" });
  }
}

async function handleVerifyOtp(req, res) {
  const { otp } = req.body;
  console.log(otp);
  console.log(req);
  try {
    if (!otp) {
      return res.status(400).json({
        msg: "Please enter your OTP! OTP is valid for 5 minutes only",
      });
    }
    const _id = req.cookies._id;
    console.log("gandu", _id);

    // console.log(_id);
    const user = await userModel.findOne({ _id: _id }).select("+otp");
    console.log(user);
    console.log(user.otp);
    // const userOtp = user.otp;
    if (user.otp == otp) {
      user.otp = undefined;
      user.otpExpires = undefined;
      user.isVerified = true;
      await user.save();

      return res.status(200).json({
        msg: "OTP has been verified,A new user has been created successfully",
      });
    } else {
      return res.status(400).json({ msg: "OTP didn't match" });
    }
  } catch (error) {
    console.log("error", error);

    res.status(401).json({ msg: "an error occured" });
  }
}

async function handleUserLogin(req, res) {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email }).select("+password");
    // console.log(user);
    // const hashedPassword = user.password
    if (user.isVerified) {
      const passCheck = await user.comparePassword(password);
      console.log(passCheck);

      if (passCheck) {
        const token = await user.generateAuthToken();
        console.log(token);

        res.cookie("uid", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production", // Secure flag for HTTPS
          sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        });
        // req.userId = user._id;
        return res.status(200).json({
          success: true,
          msg: "Logged in Successfully",
          payload: user,
        });
      } else {
        return res
          .status(400)
          .json({ success: false, msg: "Wrong user credentials" });
      }
    } else {
      return res
        .status(400)
        .json({ success: false, msg: "user not registered" });
    }
  } catch (error) {
    console.log("error", error);
    return res
      .status(400)
      .json({ success: false, msg: "error generating auth token" });
  }
}

async function handleUserLogout(req, res) {
  const token = req.cookies.uid;
  await blacklistTokenModel.create({
    token,
  });

  res.clearCookie("uid"); // Clear the JWT token cookie
  res.status(200).json({ message: "Logout successful" });
}

async function handleGetUserProfile(req, res) {
  res.status(200).json(req.user);
}

module.exports = {
  handleRegisterUser,
  handleVerifyOtp,
  handleUserLogin,
  handleUserLogout,
  handleGetUserProfile,
};
