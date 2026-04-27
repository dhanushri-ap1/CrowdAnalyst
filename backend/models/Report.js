const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  placeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Place",
    required: true
  },

  crowdLevel: {
    type: Number,
    required: true
  },

  createdAt: {
    type: Date,
    default: Date.now,
    expires: 1800
  }
});

module.exports = mongoose.model("Report", reportSchema);