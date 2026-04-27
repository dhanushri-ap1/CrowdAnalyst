const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema({
  name: String,
  category: String,

  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point"
    },
    coordinates: [Number]
  },

  connections: [String]
});

placeSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Place", placeSchema);