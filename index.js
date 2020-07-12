const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const db = require("./helper/db");
const { userRoute } = require("./routes");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 2000;

//all midlleware
app.use(cors());
app.use(helmet());
app.use(morgan("tiny"));
app.use(express.json());

//get home
app.get("/", async (req, res) => {
  res.json({
    App: "My Toko",
    Version: "0.0.0",
    Massage: "Not Seriously project but worth it",
  });
});

//routes
app.use("/", userRoute);

//error handling
app.use((error, req, res, next) => {
  if (error.status) {
    res.status(error.status);
  } else {
    res.status(500);
  }
  res.json({
    code: error.status ? error.status : 500,
    message: error.message,
    data: false,
  });
});

db.once("open", () => {
  console.log("connected");
});

//listening check
app.listen(port, () => {
  console.log(`Magic at http://localhost:${port}`);
});
