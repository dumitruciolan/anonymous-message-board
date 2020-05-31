"use strict";

const mongoose = require("mongoose");

// connect to the database
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
});

// set user schema & model
const BoardSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true }
});

// import the other models
require("../models/threadModel");
require("../models/replyModel");

// export model so we can access it from server.js
module.exports = mongoose.model("Board", BoardSchema);
