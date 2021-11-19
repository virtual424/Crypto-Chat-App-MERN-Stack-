const mongoose = require("mongoose");
const Pusher = require("pusher");

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.PUSHER_CLUSTER,
    useTLS: true,
  });

  const db = mongoose.connection;

  const msgCollection = db.collection("messages");
  const msgChangeStream = msgCollection.watch();

  const roomsCollection = db.collection("rooms");
  const roomChangeStream = roomsCollection.watch();

  const keysCollection = db.collection("keys");
  const keysChangeStream = keysCollection.watch();

  keysChangeStream.on("change", (change) => {
    console.log("Change Log", change);
    try {
      if (change.operationType == "insert") {
        console.log("fullDocumentLog:", change.fullDocument);
        const keyDetails = change.fullDocument;

        pusher.trigger("keys", "inserted", {
          username: keyDetails.userName,
          key: keyDetails.publicKey,
        });
      }
    } catch (error) {
      return next(error);
    }
  });

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
