const fs = require("fs");
const path = require("path");

exports.clearImage = filePath => {
  // filePath = path.join(path.dirname(process.mainModule.filename), filePath);
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, err => {
    if (err) {
      throw err;
    }
  });
};
