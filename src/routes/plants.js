const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const logger = require("morgan");
const { Plant, validate } = require("../models/plant");
const { visionService, trefleService } = require("../services");
const asyncMiddleware = require("../middleware/async");


const upload = multer({
  storage: multer.diskStorage({
    destination: "images",
    filename: function(req, file, cb) {
      cb(null, `${Date.now()}-${file.originalname}`);
    }
  })
});

const router = express.Router();
router.use(bodyParser()); // to use bodyParser (for text/number data transfer between clientg and server)
// router.set('view engine', 'hbs');  // setting hbs as the view engine
router.use("/images", express.static("images")); // making ./public as the static directory
// router.set('views', __dirname + '/views');  // making ./views as the views directory
router.use(logger("dev")); // Creating a logger (using morgan)
router.use(express.json());
router.use(express.urlencoded({ extended: false }));

//Getting list of all plants
router.get(
  "/",
  asyncMiddleware(async (req, res) => {
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

//Adding plant
router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const plant = new Plant(req.body);
  await plant.save();

  res.send(plant);
});

//Adding plant
router.post(
  "/alternative",
  upload.single("image"),
  asyncMiddleware(async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    if (!req.file) {
      return res.status(400).send("no image was uploaded");
    }
    //FIX THIS
    const image =
      "http://localhost:3000/api/plants/images/" + req.file.filename;

    const labels = await visionService.detectLabels(req.file.filename);

    const plant = new Plant({ ...req.body, image, labels });
    await plant.save();

    res.send(plant);

  })
);

router.post(
  "/:id/upload",
  upload.single("myFile"),
  asyncMiddleware(async (req, res) => {
    console.log(req.body);
    console.log(req.file);
    if (!req.file) {
      return res.status(400).send("no image was uploaded");
    }
    const image =
      "http://localhost:3000/api/plants/images/" + req.file.filename;

    const plant = await Plant.findByIdAndUpdate(
      req.params.id,
      { image },
      { new: true }
    );

    if (!plant)
      return res.status(404).send("the plant with the given id was not found");

    res.send(plant);
  })
);

// async function main() {
//   const plants = await trefleService.getPlantsByName('sunflower')
//   console.log(plants)

// }
// main();

router.post("/dummy", async (req, res) => {
  const labels = await visionService.detectLabels("https://www.flowerpower.com.au/media/catalog/product/cache/e4d64343b1bc593f1c5348fe05efa4a6/9/3/9324228000583.jpg");
  let results = {};
  for(const label of labels) {
   const plants = await trefleService.getPlantsByName(label)
   results[label] = plants;
  }
  res.send(results);
});


//change plant
router.put("/:id", async (req, res) => {
  const result = validate(req.body);
  if (result.error)
    return res.status(400).send(result.error.details[0].message);

  const plant = await Plant.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name },
    { comments: req.body.comments },
    { new: true }
  );

  if (!plant)
    return res.status(404).send("the plant with the given id was not found");

  res.send(plant);
});


module.exports = router;
