const mongoose = require("mongoose");
const Board = require("../models/boardModel");

const findOrCreateBoard = (name, callback) => {
  Board.findOne({ name }, (findErr, foundBoard) => {
    if (findErr) return callback(findErr);
    if (foundBoard) {
      return callback(null, foundBoard);
    }
    return Board.create({ name }, (createErr, createdBoard) => {
      if (createErr) return callback(createErr, null);
      return callback(null, createdBoard);
    });
  });
};

module.exports = { findOrCreateBoard };
