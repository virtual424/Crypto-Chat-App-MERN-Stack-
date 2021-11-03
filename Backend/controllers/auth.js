const User = require("../models/User");
const Keys = require("../models/Keys");
const Jimp = require("jimp");
const crypto = require("crypto");
const path = require("path");

const sendEmail = require("../utils/email");

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

exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return next(new ErrorResponse("Email could not be sent", 404));
    }

    const resetToken = user.getResetPasswordToken();

    await user.save();

    const resetUrl = `http://localhost:3000/passwordreset/${resetToken}`;

    const message = `
    <h1>You have requested a password reset</h1>
    <p>Please go to this link to reset the password</p>
    <a href = ${resetUrl} clicktracking = off>${resetUrl}</a>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: "Passwrod reset Request",
        text: message,
      });

      res.status(200).json({ success: true, data: "Email sent" });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save();

      return next(new ErrorResponse("Email could not be send", 500));
    }
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return next(new ErrorResponse("Invalid Reset Token", 400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(201).json({ success: true, data: "Password Reset Success" });
  } catch (error) {}
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
