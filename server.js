"use strict";

const express = require("express"),
  bodyParser = require("body-parser"),
  { expect } = require("chai"),
  cors = require("cors"),
  app = express();

const apiRoutes = require("./routes/api.js"),
  fccTestingRoutes = require("./routes/fcctesting.js"),
  runner = require("./test-runner");

app.use("/public", express.static(process.cwd() + "/public"));
app.use(cors({ origin: "*" })); //For FCC testing purposes only

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Sample front-end
app
  .route("/b/:board/")
  .get((req, res) => res.sendFile(process.cwd() + "/views/board.html"));

app
  .route("/b/:board/:threadid")
  .get((req, res) => res.sendFile(process.cwd() + "/views/thread.html"));

//Index page (static HTML)
app
  .route("/")
  .get((req, res) => res.sendFile(process.cwd() + "/views/index.html"));

//For FCC testing purposes
fccTestingRoutes(app);
//Routing for API
apiRoutes(app);

//404 Not Found Middleware
app.use((req, res, next) => {
  res
    .status(404)
    .type("text")
    .send("Not Found");
});

//Start our server and tests!
app.listen(process.env.PORT || 3000, () => {
  console.log("Listening on port " + process.env.PORT);
  if (process.env.NODE_ENV === "test") {
    console.log("Running Tests...");
    setTimeout(() => {
      try {
        runner.run();
      } catch (e) {
        console.log("Tests are not valid:");
        console.log(e);
      }
    }, 1500);
  }
});

module.exports = app; //for testing