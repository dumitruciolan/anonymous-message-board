// -----[Keep the tests in the same order!]-----
// if additional are added, keep them at the very end!

const server = require("../server"),
  chaiHttp = require("chai-http"),
  chai = require("chai"),
  { assert } = chai;
chai.use(chaiHttp);

suite("Functional Tests", () => {
  let thread1, thread2, reply1;
  const threadPassword = "threadPassword",
    replyPassword = "replyPassword";

  suite("API ROUTING FOR /api/threads/:board", () => {
    suite("POST", () => {
      test("Post a new thread to a board", done => {
        chai
          .request(server)
          .post("/api/threads/test")
          .send({
            text: "posting a new thread (thread1)",
            delete_password: threadPassword
          })
          .end((_, res) => {
            assert.equal(res.status, 200);
            assert.include(
              res.redirects[0],
              "/b/test",
              "should redirect to /b/test/."
            );

            chai
              .request(server)
              .post("/api/threads/test")
              .send({
                text: "posting a new thread (thread2)",
                delete_password: threadPassword
              })
              .end((_, res) => {
                assert.equal(res.status, 200);
                assert.include(
                  res.redirects[0],
                  "/b/test",
                  "should redirect to /b/test/."
                );
                done();
              });
          });
      });
    });

    suite("GET", () => {
      test("Get an array with the 10 most recent threads (max. 3 recent replies)", done => {
        chai
          .request(server)
          .get("/api/threads/test")
          .end((_, res) => {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.property(res.body[0], "_id");
            assert.property(res.body[1], "_id");
            assert.property(res.body[0], "text");
            assert.property(res.body[1], "text");
            assert.property(res.body[0], "created_on");
            assert.property(res.body[1], "created_on");
            assert.property(res.body[0], "bumped_on");
            assert.property(res.body[1], "bumped_on");
            assert.property(res.body[0], "replies");
            assert.property(res.body[1], "replies");
            assert.property(res.body[0], "replyCount");
            assert.property(res.body[1], "replyCount");
            assert.notProperty(res.body[0], "delete_password");
            assert.notProperty(res.body[1], "delete_password");
            assert.notProperty(res.body[0], "reported");
            assert.notProperty(res.body[1], "reported");
            assert.isArray(res.body[0].replies);
            assert.isArray(res.body[1].replies);
            assert.equal(res.body[0].text, "posting a new thread (thread1)");
            assert.equal(res.body[1].text, "posting a new thread (thread2)");
            assert.equal(res.body[0].replyCount, res.body[0].replies.length);
            assert.equal(res.body[1].replyCount, res.body[1].replies.length);
            assert.equal(res.body[0].created_on, res.body[0].bumped_on);
            assert.equal(res.body[1].created_on, res.body[1].bumped_on);
            thread1 = { ...res.body[0] };
            thread2 = { ...res.body[1] };
            done();
          });
      });
    });

    suite("DELETE", () => {
      test("Delete a thread with the correct password", done => {
        chai
          .request(server)
          .delete("/api/threads/test")
          .send({ thread_id: thread1._id, delete_password: threadPassword })
          .end((_, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, "success");
            done();
          });
      });

      test("Delete a thread with an incorrect password", done => {
        chai
          .request(server)
          .delete("/api/threads/test")
          .send({ thread_id: thread2._id, delete_password: "wrongPassword" })
          .end((_, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, "incorrect password");
            done();
          });
      });
    });

    suite("PUT", () => {
      test("Reporting a thread", done => {
        chai
          .request(server)
          .put("/api/threads/test")
          .send({ thread_id: thread2._id })
          .end((_, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, "success");
            done();
          });
      });
    });
  });

  suite("API ROUTING FOR /api/replies/:board", () => {
    suite("POST", () => {
      test("Post a new reply to a thread", done => {
        chai
          .request(server)
          .post("/api/replies/test")
          .send({
            thread_id: thread2._id,
            text: "posting a new reply",
            delete_password: replyPassword
          })
          .end((_, res) => {
            assert.equal(res.status, 200);
            done();
          });
      });

      suite("GET", () => {
        test("Get a specific thread with replies, if any", done => {
          chai
            .request(server)
            .get("/api/replies/test")
            .query({ thread_id: thread2._id })
            .end((_, res) => {
              assert.equal(res.status, 200);
              assert.property(res.body, "_id");
              assert.property(res.body, "text");
              assert.property(res.body, "created_on");
              assert.property(res.body, "bumped_on");
              assert.property(res.body, "replies");
              assert.notProperty(res.body, "delete_password");
              assert.notProperty(res.body, "reported");
              assert.isArray(res.body.replies);
              assert.equal(res.body.text, "posting a new thread (thread2)");
              reply1 = { ...res.body.replies[0] };
              done();
            });
        });
      });

      suite("PUT", () => {
        test("Reporting a reply", done => {
          chai
            .request(server)
            .put("/api/replies/test")
            .send({ reply_id: reply1._id, thread_id: thread2._id })
            .end((_, res) => {
              assert.equal(res.status, 200);
              assert.equal(res.text, "success");
              done();
            });
        });
      });

      suite("DELETE", () => {
        test("Delete a reply with the correct password", done => {
          chai
            .request(server)
            .delete("/api/replies/test")
            .send({
              reply_id: reply1._id,
              thread_id: thread2._id,
              delete_password: replyPassword
            })
            .end((_, res) => {
              assert.equal(res.status, 200);
              assert.equal(res.text, "success");
              done();
            });
        });
      });
    });

    suite("CLEANUP THE BOARD AFTER TESTING", () => {
      test("Delete the remaining test thread", done => {
        chai
          .request(server)
          .delete("/api/threads/test")
          .send({ thread_id: thread2._id, delete_password: threadPassword })
          .end((_, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, "success");
            done();
          });
      });
    });
  });
});
