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

// roomsSchema.methods.addMessage = function (message) {
//   const messageId = message._id;
//   this.messages.push({ messageId });
//   this.save();
// };

module.exports = mongoose.model("keys", keysSchema);
