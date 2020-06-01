"use strict";

const router = require("express").Router(),
  boardHandler = require("../controllers/boardHandler"),
  threadHandler = require("../controllers/threadHandler"),
  replyHandler = require("../controllers/replyHandler"),
  { ErrorHandler } = require("../helpers/error");

router
  .route("/threads/:board")
  // user story 6
  .get((req, res, next) => {
    const { board } = req.params;

    threadHandler.getThreads(board, (error, foundThreads) =>
      error ? next(error) : res.json(foundThreads)
    );
  })

  // user story 4
  .post((req, res, next) => {
    try {
      const { board } = req.params,
        { text, delete_password } = req.body;

      // find the board
      boardHandler.findOrCreateBoard(board, (error, foundBoard) =>
        error
          ? next(error)
          // create a new thread
          : threadHandler.createThread(
            { board: foundBoard, text, delete_password },
            (createThreadError, createdThread) => {
              if (createThreadError) return next(createThreadError);

              else if (createdThread)
                return res.redirect(301, `/b/${foundBoard.name}`);

              else
                throw new ErrorHandler(
                  500,
                  `Something went wrong creating the ${text} thread on the ${board} board.`
                );
            }
          )
      );
    } catch (error) {
      return next(error);
    }
  })

  // user story 10
  .put((req, res, next) => {
    const { board } = req.params,
      { thread_id } = req.body;

    threadHandler.reportThread({ board, thread_id }, (error, reportStatus) =>
      error ? next(error) : res.send(reportStatus)
    );
  })

  // user story 8
  .delete((req, res, next) => {
    const { board } = req.params,
      { thread_id, delete_password } = req.body;

    threadHandler.deleteThread(
      { board, thread_id, delete_password },
      (error, deleteStatus) => (error ? next(error) : res.send(deleteStatus))
    );
  });

router
  .route("/replies/:board")
  // user story 7
  .get((req, res, next) => {
    const { board } = req.params,
      { thread_id } = req.query;

    threadHandler.getThread({ board, thread_id }, (error, foundThread) =>
      error ? next(error) : res.json(foundThread)
    );
  })

  // user story 5
  .post((req, res, next) => {
    const { board } = req.params,
      { text, delete_password, thread_id } = req.body;

    try {
      // find the board
      boardHandler.findOrCreateBoard(board, (error, foundBoard) => {
        error
          ? next(error)
          // create a new reply
          : replyHandler.createReply(
            { board, text, delete_password, thread_id },
            (createReplyError, createdReply) => {
              if (createReplyError) return next(createReplyError);

              else if (createdReply)
                return res.redirect(
                  301,
                  `/b/${foundBoard.name}/${thread_id}`
                );

              else
                throw new ErrorHandler(
                  500,
                  `Something went wrong adding your reply to the ${board} board.`
                );
            }
          );
      });
    } catch (error) {
      return next(error);
    }
  })

  // user story 5
  .put((req, res, next) => {
    const { board } = req.params,
      { reply_id } = req.body;

    replyHandler.reportReply({ board, reply_id }, (error, reportStatus) =>
      error ? next(error) : res.send(reportStatus)
    );
  })

  // user story 9
  .delete((req, res, next) => {
    const { board } = req.params,
      { reply_id, delete_password } = req.body;

    replyHandler.deleteReply(
      { board, reply_id, delete_password },
      (error, deleteStatus) => (error ? next(error) : res.send(deleteStatus))
    );
  });

module.exports = router;
