const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const app = express();
const connectToDb = require("./db/db");
const authRouter = require("./routes/user.routes");
const cookieParser = require("cookie-parser");

connectToDb();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello world");
});
app.use("/auth", authRouter);

module.exports = app;
