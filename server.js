const express = require("express");
const chalk = require("chalk");
const connectDB = require("./config/db");

const app = express();
connectDB();

app.get("/", (req, res) => {
  res.send("CONNECTED");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(chalk.bgGreenBright.black(`SERVER STARTED AT PORT ${PORT}`))
);
