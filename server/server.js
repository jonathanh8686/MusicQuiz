require("dotenv").config();

const http = require("http");
const express = require("express");
var bodyParser = require("body-parser");
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });

var createid = require("./createid.js");

const PORT = 3001 || process.env.PORT;

const MongoClient = require("mongodb").MongoClient;
MongoClient.connect(process.env.CONNECTIONSTRING, {
  useUnifiedTopology: true,
}).then((client) => {
  console.log("Connected to Database");
  const db = client.db("MusicQuiz");
  app.get("/room-codes", (req, res) => {
    db.collection("room-codes")
      .find()
      .toArray()
      .then((results) => {
        console.log(results);
        res.json(results);
      })
      .catch((error) => console.error(error));
  });

  app.post("/add-room", jsonParser, (req, res) => {
    db.collection("room-settings")
      .find()
      .toArray()
      .then((results) => {
        let roomid = createid.createID();
        while (true) {
          let flag = false;
          for (var i = 0; i < results.length; i++) {
            if (results[i]["roomid"] == roomid) flag = true;
          }
          if (!flag) break;
          roomid = createid.createID();
        }

        let roominfo = {
          youtube_url: req.body["youtube_url"],
          roomcode: roomid,
        };

        db.collection("room-settings")
          .insertOne(roominfo)
          .then((result) => {
            console.log(
              `Adding data ${JSON.stringify(req.body)} to room ${roomid}`
            );
            db.collection("room-codes").insertOne({ roomid: roomid });
            res.json({ roomid: roomid });
          })
          .catch((error) => console.error(error));
      })
      .catch((error) => console.error(error));
  });
});

const app = express();
var cors = require("cors");
app.use(cors());

const server = app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

// Run when a cilent connectes
io.on("connection", (socket) => {
  console.log("New WebSocket Connection");
});
