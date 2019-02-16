const express = require("express");
const feedController = require("../controller/feed");
const { body } = require("express-validator/check");

const router = express.Router();

// GET /feeds/posts
router.get("/posts", feedController.getPosts);

// GET /feeds/post
router.get("/post/:postId", feedController.getPost);

// POST /feeds/posts
router.post(
  "/posts",
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

module.exports = router;
