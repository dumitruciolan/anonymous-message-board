"use strict";

const router = require("express").Router();
const boardHandler = require("../controllers/boardHandler"),
  threadHandler = require("../controllers/threadHandler"),
  replyHandler = require("../controllers/replyHandler"),
  { ErrorHandler } = require("../helpers/error"),
  { expect } = require("chai");

router
  .route("/threads/:board")

  .get((req, res, next) => {
    const { board } = req.params;

    threadHandler.getThreads(board, (error, foundThreads) => {
      if (error) next(error);
      if (foundThreads) res.json(foundThreads);
    });
  })

  .post((req, res, next) => {
    try {
      const { board } = req.params,
        { text, delete_password } = req.body;

      boardHandler.findOrCreateBoard(board, (error, foundBoard) => {
        if (error) next(error);

        threadHandler.createThread(
          { board: foundBoard, text, delete_password },
          (createThreadError, createdThread) => {
            if (error) next(error);
            if (createdThread) res.redirect(301, `/b/${foundBoard.name}/`);
            else
              throw new ErrorHandler(
                500,
                `Something went wrong creating the ${text} thread on the ${board} board.`
              );
          }
        );
      });
    } catch (error) {
      next(error);
    }
  })

  .put((req, res, next) => {
    const { board } = req.params,
      { thread_id } = req.body;

    threadHandler.reportThread({ board, thread_id }, (error, reportStatus) => {
      if (error) next(error);

      if (reportStatus) res.send(reportStatus);
    });
  })

  .delete((req, res, next) => {
    const { board } = req.params,
      { thread_id, delete_password } = req.body;

    threadHandler.deleteThread(
      { board, thread_id, delete_password },
      (error, deleteStatus) => {
        if (error) next(error);

        if (deleteStatus) res.send(deleteStatus);
      }
    );
  });

router
  .route("/replies/:board")
  .get((req, res, next) => {
    const { board } = req.params,
      { thread_id } = req.query;

    threadHandler.getThread({ board, thread_id }, (error, foundThread) => {
      if (error) next(error);
      if (foundThread) res.json(foundThread);
    });
  })

  .post((req, res, next) => {
    const { board } = req.params,
      { text, delete_password, thread_id } = req.body;

    try {
      boardHandler.findOrCreateBoard(board, (error, foundBoard) => {
        if (error) next(error);

        replyHandler.createReply(
          { board, text, delete_password, thread_id },
          (createReplyError, createdReply) => {
            if (createReplyError) next(createReplyError);
            if (createdReply)
              res.redirect(301, `/b/${foundBoard.name}/${thread_id}`);
            else
              throw new ErrorHandler(
                500,
                `Something went wrong adding your reply to the ${board} board.`
              );
          }
        );
      });
    } catch (error) {
      next(error);
    }
  })

  .put((req, res, next) => {
    const { board } = req.params;
    const { reply_id } = req.body;

    replyHandler.reportReply({ board, reply_id }, (error, reportStatus) => {
      if (error) next(error);

      if (reportStatus) res.send(reportStatus);
    });
  })

  .delete((req, res, next) => {
    const { board } = req.params,
      { reply_id, delete_password } = req.body;

    replyHandler.deleteReply(
      { board, reply_id, delete_password },
      (error, deleteStatus) => {
        if (error) next(error);

        if (deleteStatus) res.send(deleteStatus);
      }
    );
  });

module.exports = router;
