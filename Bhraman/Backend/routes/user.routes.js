const express = require("express");

const router = express.Router();
const { body } = require("express-validator");
const {
  handleRegisterUser,
  handleVerifyOtp,
  handleUserLogin,
  handleUserLogout,
  handleGetUserProfile,
} = require("../controllers/user.controller");
const { checkForUserAuthentication } = require("../middlewares/user.auth");
const { handleNearbyCaptains } = require("../controllers/ride.controller");

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
router.get("/profile", checkForUserAuthentication, handleGetUserProfile);
router.post("/logout", checkForUserAuthentication, handleUserLogout);

router.post("/updatelocation", handleNearbyCaptains);

module.exports = router;
