const { validationResult } = require("express-validator/check");

const io = require("../socket");

const handleError = require("../utils/error").handleError;
const clearImage = require("../utils/image").clearImage;

const Post = require("../models/post");
const User = require("../models/user");

exports.getPosts = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const ITEM_PER_PAGE = 6;
  try {
    const totalItems = await Post.find().countDocuments();
    const posts = await Post.find()
      .populate("creator")
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * ITEM_PER_PAGE)
      .limit(ITEM_PER_PAGE);
    res.status(200).json({ message: "Get posts success", posts, totalItems });
  } catch (error) {
    error.statusCode = 500;
    handleError(error, next);
  }
};

exports.createPost = async (req, res, next) => {
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
  try {
    await post.save();
    const user = await User.findById(req.userId);
    user.posts.push(post);
    await user.save();
    io.getIO().emit("posts", {
      action: "create",
      post: { ...post._doc, creator: { _id: req.userId, name: user.name } }
    });
    res.status(201).json({
      message: "Post created successfully",
      post,
      creator: { _id: user._id, name: user.name }
    });
  } catch (error) {
    handleError(error, next);
  }
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

exports.updatePost = async (req, res, next) => {
  const { postId } = req.params;
  let { title, content, image: imageUrl } = req.body;
  if (req.file) {
    imageUrl = req.file.path;
  }
  try {
    const post = await Post.findById(postId).populate("creator");
    if (!post) {
      const error = new Error("No posts found!");
      error.statusCode = 404;
      throw error;
    }
    if (post.creator._id.toString() !== req.userId) {
      const error = new Error("Not authenticated!");
      error.statusCode = 403;
      throw error;
    }
    if (post.imageUrl !== imageUrl) {
      console.log("Image clear");
      clearImage(post.imageUrl);
    }
    post.title = title;
    post.content = content;
    post.imageUrl = imageUrl;
    const updateResult = await post.save();
    io.getIO().emit("posts", { action: "update", post: updateResult });
    res.status(200).json({ message: "Post updated", post: updateResult });
  } catch (err) {
    handleError(err, next);
  }
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
    if (post.creator._id.toString() !== req.userId) {
      const error = new Error("Not authenticated");
      error.statusCode = 403;
      throw error;
    }
    await clearImage(post.imageUrl);
    console.log("Image cleared");
    await Post.findOneAndDelete(postId);
    const user = await User.findById(req.userId);
    user.posts.pull(postId);
    await user.save();
    io.getIO().emit("posts", { action: "delete", post: postId });
    return res.status(200).json({ message: "Post deleted!" });
  } catch (error) {
    handleError(error, next);
  }
};
