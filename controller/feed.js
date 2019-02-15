let posts = [{ title: "First post", content: "This is the first post" }];

exports.getPosts = (req, res, next) => {
  res.status(200).json({
    posts
  });
};

exports.createPost = (req, res, next) => {
  const { title, content } = req.body;
  posts.push({ title, content });
  res.status(201).json({
    message: "Post created successfully",
    post: { id: new Date().toISOString(), title, content }
  });
};
