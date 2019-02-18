const { validationResult } = require("express-validator/check");

const handleError = require("../utils/error").handleError;
const clearImage = require("../utils/image").clearImage;

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
  if (!req.file) {
    const error = new Error("No image provided");
    error.statusCode = 422;
    throw error;
  }
  const { title, content } = req.body;
  const image = req.file.path;
  const post = new Post({
    title,
    content,
    imageUrl: image,
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

exports.updatePost = (req, res, next) => {
  const { postId } = req.params;
  let { title, content, image: imageUrl } = req.body;
  if (req.file) {
    imageUrl = req.file.path;
  }
  if (!imageUrl) {
    const error = new Error("No file picked");
    error.statusCode = 422;
    throw error;
  }
  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error("No posts found");
        error.statusCode = 404;
        throw error;
      }
      if (post.imageUrl !== imageUrl) {
        clearImage(post.imageUrl);
      }
      post.title = title;
      post.content = content;
      post.imageUrl = imageUrl;
      return post.save();
    })
    .then(result => {
      res.status(200).json({ message: "Post updated", post: result });
    })
    .catch(err => {
      this.handleError(err);
    });
};
