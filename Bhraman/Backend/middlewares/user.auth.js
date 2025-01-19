const userModel = require("../models/user.model");
const blackListTokenModel = require("../models/blacklistToken.model");
const jwt = require("jsonwebtoken");
async function checkForUserAuthentication(req, res, next) {
  try {
    // console.log(req);

    const tokenCookie = req.cookies.uid;
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
    const user = await userModel.findById(decoded._id);

    req.user = user;
    // res.status(200).json({ msg: "succesfully logged in " });
    next();
  } catch (error) {
    console.error("error", error);
    return res.status(400).json({ msg: "Error Occured" });
  }
}

module.exports = {
  checkForUserAuthentication,
};
