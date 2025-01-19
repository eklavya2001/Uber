const multer = require("multer");
const path = require("path");
//define storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "../uploads"); //Uplaod folder
  },
  filename: (req, file, cb) => {
    //Rename file with timestamp
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + "-" + file.originalname);
  },
});
//File filtr to only accept images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("only image files are allowed!"), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });
module.exports = {
  upload,
};
