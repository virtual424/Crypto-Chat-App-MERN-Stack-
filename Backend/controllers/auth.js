const User = require("../models/User");
const Keys = require("../models/Keys");
const Jimp = require("jimp");
const path = require("path");

exports.register = async (req, res, next) => {
  const { username, email, password, profileUrl, publicKey } = req.body;

  const buffer = Buffer.from(
    profileUrl.replace(/^data:image\/png;base64,/, ""),
    "base64"
  );

  const imagePath = `${Date.now()}-${Math.round(Math.random() * 1e9)}.png`;

  try {
    const jimResp = await Jimp.read(buffer);
    jimResp
      .resize(150, Jimp.AUTO)
      .write(path.resolve(__dirname, `../storage/${imagePath}`));
  } catch (error) {
    return next(error);
  }

  try {
    const user = await User.create({
      username: username,
      email: email,
      password: password,
      profileUrl: `${process.env.BASE_URL}/storage/${imagePath}`,
      rooms: [],
    });

    const key = await Keys.create({
      userName: username,
      publicKey,
    });

    sendToken(user, 201, res);
  } catch (error) {
    return next(error);
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new Error("Please provide a email and password");
  }

  try {
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      throw new Error("Invalid Credentials", 401);
    }

    const isMatch = await user.matchPasswords(password);

    if (!isMatch) {
      throw new Error("Invalid Credentials");
    }
    sendToken(user, 200, res);
  } catch (error) {
    return next(error);
  }
};

exports.logout = async (req, res, next) => {
  const userId = req.params.userId;
  const status = req.body.status;
  try {
    const user = await User.findOne({ _id: userId });
    if (!user) {
      throw new Error("Cannot log this user out");
    }

    res.status(201).json({
      success: true,
      status,
    });
  } catch (error) {
    return next(error);
  }
};

const sendToken = (user, statusCode, res) => {
  const token = user.getSignedToken();
  const userId = user._id;
  const username = user.username;
  const profileUrl = user.profileUrl;

  res.status(statusCode).json({
    success: true,
    token,
    username,
    userId,
    profileUrl,
  });
};
