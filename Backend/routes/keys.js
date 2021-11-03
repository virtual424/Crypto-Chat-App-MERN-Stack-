const express = require("express");

const router = express.Router();

const { fetchKeys } = require("../controllers/keys");

router.route("/fetchKeys").get(fetchKeys);

module.exports = router;
