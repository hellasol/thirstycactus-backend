const mongoose = require("mongoose");
const Joi = require("joi");

const calenderEntrySchema = new mongoose.Schema({
  date: {
    type: String,
    maxlength: 8,
    minlength: 8,
    required: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 200,
    minlength: 5
  },
});

const CalenderEntry = mongoose.model("CalenderEntry", calenderEntrySchema);

function validateCalenderEntry(calenderEntry) {
  const schema = {
    date: Joi.string()
      .max(8)
      .min(8)
      .required(),
    description: Joi.string()
      .required()
      .max(200)
      .min(5),
  };

  return Joi.validate(calenderEntry, schema);
}

exports.CalenderEntry = CalenderEntry;
exports.validate = validateCalenderEntry;
