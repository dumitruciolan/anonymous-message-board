const mongoose = require("mongoose"),
  Board = require("../models/boardModel"),
  Thread = require("../models/threadModel"),
  Reply = require("../models/replyModel");

// push the new thread inside the threads of this board
const createThread = (name, callback) => {
  Thread.create(name, (createError, createdThread) => {
    if (createError) return callback(createError, null);
    return callback(null, createdThread);
  });
};

const getThreads = async (board, callback) => {
  try {
    const foundBoard = await Board.findOne({ name: board }).exec();

    if (foundBoard) {
      const foundThreads = await Thread.find({ board: foundBoard })
        .sort("-bumped_on")
        .limit(10)
        .exec();

      const threads = await Promise.all(
        foundThreads.map(async thread => {
          const threadObject = await thread.toObject();
          const foundReplies = await Reply.find({ thread: thread._id })
            .sort("-created_on")
            .exec();
          const replies = foundReplies
            .map(reply => {
              return reply.toObject();
            })
            .slice(0, 3);
          threadObject.replies = replies;
          threadObject.replyCount = foundReplies.length;
          return threadObject;
        })
      );
      return callback(null, threads);
    }
  } catch (error) {
    return callback(error);
  }
};

const getThread = (data, callback) => {
  const { board, thread_id } = data;

  Board.findOne({ name: board }, (findBoardError, foundBoard) => {
    if (findBoardError) return callback(findBoardError);

    if (foundBoard) {
      Thread.findById(thread_id, (findThreadError, foundThread) => {
        if (findThreadError) return callback(findThreadError);

        if (foundThread)
          Reply.find(
            { thread: foundThread },
            (findRepliesError, foundReplies) => {
              if (findRepliesError) return callback(findRepliesError);

              const thread = foundThread.toObject();

              const replies = foundReplies.map(reply => {
                return reply.toObject();
              });

              thread.replies = replies;

              return callback(null, thread);
            }
          );
      });
    }
  });
};

const reportThread = (data, callback) => {
  const { board, thread_id } = data;

  Board.findOne({ name: board }, (findError, foundBoard) => {
    if (findError) return callback(findError);

    if (foundBoard)
      Thread.findByIdAndUpdate(
        thread_id,
        { reported: true },
        { new: true },
        (updateError, updatedThread) => {
          if (updateError) return callback(updateError);
          if (updatedThread) return callback(null, "success");
        }
      );
  });
};

const deleteThread = (data, callback) => {
  const { board, thread_id, delete_password } = data;

  Board.findOne({ name: board }, (findError, foundBoard) => {
    if (findError) return callback(findError);

    if (foundBoard)
      Thread.findById(thread_id, (findThreadError, foundThread) => {
        if (findThreadError) return callback(findThreadError);

        const password = foundThread.delete_password;

        if (delete_password === password)
          // delete it
          Thread.findByIdAndDelete(
            thread_id,
            (deleteThreadError, deletedThread) => {
              if (deleteThreadError) return callback(deleteThreadError);

              if (deletedThread) {
                Reply.deleteMany({ thread: thread_id }).exec();
                return callback(null, "success");
              }
            }
          );
        // keep it
        else return callback(null, "incorrect password");
      });
  });
};

module.exports = {
  createThread,
  getThread,
  getThreads,
  reportThread,
  deleteThread
};
