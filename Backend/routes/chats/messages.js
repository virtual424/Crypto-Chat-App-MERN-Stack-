const express = require("express");
const {
  fetchMessages,
  sendMessages,
  uploadFiles,
} = require("../../controllers/chats/messages");
const router = express.Router();

router.route("/:roomId/fetchMessages/:sort").get(fetchMessages);
router.route("/:roomId/sendMessages").post(sendMessages);
router.route("/:roomId/uploadFiles").post(uploadFiles);

module.exports = router;
