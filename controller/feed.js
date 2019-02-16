const { validationResult } = require("express-validator/check");

const handleError = require("../utils/error").handleError;

const Post = require("../models/post");

exports.getPosts = (req, res, next) => {
  Post.find()
    .then(posts =>
      res.status(200).json({ message: "Get posts success", posts })
    )
    .catch(error => handleError(error, next));
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed. Input data is incorrect");
    error.statusCode = 422;
    throw error;
  }
  const { title, content } = req.body;
  const post = new Post({
    title,
    content,
    imageUrl: "images/duck.jpg",
    creator: {
      name: "Janet Van"
    }
  });
  post
    .save()
    .then(result => {
      res.status(201).json({
        message: "Post created successfully",
        post: result
      });
    })
    .catch(err => {
      handleError(err, next);
    });
};

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error("No posts found!");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ post });
    })
    .catch(error => handleError(error, next));
};
