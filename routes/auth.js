const express = require("express");
const { body } = require("express-validator/check");

const router = express.Router();
const authController = require("../controller/auth");
const User = require("../models/user");
const isAuth = require("../middleware/authentication");

router.put(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter valid email")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then(user => {
          if (user) {
            return Promise.reject("Email address already exists!");
          }
        });
      })
      .normalizeEmail(),
    body("password").isLength({ min: 5 }),
    body("name")
      .trim()
      .not()
      .isEmpty()
  ],
  authController.signup
);

router.post(
  "/login",
  [
    body("email").isEmail(),
    body("password")
      .not()
      .isEmpty()
  ],
  authController.login
);

router.get("/status", isAuth, authController.getUserStatus);

// TODO: Only admin can set status
router.patch(
  "/status",
  isAuth,
  [
    body("status")
      .trim()
      .not()
      .isEmpty()
  ],
  authController.updateUserStatus
);

module.exports = router;
