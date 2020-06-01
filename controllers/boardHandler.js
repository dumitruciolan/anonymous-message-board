const Board = require("../models/boardModel");

// create a board if we don't already have it
const findOrCreateBoard = (name, callback) =>
  // find the board in the database
  Board.findOne({ name }, (findError, foundBoard) => {
    if (findError) return callback(findError);
    else if (foundBoard) return callback(null, foundBoard);

    // create the board if not found
    else return Board.create({ name }, (createError, createdBoard) =>
      createError ? callback(createError, null) : callback(null, createdBoard)
    );
  });

module.exports = { findOrCreateBoard };
