const mongoose = require("mongoose"),
  Board = require("../models/boardModel");

// create a board if we don't already have it
const findOrCreateBoard = (name, callback) =>
  Board.findOne({ name }, (findError, foundBoard) => {
    if (findError) return callback(findError);
    if (foundBoard) return callback(null, foundBoard);

    return Board.create({ name }, (createError, createdBoard) => {
      if (createError) return callback(createError, null);
      return callback(null, createdBoard);
    });
  });

module.exports = { findOrCreateBoard };
