const Board = require("../models/boardModel"),
  Thread = require("../models/threadModel"),
  Reply = require("../models/replyModel");

//  part of user story 4
const createThread = (name, callback) => {
  // create the new thread inside the board's threads
  Thread.create(name, (createError, createdThread) =>
    createError ? callback(createError, null) : callback(null, createdThread)
  );
};

// part of user story 6
const getThreads = async (board, callback) => {
  try {
    // find the board
    const foundBoard = await Board.findOne({ name: board }).exec();

    if (foundBoard) {
      // find the newest 10 threads
      const foundThreads = await Thread.find({ board: foundBoard })
        .sort("-bumped_on")
        .limit(10)
        .exec();

      const threads = await Promise.all(
        foundThreads.map(async thread => {
          const threadObject = await thread.toObject();

          // find the newest 3 replies
          const foundReplies = await Reply.find({ thread: thread._id })
              .sort("-created_on")
              .exec(),
            replies = foundReplies.map(reply => reply.toObject()).slice(0, 3);

          // add replies and return the obj
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

// part of user story 7
const getThread = (data, callback) => {
  const { board, thread_id } = data;

  // find the board
  Board.findOne({ name: board }, findBoardError => {
    findBoardError
      ? callback(findBoardError)
      : // find the thread
        Thread.findById(thread_id, (findThreadError, foundThread) => {
          findThreadError
            ? callback(findThreadError)
            : // find the reply
              Reply.find(
                { thread: foundThread },
                (findRepliesError, foundReplies) => {
                  if (findRepliesError) return callback(findRepliesError);

                  // add replies to the returned object
                  const thread = foundThread.toObject();
                  const replies = foundReplies.map(reply => reply.toObject());
                  thread.replies = replies;

                  return callback(null, thread);
                }
              );
        });
  });
};

// part of user story 10
const reportThread = (data, callback) => {
  const { board, thread_id } = data;

  // find the board
  Board.findOne({ name: board }, findError => {
    findError
      ? callback(findError)
      : // update the thread
        Thread.findByIdAndUpdate(thread_id, { reported: true }, updateError =>
          updateError ? callback(updateError) : callback(null, "success")
        );
  });
};

// part of user story 8
const deleteThread = (data, callback) => {
  const { board, thread_id, delete_password } = data;

  // find the board
  Board.findOne({ name: board }, findError => {
    findError
      ? callback(findError)
      : // find the thread
        Thread.findById(thread_id, (findThreadError, foundThread) => {
          if (findThreadError) return callback(findThreadError);

          const password = foundThread.delete_password;

          // delete the thread
          if (delete_password === password)
            Thread.findByIdAndDelete(thread_id, deleteThreadError => {
              deleteThreadError
                ? callback(deleteThreadError)
                : // delete the replies
                  Reply.deleteMany({ thread: thread_id }).exec();
              return callback(null, "success");
            });
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
