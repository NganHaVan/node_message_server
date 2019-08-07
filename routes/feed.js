const express = require("express");
const feedController = require("../controller/feed");
const { body } = require("express-validator/check");
const isAuth = require("../middleware/authentication");

const router = express.Router();

// GET /feeds/posts
router.get("/posts", isAuth, feedController.getPosts);

// GET /feeds/post
router.get("/post/:postId", isAuth, feedController.getPost);

// POST /feeds/posts
router.post(
  "/posts",
  isAuth,
  [
    body("title")
      .trim()
      .isLength({ min: 7 }),
    body("content")
      .trim()
      .isLength({ min: 5 })
  ],
  feedController.createPost
);
// PUT /feeds/post/:postId
// NOTE: No validation for image because it is handled in the controller
router.put(
  "/post/:postId",
  isAuth,
  [
    body("title")
      .trim()
      .isLength({ min: 7 }),
    body("content")
      .trim()
      .isLength({ min: 5 })
  ],
  feedController.updatePost
);

router.delete("/post/:postId", isAuth, feedController.deletePost);

module.exports = router;
