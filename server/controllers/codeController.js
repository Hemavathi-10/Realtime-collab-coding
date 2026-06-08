const { exec } = require("child_process");
const fs = require("fs");

const executeCode = async (req, res) => {
  try {

    const { code } = req.body;

    const fileName = "temp.js";

    fs.writeFileSync(fileName, code);

    exec(`node ${fileName}`, (error, stdout, stderr) => {

      if (error) {
        return res.json({
          output: error.message
        });
      }

      if (stderr) {
        return res.json({
          output: stderr
        });
      }

      res.json({
        output: stdout
      });

    });

  } catch (error) {
    res.status(500).json({
      output: error.message
    });
  }
};

module.exports = {
  executeCode
};