const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const logger = require("morgan");
const { Plant, validate } = require("../models/plant");
const { visionService, trefleService, bucketService } = require("../services");
const asyncMiddleware = require("../middleware/async");
const fs = require("fs");

const MB = 1024 * 1024;
const upload = multer({
  storage: multer.diskStorage({
    destination: "images",
    filename: function (req, file, cb) {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
  limits: {
    fileSize: 5 * MB,
  },
});

const router = express.Router();
router.use(bodyParser()); // to use bodyParser (for text/number data transfer between clientg and server)
router.use("/images", express.static("images")); // making ./public as the static directory
router.use(logger("dev")); // Creating a logger (using morgan)
router.use(express.json());
router.use(express.urlencoded({ extended: false }));

//Get all plants
router.get(
  "/",
  asyncMiddleware(async (req, res) => {
    const plantDocs = await Plant.find({
      trefleid: { $exists: true, $ne: null },
    }).sort("name");
    const plants = plantDocs.map((doc) => doc.toObject());
    for (const plant of plants) {
      await trefleService.enrichPlant(plant);
    }
    res.send(plants);
  })
);
//Get plant by id
router.get("/:id", async (req, res) => {
  const plantDoc = await Plant.findById(req.params.id);
  if (!plantDoc)
    return res.status(404).send("the plant with the given id was not found");
  const plant = plantDoc.toObject();
  await trefleService.enrichPlant(plant);
  res.send(plant);
});

//Create Plant
router.post(
  "/",
  upload.single("image"),
  asyncMiddleware(async (req, res) => {
    console.log(1, req.body);
    const { error } = validate(req.body);
    console.log(2, error);
    if (error) return res.status(400).send(error.details[0].message);
    console.log(3);
    if (!req.file) {
      return res.status(400).send("no image was uploaded");
    }
    console.log(4);
    const { filename, path } = req.file;
    const image = await bucketService.upload(filename, path);

    await new Promise((resolve, reject) => {
      fs.unlink(req.file.path, (err) => (err ? reject(err) : resolve()));
    });
    const plant = new Plant({ ...req.body, image });
    await plant.save();
    res.send(plant);
  })
);

//Discover Label
router.post(
  "/:id/discover-label",
  asyncMiddleware(async (req, res) => {
    const plant = await Plant.findById(req.params.id);
    if (!plant)
      return res.status(404).send("the plant with the given id was not found");

    if (!plant.image) return res.status(400).send("no image was uploaded");

    const label = await visionService.detectLabels(plant.image);
    res.send(label);
  })
);

//update plant with vision api labels
router.put("/:id", upload.single("image"), async (req, res) => {
  const result = validate(req.body);
  if (result.error)
    return res.status(400).send(result.error.details[0].message);
  const plant = await Plant.findById(req.params.id);
  if (!plant)
    return res.status(404).send("the plant with the given id was not found");

  Object.assign(plant, req.body);
  if (req.file) {
    const { filename, path } = req.file;
    const image = await bucketService.upload(filename, path);
    plant.image = image;
  }

  await plant.save();
  res.send(plant);
});

//trefle
router.post(
  "/:id/trefle-search",
  asyncMiddleware(async (req, res) => {
    const plant = await Plant.findById(req.params.id);
    if (!plant)
      return res.status(404).send("the plant with the given id was not found");

    if (!plant.label) return res.status(400).send("no label was selected");

    let results = await trefleService.getPlantsByName(plant.label);
    results = results.map((result) => ({
      id: result.id,
      commonName: result.common_name,
      scientificName: result.scientific_name,
      images: result.image_url ? [result.image_url] : [],
    }));
    res.send(results);
  })
);

//update plant with trefle results
router.put("/:trefleid", async (req, res) => {
  const result = validate(req.body);
  if (result.error)
    return res.status(400).send(result.error.details[0].message);
  const plant = await Plant.findById(req.params.id);
  if (!plant)
    return res
      .status(404)
      .send("the plant with the given trefle id was not found");

  await plant.update(req.body);
  res.send(plant);
});

module.exports = router;
