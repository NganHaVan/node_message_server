const express = require("express");
const feedController = require("../controller/feed");

const router = express.Router();

// GET /feeds/posts
router.get("/posts", feedController.getPosts);

// POST /feeds/posts
router.post("/posts", feedController.createPost);

module.exports = router;
