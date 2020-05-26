const mongoose = require("mongoose"),
  Board = require("../models/boardModel"),
  Thread = require("../models/threadModel");

const createThread = (name, callback) => {
  return Thread.create(name, (createErr, createdThread) => {
    if (createErr) return callback(createErr, null);
    return callback(null, createdThread);
  });
};

const getThreads = async (board, callback) => {
  try {
    const foundBoard = await Board.findOne({ name: board }).exec();
    // const boardId = foundBoard._id;

    if (foundBoard) {
      const foundThreads = await Thread.find({ board: foundBoard })
        .sort("-bumped_on")
        .limit(10)
        .exec();

      const threads = foundThreads.map(thread => thread.text);

      return callback(null, threads);
    }
  } catch (error) {
    return callback(error);
  }
};

module.exports = { createThread, getThreads };
