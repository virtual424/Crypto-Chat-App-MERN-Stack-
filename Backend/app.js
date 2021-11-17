require("dotenv").config({ path: "./config.env" });
const express = require("express");
const connectDB = require("./config/database");
const multer = require("multer");
const { protect } = require("./middleware/auth");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "storage/uploads");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      new Date().toISOString().replaceAll(":", "-") +
        "-" +
        file.originalname.substring(0, file.originalname.lastIndexOf(".")) +
        ".txt"
    );
  },
});
const upload = multer({ storage: fileStorage }).single("file");

app.use(cors());
app.use(express.json({ limit: "8mb" }));
app.use((req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      return res.json({ success: false, err: err.message });
    }
    next();
  });
});
app.use("/storage", express.static("storage"));

connectDB();

app.use("/api/auth", require("./routes/auth"));
app.use("/api/chats/rooms", protect, require("./routes/chats/rooms"));
app.use("/api/chats/messages", protect, require("./routes/chats/messages"));
app.use("/api/keys", require("./routes/keys"));

app.use((error, req, res, next) => {
  return res.status(500).json({ success: false, error: error.message });
});

const server = app.listen(8080);
process.on("unhandledRejection", (error, promise) => {
  console.log(`Logged error:${error.message}`);
  server.close(() => process.exit(1));
});

module.exports = upload;
