const postsRouter = require("express").Router();
const { check, validationResult } = require("express-validator");
const Post = require("../models/post");
const middleware = require("../utils/middleware");
const logger = require("../utils/logger");

postsRouter.post(
  "/",
  middleware.tokenExtractor,
  check("title").not().isEmpty(),
  check("programmingLang").not().isEmpty(),
  check("workPlace").not().isEmpty(),
  async (req, res) => {
    const {
      title,
      description,
      programmingLang,
      workHours,
      workPlace,
    } = req.body;

    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      res.status(400).send({ errors: validationErrors.array() });
    }
    try {
      let post = new Post({
        title,
        user: req.user.id,
        description,
        programmingLang,
        workHours,
        workPlace,
      });
      await post.save();
      const id = post.id;
      Post.findById(id)
        .populate("user")
        .then((post) => {
          res.json(post);
        });
    } catch (error) {
      res.status(500).send({ error: "Error posting!" });
    }
  }
);

postsRouter.get(
  "/",
  middleware.limitExtractor,
  middleware.pageExtractor,
  middleware.filterExtractor,
  middleware.sortingExtractor,
  middleware.fuzzySearchExtractor,
  async (req, res, next) => {
    req.model = Post;
    req.populate = [
      { path: "user" },
      { path: "comments", populate: { path: "user" } },
    ];
    next();
  },
  middleware.modelResolver
);

postsRouter.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate([
      { path: "user" },
      { path: "comments", populate: { path: "user" } },
    ]);
    res.json(post);
  } catch (error) {
    res.status(404).json({ error: "no such post found" });
  }
});
postsRouter.put("/:id", async (req, res) => {
  const { commId } = req.body;
  const action = req.header("action");
  try {
    const post = await Post.findOneAndUpdate(
      { _id: req.params.id },
      action === "add"
        ? { $push: { comments: commId } }
        : { $pull: { comments: commId } },
      { new: true }
    ).populate([
      { path: "user" },
      { path: "comments", populate: { path: "user" } },
    ]);
    res.json(post);
  } catch (error) {
    res.status(404).json({ error: "no such post found" });
  }
});
postsRouter.delete("/:id", async (req, res) => {
  try {
    await Post.findByIdAndRemove(req.params.id);
    res.status(204).end();
  } catch (error) {
    res.status(404).json({ error: "cant delete post" });
  }
});
module.exports = postsRouter;
