const express = require("express");
const chalk = require("chalk");
const connectDB = require("./config/db");

const userRoute = require("./routes/api/users");
const authRoute = require("./routes/api/auth");
const postsRoute = require("./routes/api/posts");
const profileRoute = require("./routes/api/profile");

const app = express();
connectDB();

app.get("/", (req, res) => {
  res.send("CONNECTED");
});

// DEFINE ROUTES
app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/posts", postsRoute);
app.use("/api/profile", profileRoute);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(chalk.bgGreenBright.black(`SERVER STARTED AT PORT ${PORT}`))
);
