"use strict";

const mongoose = require("mongoose"),
  { ObjectId } = mongoose.Schema.Types;

// set user schema & model
const ReplySchema = new mongoose.Schema({
  thread: { type: ObjectId, ref: "Thread", index: true },
  text: { type: String, required: true },
  created_on: { type: Date, default: new Date() },
  bumped_on: { type: Date, default: new Date() },
  reported: { type: Boolean, default: false },
  delete_password: { type: String, required: true }
});

// return a custom object
ReplySchema.set("toObject", {
  // the changes are not persisted
  virtuals: true,
  // remove the unwanted fields
  transform: (doc, ret, options) => {
    delete ret.delete_password;
    delete ret.id;
    delete ret.reported;
    delete ret.thread;
    delete ret.__v;
  }
});

// export model so we can access it from api.js
module.exports = mongoose.model("Reply", ReplySchema);
