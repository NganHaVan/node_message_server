const express = require("express");
const bodyParser = require("body-parser");

const feedRoutes = require("./routes/feed");

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
  // NOTE: Check origin
  // console.log({ origin: req.headers.origin });
  res.setHeader("Access-Control-Allow-Origin", "https://s.codepen.io");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/feeds", feedRoutes);

app.listen(1000, () => {
  console.log("App listening on port 1000!");
});
