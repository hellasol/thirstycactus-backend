const express = require("express");
const router = express.Router();
const { Comment, validate } = require("../models/comment");
const auth = require("../middleware/auth");
const admin = require("../middleware/auth");
const asyncMiddleware = require("../middleware/async");

// Create a comment
router.post(
  "/",
  asyncMiddleware(async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const comment = new Comment(req.body);
    await comment.save();

    res.send(comment);
  })
);

router.get(
  "/",
  asyncMiddleware(async (req, res) => {
    if (!req.query.plantId) {
      return res
        .status(400)
        .send({ message: 'forgot "plantId" in request query' });
    }
    const comments = await Comment.find({ plantId: req.query.plantId });
    res.send(comments);
  })
);

router.get(
  "/:id",
  asyncMiddleware(async (req, res) => {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res
        .status(404)
        .send("the comment with the given id was not found");
    }
    res.send(comment);
  })
);

module.exports = router;
