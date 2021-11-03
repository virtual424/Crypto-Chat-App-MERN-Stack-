const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const roomsSchema = new Schema({
  creator: {
    type: String,
    required: true,
  },
  reciever: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
  },
  creatorProfileUrl: {
    type: String,
    required: true,
  },
  recieverProfileUrl: {
    type: String,
    required: true,
  },
  messages: [
    {
      messageId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Message",
      },
    },
  ],
});

roomsSchema.methods.addMessage = function (message) {
  const messageId = message._id;
  this.messages.push({ messageId });
  this.save();
};

module.exports = mongoose.model("Room", roomsSchema);
