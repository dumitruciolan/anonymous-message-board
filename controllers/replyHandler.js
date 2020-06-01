const Board = require("../models/boardModel"),
  Thread = require("../models/threadModel"),
  Reply = require("../models/replyModel");

// part of user story 5
const createReply = (data, callback) => {
  const { text, delete_password, thread_id } = data;

  // find the thread
  Thread.findByIdAndUpdate(
    thread_id,
    { bumped_on: Date.now() },
    (createError, foundThread) => {
      createError
        ? callback(createError, null)
        : // create the reply
          Reply.create(
            { thread: foundThread, text, delete_password },
            (error, createdReply) =>
              error ? callback(error, null) : callback(null, createdReply)
          );
    }
  );
};

// part of user story 11
const reportReply = (data, callback) => {
  const { board, reply_id } = data;

  // find the board
  Board.findOne({ name: board }, findError =>
    findError
      ? callback(findError)
      : // update the reply
        Reply.findByIdAndUpdate(
          reply_id,
          { $set: { reported: true } },
          updateError =>
            updateError ? callback(updateError) : callback(null, "success")
        )
  );
};

// part of user story 9
const deleteReply = (data, callback) => {
  const { board, reply_id, delete_password } = data;

  // find the board
  Board.findOne({ name: board }, findError =>
    findError
      ? callback(findError)
      : // find the reply
        Reply.findById(reply_id, (findReplyError, foundReply) => {
          if (findReplyError) return callback(findReplyError);

          const password = foundReply.delete_password;

          // delete the reply
          if (delete_password === password) {
            foundReply.text = "[deleted]";
            // save the change in the database
            foundReply.save(saveReplyError =>
              saveReplyError
                ? callback(saveReplyError)
                : callback(null, "success")
            );
          } else return callback(null, "incorrect password");
        })
  );
};

module.exports = { createReply, reportReply, deleteReply };
