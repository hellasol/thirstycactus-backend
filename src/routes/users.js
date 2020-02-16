const express = require("express");
const router = express.Router();
const { User, validate } = require("../models/user");
const _ = require("lodash");
const bcryptjs = require("bcryptjs");
const auth = require("../middleware/auth");
//const { User, validate } = require("../models/user.model");

router.get("/", async (req, res) => {
  const users = await User.find().select("-password");
  res.send(users);
});

router.get("/current", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.send(user);
});

router.get("/:id", async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.send(user);
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already registered");

  user = new User(_.pick(req.body, ["name", "email", "password"]));
  const salt = await bcryptjs.genSalt(10);
  user.password = await bcryptjs.hash(user.password, salt);

  await user.save();

  const token = user.generateAuthToken();
  res.header("x-auth-token", token).send({
    _id: user._id,
    name: user.name,
    email: user.email
  });
});

module.exports = router;
