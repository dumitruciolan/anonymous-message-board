"use strict";

const { expect } = require("chai");
const shortid = require("shortid");
const boardsDB = {};

module.exports = app => {
  app
    .route("/api/threads/:board")

    .get((req, res) => {
      const { board } = req.params;
      const mostRecent = boardsDB[board].threads
        .sort((a, b) => b.bumped_on - a.bumped_on)
        .slice(0, 10)
        .map(t => ({
          ...t,
          replies: t.replies
            .sort((a, b) => b.created_on - a.created_on)
            .slice(0, 3),
          replycount: t.replies.length,
          delete_password: undefined,
          reported: undefined
        }));

      res.json(mostRecent);
    })

    .post((req, res) => {
      const { board } = req.params;
      const { text, delete_password } = req.body;
      const newThread = {
        _id: shortid.generate,
        created_on: new Date(),
        bumped_on: new Date(),
        reported: false,
        delete_password,
        replies: []
      };

      boardsDB[board]
        ? // create a board if we don't already have it
          (boardsDB[board] = { threads: [newThread] })
        : // push the new thread inside the threads of this board
          boardsDB[board].threads.push(newThread);

      res.redirect(`/b/${board}/`);
    })

    .put((req, res) => {
      const { board } = req.params;
      const { thread_id } = req.body;

      boardsDB[board].threads = boardsDB[board].threads.map(thread => {
        if (thread._id === thread_id) return { ...thread, reported: true };

        return thread;
      });

      res.send("success");
    })

    .delete((req, res) => {
      const { board } = req.params;
      const { thread_id, delete_password } = req.body;

      const findThread = boardsDB[board].threads.find(
        thread => thread._id === thread_id
      );

      if (delete_password === findThread.delete_password) {
        // delete it
        boardsDB[board].threads = boardsDB[board].threads.filter(
          thread => thread._id !== thread_id
        );
        res.send("success");
      } else {
        // keep it
        res.send("incorrect password");
      }
    });

  app
    .route("/api/replies/:board")
    .get((req, res) => {
      const { board } = req.params;
      const { thread_id } = req.query;
      const thread = boardsDB[board].threads.find(
        thread => thread._id == thread_id
      );

      res.json({ ...thread, delete_password: undefined, reported: undefined });
    })

    .post((req, res) => {
      const { board } = req.params;
      const { text, delete_password, thread_id } = req.body;

      boardsDB[board].threads = boardsDB[board].threads.map(thread => {
        if (thread._id === thread_id) {
          const newReply = {
            _id: shortid.generate,
            created_on: new Date(),
            reported: false,
            delete_password
          };

          return {
            ...thread,
            bumped_on: new Date(),
            replies: [...thread.replies, newReply]
          };
        }

        return thread;
      });

      res.redirect(`/b/${board}/${thread_id}`);
    })

    .put((req, res) => {
      const { board } = req.params;
      const { thread_id, reply_id } = req.body;

      boardsDB[board].threads = boardsDB[board].threads.map(thread => {
        if (thread._id === thread_id) {
          return {
            ...thread,
            replies: thread.replies.map(reply => {
              if (reply._id === reply_id) return { ...reply, reported: true };

              return reply;
            })
          };
        }

        return thread;
      });

      res.send("success");
    })

    .delete((req, res) => {
      const { board } = req.params;
      const { thread_id, reply_id, delete_password } = req.body;
      const findThread = boardsDB[board].threads.find(
        thread => thread._id === thread_id
      );
      const findReply = findThread.replies.find(
        reply => reply._id === reply_id
      );

      if (delete_password === findReply.delete_password) {
        // delete it
        boardsDB[board].threads = boardsDB[board].threads.map(thread => {
          if (thread._id === thread_id) {
            return {
              ...thread,
              replies: thread.replies.map(reply => {
                if (reply._id === reply_id) {
                  return {
                    ...reply,
                    text: "[deleted]"
                  };
                }

                return reply;
              })
            };
          }

          return thread;
        });
        res.send("success");
      } else {
        // keep it
        res.send("incorrect password");
      }
    });
};

// remove shortid
