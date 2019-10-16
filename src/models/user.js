const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    maxlength: 55,
    minlength: 5,
    required: true
  },
  name: {
    type: String,
    required: true,
    maxlength: 55,
    minlength: 3
  },
  password: {
    type: String,
    required: true,
    maxlength: 255,
    minlength: 5
  }
});

userSchema.methods.generateAuthToken = function() {
  const token = jwt.sign(
    { _id: this._id, isAdmin: this.isAdmin },
    JWT_SECRET
  );
  return token;
};

const User = mongoose.model("User", userSchema);

function validateUser(user) {
  const schema = {
    email: Joi.string()
      .email()
      .max(55)
      .min(5)
      .required(),
    name: Joi.string()
      .required()
      .max(55)
      .min(3),
    password: Joi.string()
      .required()
      .max(255)
      .min(5)
  };

  return Joi.validate(user, schema);
}

exports.User = User;
exports.validate = validateUser;
