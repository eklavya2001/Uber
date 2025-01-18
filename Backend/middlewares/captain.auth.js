const captainModel = require("../models/captain.model");
const blackListTokenModel = require("../models/blacklistToken.model");
const jwt = require("jsonwebtoken");
async function checkForCaptainAuthentication(req, res, next) {
  try {
    const tokenCookie = req.cookies.cap_uid;
    if (!tokenCookie) {
      return res.status(401).json({ msg: "token not found" });
    }
    const isBlacklisted = await blackListTokenModel.findOne({
      token: tokenCookie,
    });

    if (isBlacklisted) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const decoded = jwt.verify(tokenCookie, process.env.JWT_SECRET);
    const captain = await captainModel.findById(decoded._id);
    req.captain = captain;
    // res.status(200).json({ msg: "succesfully logged in " });
    next();
  } catch (error) {
    console.error("error", error);
    return res.status(400).json({ msg: "Error Occured" });
  }
}

module.exports = {
  checkForCaptainAuthentication,
};
