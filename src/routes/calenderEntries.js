const express = require("express");
const router = express.Router();
const { CalenderEntry, validate } = require("../models/calenderEntry");
const auth = require("../middleware/auth");
const admin = require("../middleware/auth");
const asyncMiddleware = require("../middleware/async");

//Getting list of all entries
router.get(
  "/",
  asyncMiddleware(async (req, res) => {
    const calenderEntries = await CalenderEntry.find().sort("date");
    res.send(calenderEntries);
  })
);

//Adding entry
router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const calenderEntry = new CalenderEntry({
    date: req.body.date,
    description: req.body.description
  });

  await calenderEntry.save();

  res.send(calenderEntry);
});

module.exports = router;
