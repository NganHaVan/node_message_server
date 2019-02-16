exports.handleError = (error, cb) => {
  if (!error.statusCode) {
    error.statusCode = 500;
  }
  cb(error);
};
