require("dotenv").config();

function arrayRemove(arr, value) {
  return arr.filter(function (ele) {
    return ele != value;
  });
}

const http = require("http");
const express = require("express");
var bodyParser = require("body-parser");
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });

var createid = require("./createid.js");

const PORT = 3001 || process.env.PORT;
console.log(process.env.CONNECTIONSTRING);

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
  cors:true,
  origins:["http://127.0.0.1:3000"]
});

let activeRooms = {};
let idUserRoom = {};

io.sockets.on("connection", function (socket) {
  // once a client has connected, we expect to get a ping from them saying what room they want to join
  socket.on("join-room", function (data) {
    socket.join(data["room"]);
    if (!(data["room"] in activeRooms)) activeRooms[data["room"]] = [];
    activeRooms[data["room"]].push(data["user"]);
    idUserRoom[this.id] = { user: data["user"], room: data["room"] };

    io.sockets.in(data["room"]).emit("room_events", {
      type: "join",
      roomid: data["room"],
      user: data["user"],
    });
    io.sockets.in(data["room"]).emit("room_events", {
      type: "playerlist",
      players: activeRooms[data["room"]],
    });
  });

  socket.on("leave-room", function (data) {
    socket.join(data["room"]);
    if (!(data["room"] in activeRooms)) activeRooms[data["room"]] = [];
    activeRooms[data["room"]] = arrayRemove(
      activeRooms[data["room"]],
      data["user"]
    );
    io.sockets.in(data["room"]).emit("room_events", {
      type: "leave",
      roomid: data["room"],
      user: data["user"],
    });
    io.sockets.in(data["room"]).emit("room_events", {
      type: "playerlist",
      players: activeRooms[data["room"]],
    });
  });

  socket.on("nickname-updated", function (data) {
    if (!(this.id in idUserRoom)) return;
    let oldname = idUserRoom[this.id]["user"];
    let newactive = [];
    for (var i = 0; i < activeRooms[data["room"]].length; i++) {
      if (activeRooms[data["room"]][i] === oldname) {
        newactive.push(data["user"]);
      } else {
        newactive.push(activeRooms[data["room"]][i]);
      }
    }
    activeRooms[data["room"]] = newactive;
    idUserRoom[this.id] = { user: data["user"], room: data["room"] };
    io.sockets.in(data["room"]).emit("room_events", {
      type: "playerlist",
      players: activeRooms[data["room"]],
    });
  });

  socket.on("new-message", function (data) {
    console.log("Chat event!" + data);
    // check if it's the right answer

    // check if it's close

    // if not then it's a normal message
    io.sockets.in(data["room"]).emit("chat_events", {
      type: "new_message",
      message: data,
    });
  });

  socket.on("game-start", function (data) {
    console.log(`Room ${data["room"]} started!`);

    //  i think the right model here is that this will send a song over,
    //  and that after the song is finished on the other side, the client will send
    //  a "hey song is done" message and then the server will respond with the next song
  });

  socket.on("song-finished", function (data) {
    // data should contain the room code that just finished their song
  });


  socket.on("disconnect", function () {
    if (!(this.id in idUserRoom)) return;
    data = {
      room: idUserRoom[this.id]["room"],
      user: idUserRoom[this.id]["user"],
    };
    if (!(data["room"] in activeRooms)) activeRooms[data["room"]] = [];
    activeRooms[data["room"]] = arrayRemove(
      activeRooms[data["room"]],
      data["user"]
    );
    io.sockets.in(data["room"]).emit("room_events", {
      type: "leave",
      roomid: data["room"],
      user: data["user"],
    });
    io.sockets.in(data["room"]).emit("room_events", {
      type: "playerlist",
      players: activeRooms[data["room"]],
    });
  });
});
