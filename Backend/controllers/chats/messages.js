const Message = require("../../models/Message");
const Room = require("../../models/Rooms");

exports.sendMessages = async (req, res, next) => {
  const { sender, enteredMessage } = req.body;
  const roomId = req.params.roomId;

  try {
    const room = await Room.findOne({ _id: roomId });

    if (!room) {
      throw new Error("No such user exists");
    }

    const message = await Message.create({
      sender: sender,
      message: enteredMessage,
      timeStamp: new Date(),
      roomId: roomId,
      type: "text",
    });
    room.addMessage(message);

    res.status(200).json({ success: true, messageId: message._id });
  } catch (error) {
    return next(error);
  }
};

exports.fetchMessages = async (req, res, next) => {
  const roomId = req.params.roomId;
  const sort = req.params.sort;
  try {
    const room = await Room.findOne({ _id: roomId });
    if (!room) {
      throw new Error("No room exists with this id");
    }
    const data = await room.populate("messages.messageId");
    const messages = data.messages;

    const newMessages = messages.map((message) => {
      return {
        id: message._id,
        sender: message.messageId.sender,
        message: message.messageId.message,
        timeStamp: message.messageId.timeStamp,
        roomId: message.messageId.roomId,
        type: message.messageId.type,
      };
    });
    if (sort === "DESC") {
      newMessages.sort((a, b) => b.timeStamp - a.timeStamp);
    } else {
      newMessages.sort((a, b) => a.timeStamp - b.timeStamp);
    }

    res.status(201).json({ success: true, data: newMessages });
  } catch (error) {
    return next(error);
  }
};

exports.uploadFiles = async (req, res, next) => {
  const roomId = req.params.roomId;
  try {
    const room = await Room.findOne({ _id: roomId });

    if (!room) {
      throw new Error("No such room exists");
    }
    let type;
    if (req.body.mimetype.includes("video")) {
      type = "video";
    } else if (req.body.mimetype.includes("image")) {
      type = "image";
    }
    const message = await Message.create({
      sender: req.body.sender,
      message: `http://localhost:8080/${req.file.path}`,
      timeStamp: new Date(),
      roomId: roomId,
      type: type,
    });

    room.addMessage(message);

    res.status(200).json({ success: true, messageId: message._id });
  } catch (err) {
    return next(err);
  }
};
