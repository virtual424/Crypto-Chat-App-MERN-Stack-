const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const keysSchema = new Schema({
  userName: {
    type: String,
    required: true,
  },
  publicKey: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("keys", keysSchema);
