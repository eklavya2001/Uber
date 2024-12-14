const mongoose = require("mongoose");

function connectToDb() {
  mongoose
    .connect(process.env.DB_CONNECT)
    .then(() => console.log("MongoDb connected"))
    .catch((err) => console.log("error", err));
}

module.exports = connectToDb;
