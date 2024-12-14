const express = require("express");
const app = express();
const router = express.Router();
const { body } = require("express-validator");
const {
  handleRegisterUser,
  handleVerifyOtp,
  handleUserLogin,
} = require("../controllers/user.controller");

router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Invalid Email"),
    body("fullname.firstname")
      .isLength({ min: 3 })
      .withMessage("First name must be at least 3 characters long"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("password must be atleast 6 characters long"),
  ],
  handleRegisterUser
);

router.post("/register/otpauth", handleVerifyOtp);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid Email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("password must be atleast 6 characters long"),
  ],
  handleUserLogin
);

router.post("/logout", (req, res) => {
  res.clearCookie("uid"); // Clear the JWT token cookie
  res.status(200).json({ message: "Logout successful" });
});
module.exports = router;
