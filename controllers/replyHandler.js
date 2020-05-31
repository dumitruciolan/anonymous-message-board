const Board = require("../models/boardModel");
const Thread = require("../models/threadModel");
const Reply = require("../models/replyModel");

const createReply = (data, callback) => {
  const { text, delete_password, thread_id } = data;

  Thread.findByIdAndUpdate(
    thread_id,
    { bumped_on: Date.now() },
    (createError, foundThread) => {
      if (createError) return callback(createError, null);

      if (foundThread)
        Reply.create(
          { thread: foundThread, text, delete_password },
          (error, createdReply) => {
            if (error) return callback(error, null);

            return callback(null, createdReply);
          }
        );
    }
  );
};

const reportReply = (data, callback) => {
  const { board, reply_id } = data;

  Board.findOne({ name: board }, (findError, foundBoard) => {
    if (findError) return callback(findError);

    if (foundBoard)
      Reply.findByIdAndUpdate(
        reply_id,
        { $set: { reported: true } },
        { new: true },
        (updateError, updatedReply) => {
          if (updateError) return callback(updateError);

          if (updatedReply) return callback(null, "success");
        }
      );
  });
};

const deleteReply = (data, callback) => {
  const { board, reply_id, delete_password } = data;

  Board.findOne({ name: board }, (findError, foundBoard) => {
    if (findError) return callback(findError);

    if (foundBoard)
      Reply.findById(reply_id, (findReplyError, foundReply) => {
        if (findReplyError) return callback(findReplyError);

        const password = foundReply.delete_password;

        if (delete_password === password) {
          foundReply.text = "[deleted]";
          foundReply.save((saveReplyError, savedReply) => {
            if (saveReplyError) return callback(saveReplyError);

            if (savedReply) return callback(null, "success");
          });
        } else return callback(null, "incorrect password");
      });
  });
};

module.exports = { createReply, reportReply, deleteReply };
