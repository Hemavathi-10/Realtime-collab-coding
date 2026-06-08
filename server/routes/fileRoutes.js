const express = require("express");
const multer = require("multer");
const File = require("../models/File");

const {
  uploadFile,
  getFiles,
  deleteFile
} = require("../controllers/fileController");
const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(
      null,
      Date.now() + "-" + file.originalname
    );
  }
});

const upload = multer({ storage });

router.post(
  "/upload",
  upload.single("file"),
  async (req, res) => {

    const {
      roomId,
      uploadedBy
    } = req.body;

    const file = await File.create({
      roomId,
      fileName: req.file.originalname,
      fileUrl: req.file.filename,
      uploadedBy
    });

    res.json(file);
  }
);

router.get("/:roomId", async (req, res) => {

  const files = await File.find({
    roomId: req.params.roomId
  });

  res.json(files);

});

router.delete(
  "/:id",
  deleteFile
);
module.exports = router;