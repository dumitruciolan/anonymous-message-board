"use strict";

const mongoose = require("mongoose"),
  { ObjectId } = mongoose.Schema.Types;

// set user schema & model
const ThreadSchema = new mongoose.Schema(
  {
    board: { type: ObjectId, ref: "Board", required: true, index: true },
    text: { type: String, required: true },
    created_on: { type: Date, default: new Date() },
    bumped_on: { type: Date, default: new Date() },
    reported: { type: Boolean, default: false },
    delete_password: { type: String, required: true }
  }
);

ThreadSchema.set('toObject', {
  virtuals: true,
  transform: (doc, ret, options) => {
    delete ret.board;
    delete ret.delete_password;
    delete ret.id;
    delete ret.reported;
    delete ret.__v;
  },
});

// export model so we can access it from api.js
module.exports = mongoose.model("Thread", ThreadSchema);
