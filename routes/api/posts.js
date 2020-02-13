const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");
const User = require("../../models/User");
const Profile = require("../../models/Profile");
const Post = require("../../models/Post");

// @route   POST api/posts
// @desc    Create a post
// @access  Private
router.post(
  "/",
  [
    auth,
    [
      check("text", "Text is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select("-password");
      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      });
      const post = await newPost.save();
      res.send(post);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("NOT FOUND");
    }
  }
);

// @route   GET api/posts
// @desc    Get all posts
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("SERVER ERROR");
  }
});

// @route   GET api/posts/:id
// @desc    Get post by id
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const posts = await Post.findById(req.params.id);
    if (!posts) {
      return res.status(400).send("POST NOT FOUND");
    }
    res.json(posts);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("SERVER ERROR");
  }
});

// @route   DELETE api/posts/:id
// @desc    delete post by id
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(400).send("POST NOT FOUND");
    }
    if (post.user.toString() !== req.user.id) {
      return res.status(401).send("NOT AUTHORIZED");
    } else {
      await post.remove();
      res.json("POST REMOVED");
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send("SERVER ERROR");
  }
});

// @route   PUT api/posts/like/:id
// @desc    Like a post
// @access  Private
router.put("/like/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).send({ msg: "POST DOES NOT EXIST" });
    }
    if (
      post.likes.filter(like => like.user.toString() === req.user.id).length > 0
    ) {
      return res.status(400).json({ msg: "Post already liked" });
    }

    post.likes.unshift({ user: req.user.id });
    await post.save();
    res.json(post.likes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

// @route   PUT api/posts/unlike/:id
// @desc    Unlike a post
// @access  Private
router.put("/unlike/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).send({ msg: "POST DOES NOT EXIST" });
    }
    if (
      post.likes.filter(like => like.user.toString() === req.user.id).length ===
      0
    ) {
      return res.status(400).json({ msg: "Post has not been yet liked" });
    }

    const removeIndex = post.likes
      .map(like => like.user.toString())
      .indexOf(req.user.id);
    post.likes.splice(removeIndex, 1);
    await post.save();
    res.json(post.likes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

// @route   PUT api/posts/comment/:id
// @desc    Leave a comment
// @access  Private
router.put(
  "/comment/:id",
  [
    auth,
    [
      check("text", "Comment is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const post = await Post.findById(req.params.id);
      if (!post) {
        return res.status(404).send({ msg: "POST DOES NOT EXIST" });
      }

      const user = await User.findById(req.user.id).select("-password");
      const newComment = {
        user: req.user.id,
        text: req.body.text,
        name: user.name
      };

      post.comments.unshift(newComment);
      await post.save();
      res.json(post.comments);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route   PUT api/posts/comment/:id/:comment_id
// @desc    Leave a comment
// @access  Private
router.put("/comment/:id/:comment_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).send({ msg: "POST DOES NOT EXIST" });
    }
    if (
      post.comments.map(
        comment =>
          comment.id.toString() === req.params.comment_id &&
          comment.user.toString() === req.user.id
      ).length === 0
    ) {
      res.status(400).send({ msg: "No comments to delete" });
    }
    const removeIndex = post.comments.indexOf(req.params.comment_id);
    post.comments.splice(removeIndex, 1);
    post.save();
    res.send(post.comments);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("SERVER ERROR");
  }
});
module.exports = router;
