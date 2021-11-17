const mongoose = require("mongoose");
const Pusher = require("pusher");

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const pusher = new Pusher({
    appId: "1272833",
    key: "e32b36b52c95aaf22268",
    secret: "92b1601b6b8c969ff99a",
    cluster: "ap2",
    useTLS: true,
  });

  const db = mongoose.connection;

  const msgCollection = db.collection("messages");
  const msgChangeStream = msgCollection.watch();

  const roomsCollection = db.collection("rooms");
  const roomChangeStream = roomsCollection.watch();

  msgChangeStream.on("change", (change) => {
    try {
      if (change.operationType == "insert") {
        const messageDetails = change.fullDocument;

        pusher.trigger("messages", "inserted", {
          id: messageDetails._id,
          sender: messageDetails.sender,
          message: messageDetails.message,
          timeStamp: messageDetails.timeStamp,
          roomId: messageDetails.roomId,
          type: messageDetails.type,
        });
      }
    } catch (error) {
      return next(error);
    }
  });

  roomChangeStream.on("change", (change) => {
    try {
      if (change.operationType == "insert") {
        const roomDetails = change.fullDocument;
        pusher.trigger("rooms", "inserted", {
          roomId: roomDetails._id,
          creator: roomDetails.creator,
          reciever: roomDetails.reciever,
          createdAt: roomDetails.createdAt,
          creatorProfileUrl: roomDetails.creatorProfileUrl,
          recieverProfileUrl: roomDetails.recieverProfileUrl,
          messages: roomDetails.messages,
        });
      }
    } catch (error) {
      return next(error);
    }
  });
  console.log("mongodb connected");
};

module.exports = connectDB;
