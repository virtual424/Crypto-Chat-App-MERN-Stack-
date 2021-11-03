const Keys = require("../models/Keys");

exports.fetchKeys = async (req, res, next) => {
  try {
    const query = await Keys.find();
    const keys = query.map((obj) => {
      const keyObj = {
        username: obj.userName,
        key: obj.publicKey,
      };
      return keyObj;
    });
    res.status(201).json({ success: true, keys });
  } catch (error) {
    return next(error);
  }
};
