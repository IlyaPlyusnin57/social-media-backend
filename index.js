const express = require("express");
const app = express();

const morgan = require("morgan");
const dotenv = require("dotenv");
const helmet = require("helmet");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");

dotenv.config();

const authRoute = require("./routes/auth");
const userRoute = require("./routes/users");
const postRoute = require("./routes/posts");
const messageRoute = require("./routes/messages");
const conversationRoute = require("./routes/conversations");
const notificationRoute = require("./routes/notifications");
const { verifyAccessToken } = require("./services/token-service");
const commentRoute = require("./routes/comments");

app.use(express.json());
app.use(helmet());
app.use(morgan("common"));
app.use(cookieParser());

app.use(
  cors({
    credentials: true,
    origin: process.env.BASE_URL,
  })
);

app.use("/api/auth", authRoute);
app.use("/api/notifications", notificationRoute);
app.use(verifyAccessToken);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/messages", messageRoute);
app.use("/api/conversations", conversationRoute);
app.use("/api/comments", commentRoute);

app.get("/", (req, res) => {
  res.send("Welcome to my site");
});

mongoose.connect(process.env.MONGO_URL).then(
  () => {
    console.log("Connected to MongoDB");
    app.listen(8800, () => {
      console.log("Backend server is runnng");
    });
  },
  (err) => {
    console.log(err);
  }
);
