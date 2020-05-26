"use strict";

const mongoose = require("mongoose");

// set user schema & model
const BoardSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true }
});

// export model so we can access it from api.js
module.exports = mongoose.model("Board", BoardSchema);
