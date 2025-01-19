const express = require("express");
const router = express.Router();
const {
  handleCaptainLogin,
  handleRegisterCaptain,
  handleVehicleAuthentication,
  handleVerifyOtp,
  handleCaptainLogout,
  handleGetCaptainProfile,
  handleUpdateLocation,
  handleDeleteLocation,
} = require("../controllers/captain.controller");
const { upload } = require("../services/capRegAuth");
const { body } = require("express-validator");
const {
  checkForCaptainAuthentication,
} = require("../middlewares/captain.auth");

// const { checkForAuthentication } = require("../middlewares/captain.auth");
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
  handleRegisterCaptain
);
router.post("/register/otpauth", handleVerifyOtp);
// router.post(
//   "/register/vehauth/:id",
//   // upload.single("plateImage"),
//   handleVehicleAuthentication
// );
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid Email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("password must be atleast 6 characters long"),
  ],
  handleCaptainLogin
);

router.get("/profile", checkForCaptainAuthentication, handleGetCaptainProfile);

router.post("/logout", checkForCaptainAuthentication, handleCaptainLogout);

router.post("/updatelocation", handleUpdateLocation);

router.post("/deletelocation", handleDeleteLocation);

router.post;
module.exports = router;
