const jwt = require("jsonwebtoken");
const tokenModel = require("../models/Token");

function generateAccessToken(userId) {
  const token = jwt.sign({ userId }, process.env.ACCESS_SECRET, {
    expiresIn: "30s",
  });

  return token;
}

function generateRefreshToken(userId) {
  const token = jwt.sign({ userId }, process.env.REFRESH_SECRET, {
    expiresIn: "1d",
  });

  return token;
}

function generateTokens(payload) {
  try {
    const accessToken = jwt.sign(payload, process.env.ACCESS_SECRET, {
      expiresIn: "15s",
    });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_SECRET, {
      expiresIn: "1d",
    });

    return {
      accessToken,
      refreshToken,
    };
  } catch (error) {
    console.log("error from Generate Tokens");
    console.log(error);
  }
}

async function saveToken(userId, refreshToken) {
  try {
    const tokenData = await tokenModel.findOne({ user: userId });

    if (tokenData) {
      tokenData.refreshToken = refreshToken;
      return await tokenData.save();
    }

    const token = await tokenModel.create({ user: userId, refreshToken });
    return token;
  } catch (error) {
    console.log("Error from saveToken:");
    console.log(error);
  }
}

async function deleteToken(token) {
  console.log("I'm in the delete token");
  try {
    const deletedCount = await tokenModel.deleteOne({
      refreshToken: token,
    });

    return deletedCount;
  } catch (error) {
    console.log("Error from the: DELETE TOKEN");
    console.log(error);
  }
}

async function findToken(token) {
  try {
    const found = await tokenModel
      .findOne({
        refreshToken: token,
      })
      .exec();

    return found;
  } catch (error) {
    console.log("Error from the: FIND_TOKEN");
    console.log(error);
  }
}

function validateAccessToken(token) {
  try {
    const data = jwt.verify(token, process.env.ACCESS_SECRET);
    return data;
  } catch (error) {
    return error;
  }
}

function validateRefreshToken(token) {
  try {
    const data = jwt.verify(token, process.env.REFRESH_SECRET);
    return data;
  } catch (error) {
    return error;
  }
}

async function verifyAccessToken(req, res, next) {
  const authHeader = req.headers.authorization;

  console.log("These Cookies: ", req.cookies);
  console.log(authHeader);
  console.log("authHeader is: ", authHeader);
  console.log("I am herrrrrrrrrrrrrrrrrrrrrrreeee");
  //next();

  if (authHeader) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.ACCESS_SECRET, (err, decoded) => {
      if (err) {
        return res
          .status(403)
          .json({ msg: err?.message, errorFrom: "verifyAccessToken" });
      }

      req.decoded = decoded;
      next();
    });
  } else {
    return res.status(401).json("You are not authenticated!");
  }
}

module.exports = {
  generateTokens,
  saveToken,
  deleteToken,
  validateAccessToken,
  validateRefreshToken,
  findToken,
  verifyAccessToken,
  generateAccessToken,
  generateRefreshToken,
};
