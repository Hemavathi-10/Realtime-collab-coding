const File = require("../models/File");
const fs = require("fs");
const path = require("path");

const deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        message: "Not found"
      });
    }

    const filePath = path.join(
      __dirname,
      "..",
      "uploads",
      file.fileUrl
    );

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await File.findByIdAndDelete(req.params.id);

    res.json({
      message: "Deleted"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  deleteFile
};