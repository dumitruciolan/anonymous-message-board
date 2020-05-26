const mongoose = require("mongoose"),
  Board = require("../models/boardModel"),
  Thread = require("../models/threadModel"),
  Reply = require("../models/replyModel");

const createReply = (data, callback) => {
  const { text, delete_password, thread_id } = data;

  return Thread.findByIdAndUpdate(
    thread_id,
    { bumped_on: new Date() },
    (createErr, foundThread) => {
      if (createErr) return callback(createErr, null);
      if (foundThread) {
        Reply.create(
          { thread: foundThread, text, delete_password },
          (error, createdReply) => {
            if (error) return callback(error, null);
            return callback(null, createdReply);
          }
        );
      }
      return callback();
    }
  );
};

module.exports = { createReply };
