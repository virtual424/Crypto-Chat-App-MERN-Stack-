const User = require("../../models/User");
const Room = require("../../models/Rooms");

exports.addRooms = async (req, res, next) => {
  const {
    reciever,
    creator,
    createdAt,
    messages,
    creatorProfileUrl,
    publicKey,
  } = req.body;

  try {
    const recipent = await User.findOne({ username: reciever });

    if (!recipent) {
      throw new Error("No such User Exists");
    }

    const recipentExists = await Room.findOne({
      creator: creator,
      reciever: reciever,
    });

    if (recipentExists || reciever === creator) {
      throw new Error("Room already exists");
    }

    const creatorObj = await User.findOne({ username: creator });

    const room = await Room.create({
      creator: creator,
      reciever: reciever,
      creatorProfileUrl: creatorProfileUrl,
      recieverProfileUrl: recipent.profileUrl,
      createdAt: createdAt,
      creatorPublicKey: publicKey,
      recieverPublicKey: null,
      message: messages,
    });

    creatorObj.addRoom(room._id);
    recipent.addRoom(room._id);

    res.status(200).json({
      success: true,
      roomId: room._id,
      publicKey,
    });
  } catch (error) {
    return next(error);
  }
};

exports.getRooms = async (req, res, next) => {
  const userId = req.params.userId;
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("No user exists with this id");
    }
    const data = await user.populate("rooms.roomId");
    const rooms = data.rooms.map((room) => {
      return {
        roomId: room.roomId._id,
        creator: room.roomId.creator,
        reciever: room.roomId.reciever,
        createdAt: room.roomId.createdAt,
        creatorProfileUrl: room.roomId.creatorProfileUrl,
        recieverProfileUrl: room.roomId.recieverProfileUrl,
        messages: room.roomId.messages,
      };
    });

    res.status(201).json({ success: true, data: rooms });
  } catch (error) {
    return next(error);
  }
};
