const userModel = require("../models/user.model");
async function checkForAuthentication(req, res, next) {
  const tokenCookie = req.cookies.uid;
  const user = await userModel.findOne({ _id: req.userId });
  const result = user.verifyAuthToken();
  if (result.success) {
    req.result = result;
    res.status(200).json({ msg: "succesfully logged in " });
    next();
  }
}

module.exports = {
  checkForAuthentication,
};
