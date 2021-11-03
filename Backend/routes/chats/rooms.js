const express = require("express");
const { getRooms, addRooms } = require("../../controllers/chats/rooms");
const router = express.Router();

router.route("/:userId/getRooms").get(getRooms);
router.route("/:userId/addRooms").post(addRooms);

module.exports = router;
