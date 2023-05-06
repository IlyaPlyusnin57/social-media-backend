const User = require("../models/User");
const bcrypt = require("bcrypt");
const Token = require("../models/Token");
const jwt = require("jsonwebtoken");

const {
  generateTokens,
  saveToken,
  generateAccessToken,
  deleteToken,
} = require("../services/token-service");

//register a user

async function register(req, res) {
  const userExists = await User.findOne({ username: req.body.username }).lean();

  if (userExists)
    return res.status(409).json({
      type: "username",
      message: "A user with that username already exists",
    });

  const emailExists = await User.findOne({ email: req.body.email }).lean();

  if (emailExists)
    return res.status(409).json({
      type: "email",
      message: "A user with that email already exists",
    });

  const salt = bcrypt.genSaltSync(12);
  const hash = bcrypt.hashSync(req.body.password, salt);

  const user = new User({
    username: req.body.username,
    email: req.body.email,
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    full_name: req.body.first_name + " " + req.body.last_name,
    password: hash,
  });

  //   user.save((err) => {
  //     if (err) console.log(err);
  //     else {
  //       console.log("user save success!");
  //       res.send("User has been saved!");
  //       //res.status(200).json(user);
  //     }
  //   });

  user.save().then(
    async () => {
      console.log("user save success!");
      const { username, ...restInfo } = user._doc;

      const tokens = generateTokens({ username });
      await saveToken(user._id, tokens.refreshToken);

      res.cookie("refreshToken", tokens.refreshToken, {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
      });

      res.status(200).json({ username, ...restInfo, ...tokens });
    },
    (err) => {
      console.log(err);
      res.status(500).json(err);
    }
  );
}

//login

async function login(req, res) {
  try {
    // const user = await User.findOne({
    //   $or: [{ email: req.body.email }, { username: req.body.email }],
    // }).exec();

    const user = await User.findOne()
      .or([{ email: req.body.email }, { username: req.body.email }])
      .lean();

    if (user === null)
      return res
        .status(404)
        .json({ type: "user", message: "User was not found" });

    const valid = bcrypt.compareSync(req.body.password, user.password);

    if (!valid)
      return res
        .status(400)
        .json({ type: "password", message: "Wrong password" });

    const { username, password, ...restInfo } = user;

    const tokens = generateTokens({ userId: user._id });
    await saveToken(user._id, tokens.refreshToken);

    // res.cookie("refreshToken", tokens.refreshToken, {
    //   maxAge: 24 * 60 * 60 * 1000,
    //   httpOnly: true,
    //   domain: "vercel.app",
    // });

    res
      .status(200)
      .cookie("refreshToken", tokens.refreshToken, {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "None",
        secure: true,
      })
      .json({ username, ...restInfo, ...tokens });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}

//logout

async function logout(req, res) {
  try {
    const { refreshToken } = req.cookies;
    res.clearCookie("refreshToken");
    const result = await deleteToken(refreshToken);
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}

//refresh a token

async function refresh(req, res) {
  const refreshToken = req.cookies.refreshToken;
  const userId = req.body.userId;

  console.log({ userId, refreshToken });

  try {
    const token = await Token.findOne({ userId, refreshToken }).lean();

    if (!token) return res.status(403).json("You're not authenticated!");

    jwt.verify(token.refreshToken, process.env.REFRESH_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json(err?.message);
      }

      const accessToken = generateAccessToken(user.userId);

      res.status(200).json({ accessToken });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
}

// async function refresh(req, res) {
//   const { refreshToken } = req.cookies;

//   if (!refreshToken) {
//     return res.status(500).json("No token to refresh");
//   }

//   const data = validateRefreshToken(refreshToken);
//   const found = await findToken(refreshToken);

//   if (!data || !found) {
//     return res.status(500).json("User is not authorized!");
//   }

//   const user = await User.findOne({ username: data.username }).exec();

//   const tokens = generateTokens({ username: user.username });
//   await saveToken(user._id, tokens.refreshToken);

//   return res.status(200).json({ Response: "Success", user, tokens });
// }

module.exports = { register, login, logout, refresh };
