const Room = require("../models/Room");

const createRoom = async (req, res) => {
  try {

    const roomId =
      "ROOM-" +
      Math.floor(1000 + Math.random() * 9000);

    const room = await Room.create({
      roomId,
      createdBy: req.user._id,
      participants: [req.user._id]
    });

    res.status(201).json(room);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

const joinRoom = async (req, res) => {
  try {
    const { roomId } = req.body;

    const room = await Room.findOne({ roomId });

    if (!room) {
      return res.status(404).json({
        message: "Room not found"
      });
    }

    // check if user already exists in room
    if (!room.participants.includes(req.user._id)) {
      room.participants.push(req.user._id);
      await room.save();
    }

    res.status(200).json(room);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


const checkRoom = async (req, res) => {
  const { roomId } = req.params;

  const room = await Room.findOne({ roomId });

  if (!room) {
    return res.status(404).json({
      message: "Room not found"
    });
  }

  res.status(200).json(room);
};

const saveCode = async (req, res) => {
  try {

    const { roomId, code } = req.body;

    const room = await Room.findOne({
      roomId
    });

    if (!room) {
      return res.status(404).json({
        message: "Room not found"
      });
    }

    room.code = code;

    await room.save();

    res.status(200).json({
      message: "Code saved"
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

const getRoomData = async (req, res) => {
  try {

    const { roomId } = req.params;

    const room = await Room.findOne({ roomId });

    if (!room) {
      return res.status(404).json({
        message: "Room not found"
      });
    }

    res.status(200).json(room);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

const saveMessage = async (req, res) => {
  try {

    const { roomId, username, message } = req.body;

    const room = await Room.findOne({ roomId });

    if (!room) {
      return res.status(404).json({
        message: "Room not found"
      });
    }

    room.messages.push({
      username,
      message
    });

    await room.save();

    res.status(200).json({
      message: "Saved"
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

const saveWhiteboard = async (req, res) => {
  try {

    const { roomId, lines } = req.body;

    const room = await Room.findOne({ roomId });

    if (!room) {
      return res.status(404).json({
        message: "Room not found"
      });
    }

    room.whiteboard = lines;

    await room.save();

    res.status(200).json({
      message: "Whiteboard saved"
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

const saveActivity = async (req, res) => {
  try {

    const { roomId, text } = req.body;

    const room = await Room.findOne({
      roomId
    });

    if (!room) {
      return res.status(404).json({
        message: "Room not found"
      });
    }

    room.activities.push({
      text
    });

    await room.save();

    res.status(200).json({
      message: "Activity Saved"
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};
module.exports = {
  createRoom,
  joinRoom,
  checkRoom,
  saveCode,
  getRoomData,
  saveMessage,
  saveWhiteboard,
  saveActivity
};