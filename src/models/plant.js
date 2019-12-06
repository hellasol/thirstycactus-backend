const mongoose = require("mongoose");
const Joi = require("joi");

const plantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 50
  },
  buydate: {
    type: String,
    minlength: 6,
    maxlength: 10
  },
  comment: {
    type: String,
    minlength: 3,
    maxlength: 500
  },
  image: {
    type: String
  }
});

const Plant = mongoose.model("Plant", plantSchema);

function validatePlant(plant) {
  const schema = {
    name: Joi.string()
      .min(1)
      .max(50)
      .required(),
    buydate: Joi.string()
      .min(6)
      .max(10),
    comment: Joi.string()
      .min(3)
      .max(500),
    image: Joi.string()
  };
  return Joi.validate(plant, schema);
}

exports.Plant = Plant;
exports.validate = validatePlant;
exports.plantSchema = plantSchema;
