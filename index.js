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
const { verifyAccessToken } = require("./services/token-service");

mongoose.connect(process.env.MONGO_URL).then(
  () => {
    console.log("Connected to the db");
  },
  (err) => {
    console.log(err);
  }
);

app.use(express.json());
app.use(helmet());
app.use(morgan("common"));
app.use(cookieParser());
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
//app.use(cors({ credentials: true, origin: "http://localhost:3001" }));

app.use("/api/auth", authRoute);
app.use(verifyAccessToken);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/messages", messageRoute);
app.use("/api/conversations", conversationRoute);

app.listen(8800, () => {
  console.log("Backend server is runnng");
});
