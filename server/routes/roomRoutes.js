
const express = require("express");

const router = express.Router();
const {
  createRoom,
  joinRoom,
  checkRoom,
  saveCode,
  getRoomData,
  saveMessage,
  saveWhiteboard,
  saveActivity
} = require("../controllers/roomController");

const { protect } = require("../middleware/authMiddleware");

// create room
router.post("/create", protect, createRoom);

// join room
router.post("/join", protect, joinRoom);
router.get("/:roomId", protect, checkRoom);
router.post(
  "/save-code",
  protect,
  saveCode
);
router.get(
  "/data/:roomId",
  protect,
  getRoomData
);
router.post(
  "/save-message",
  protect,
  saveMessage
);
router.post(
  "/save-whiteboard",
  protect,
  saveWhiteboard
);
router.post(
  "/save-activity",
  protect,
  saveActivity
);
module.exports = router;