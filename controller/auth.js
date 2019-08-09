const { validationResult } = require("express-validator/check");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const handError = require("../utils/error").handleError;
const User = require("../models/user");
const jwtScret = require("../config/key").jwtKey;

exports.signup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed!");
    error.statusCode = 422;
    error.data = errors.array();
    console.log({ data: error.data });
    throw error;
  }
  const { email, password, name } = req.body;
  bcrypt
    .hash(password, 12)
    .then(hashedPwd => {
      const newUser = new User({ email, password: hashedPwd, name });
      return newUser.save();
    })
    .then(result => {
      res.status(201).json({ message: "User created", userId: result._id });
    })
    .catch(err => {
      handError(err, next);
    });
};

exports.login = (req, res, next) => {
  const { email, password } = req.body;
  const errors = validationResult(req);
  let loadedUser;
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed!");
    error.statusCode = 422;
    error.data = errors.array();
    console.log({ data });
    throw error;
  }
  User.findOne({ email })
    .then(user => {
      if (!user) {
        const error = new Error("User not found!");
        error.statusCode = 401;
        throw error;
      }
      loadedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then(isMatch => {
      if (!isMatch) {
        const error = new Error("Incorrect password. Please try again");
        error.statusCode = 401;
        throw error;
      }
      // Generate token
      // NOTE: Should not return the raw password here because it is returned in the front end
      const token = jwt.sign(
        { email: loadedUser.email, userId: loadedUser._id.toString() },
        jwtScret,
        { expiresIn: "1h" }
      );
      res.status(200).json({ token, userId: loadedUser._id.toString() });
    })
    .catch(err => {
      handError(err, next);
    });
};

exports.getUserStatus = (req, res, next) => {
  User.findById(req.userId)
    .then(user => {
      if (!user) {
        const error = new Error("User not found!");
        error.statusCode = 401;
        throw error;
      }
      res.status(200).json({ status: user.status });
    })
    .catch(error => {
      handError(error, next);
    });
};

exports.updateUserStatus = (req, res, next) => {
  const newStatus = req.body.status;
  User.findById(req.userId)
    .then(user => {
      if (!user) {
        const error = new Error("User not found!");
        error.statusCode = 401;
        throw error;
      }
      user.status = newStatus;
      return user.save();
    })
    .then(result => {
      res.status(200).json({ message: "User status updated" });
    })
    .catch(err => {
      handError(err, next);
    });
};
