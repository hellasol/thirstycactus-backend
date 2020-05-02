const mongoose = require("mongoose");
const Joi = require("joi");

const commentSchema = new mongoose.Schema({
  comment: {
    type: String,
    minlength: 5,
    maxlength: 500,
    required: true,
  },
  plantId: {
    type: String,
    ref: "Plant",
    required: true,
  },
});

const Comment = mongoose.model("Comment", commentSchema);

function validateComment(comment) {
  const schema = {
    comment: Joi.string().min(5).max(500).required(),

    plantId: Joi.string().required(),
  };
  return Joi.validate(comment, schema);
}

exports.Comment = Comment;
exports.validate = validateComment;
exports.commentSchema = commentSchema;
