const { validationResult } = require("express-validator/check");

const handleError = require("../utils/error").handleError;
const clearImage = require("../utils/image").clearImage;

const Post = require("../models/post");
const User = require("../models/user");

exports.getPosts = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const ITEM_PER_PAGE = 2;
  try {
    const totalItems = await Post.find().countDocuments();
    const posts = await Post.find()
      .populate("creator")
      .skip((currentPage - 1) * ITEM_PER_PAGE)
      .limit(ITEM_PER_PAGE);
    res.status(200).json({ message: "Get posts success", posts, totalItems });
  } catch (error) {
    error.statusCode = 500;
    handleError(error, next);
  }
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
  let creator;
  const post = new Post({
    title,
    content,
    imageUrl: image,
    creator: req.userId
  });
  post
    .save()
    .then(result => {
      return User.findById(req.userId);
    })
    .then(user => {
      creator = user;
      user.posts.push(post);
      return user.save();
    })
    .then(result => {
      res.status(201).json({
        message: "Post created successfully",
        post
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
      if (post.creator.toString() !== req.userId) {
        const error = new Error("Not authenticated");
        error.statusCode = 403;
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
      handleError(err, next);
    });
};

exports.deletePost = async (req, res, next) => {
  const { postId } = req.params;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error("No posts found.");
      error.statusCode = 422;
      throw error;
    }
    if (post.creator.toString() !== req.userId) {
      const error = new Error("Not authenticated");
      error.statusCode = 403;
      throw error;
    }
    await clearImage(post.imageUrl);
    console.log("Image cleared");
    await Post.findByIdAndRemove(postId);
    const user = await User.findById(req.userId);
    user.posts.pull(postId);
    await user.save();
    return res.status(200).json({ message: "Post deleted!" });
  } catch (error) {
    handleError(error, next);
  }
};
