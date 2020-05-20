// -----[Keep the tests in the same order!]-----
// if additional are added, keep them at the very end!

const server = require("../server"),
  chaiHttp = require("chai-http"),
  chai = require("chai"),
  { assert } = chai;

chai.use(chaiHttp);

suite("Functional Tests", () => {
  suite("API ROUTING FOR /api/threads/:board", () => {
    suite("POST", () => {});

    suite("GET", () => {});

    suite("DELETE", () => {});

    suite("PUT", () => {});
  });

  suite("API ROUTING FOR /api/replies/:board", () => {
    suite("POST", () => {});

    suite("GET", () => {});

    suite("PUT", () => {});

    suite("DELETE", () => {});
  });
});
