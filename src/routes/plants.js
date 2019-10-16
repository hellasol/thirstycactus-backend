const express = require("express");
const router = express.Router();
const { Plant, validate } = require("../models/plant");
const { Comment} = require("../models/comment")
const auth = require("../middleware/auth");
const admin = require("../middleware/auth");
const asyncMiddleware = require("../middleware/async");

//Getting list of all plants
router.get("/", asyncMiddleware(async (req, res) => {
    const plants = await Plant.find().sort("name");
    res.send(plants);
  })
);

router.get("/:id", async (req, res) => {
    const plant = await Plant.findById(req.params.id);
    if (!plant)
      return res.status(404).send("the plant with the given id was not found");
    res.send(plant);
  });

//Adding plant manually
router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const plant = new Plant(req.body);
  await plant.save();

  res.send(plant);
});

//change plant 
router.put("/:id", async (req, res) => {
    const result = validate(req.body);
    if (result.error)
      return res.status(400).send(result.error.details[0].message);
  
    const plant = await Plant.findByIdAndUpdate(
      req.params.id,
      {name: req.body.name },
      {comments: req.body.comments},
      {new: true }
    );
  
    if (!plant)
      return res.status(404).send("the plant with the given id was not found");
  
    res.send(plant);
  });

module.exports = router;