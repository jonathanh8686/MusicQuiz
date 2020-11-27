require("dotenv").config();

function arrayRemove(arr, value) {
  return arr.filter(function (ele) {
    return ele != value;
  });
}

function validateURL(url) {
  let re = new RegExp(
    "[-a-zA-Z0-9@:%._+~#=]{1,256}.[a-zA-Z0-9()]{1,6}([-a-zA-Z0-9()@:%_+.~#?&//=]*)"
  );

  return (
    url.includes("/playlist/") ^ url.includes("/album/") &&
    url.includes("spotify.com") &&
    re.test(url)
  );
}

// -------------- code for testing song guesses ------------------
function levenstein(purported, actual){
  // ignoring spaces and punctuations
  const isAlphaNumeric = ch => ch.match(/^[a-z0-9]+$/i) !== null;
  
  const processPurported = purported.split("")
    .filter(char => isAlphaNumeric(char))
    .map(char => char.toLowerCase())
    .sort(); // x string
  const processActual = actual.split("")
    .filter(char => isAlphaNumeric(char))
    .map(char => char.toLowerCase())
    .sort(); // y string

  // initialize 2D array of dimension len(x) by len(y) [hori by vert]
  var dp = new Array(processActual.length + 1).fill(0).map(
    () => new Array(processPurported.length + 1))

  // j is column, i is row
  for (var j = 0; j < processPurported.length + 1; j ++){
    dp[0][j] = j;
  }
  for (var i = 0; i < processActual.length + 1; i ++){
    dp[i][0] = i;
  }

  // if we have computed the first outer "fringe" of edit distances
  // there are processActual.length - 1 more rows to process

  for (var i = 1; i < processActual.length + 1; i ++){
    for (var j = 1; j < processPurported.length + 1; j ++){
      const matchCost = (processPurported[j - 1] === processActual[i - 1]) ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i-1][j-1] + matchCost, // matching last char of x
        dp[i-1][j] + 1,           // delete last char of x
        dp[i][j-1] + 1,           // insert to the end of x
      )
    }
  }

  const minDistance = dp[processActual.length][processPurported.length];
  const tolerance = Math.floor(processActual.length / 2);
  // const resultString = minDistance <= tolerance ? "Accepted" : "Declined"
  // console.log(purported.concat(" vs. ").concat(actual));
  // console.log("Min Edit Distance Ignoring Order = ".concat(minDistance));
  // console.log("Tolerance = ".concat(tolerance));
  // console.log("The purported answer is ".concat(resultString).concat("\n\n"));
  //return minDistance;
  return minDistance <= tolerance;
}

function removeParenExp(str){
  const parenRegex = /\(([^)]+)\)/;
  const parenstr = parenRegex.exec(str);
  if (parenstr) return str.replace(parenstr[0], "");
  else return str;
}

// ! Use this function to test a purported answer with the actual song title !
function testSongGuess(purported, actual){
  const processActual = removeParenExp(actual);
  // console.log(purported.concat(" vs. ").concat(actual))
  // console.log(levenstein(purported, actual) || levenstein(purported, processActual))
  // console.log("\n");
  return levenstein(purported, actual) || levenstein(purported, processActual);
}

// ------------------------------------------------------------------

const http = require("http");
var request = require("request");
const express = require("express");
var bodyParser = require("body-parser");
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });

var createid = require("./createid.js");
var spotify = require("./spotify.js");

const PORT = 3001 || process.env.PORT;

let SPOTIFY_ACCESS_TOKEN = ""; // see spotify.js
spotify.getAccessToken(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  (dt) => {
    SPOTIFY_ACCESS_TOKEN = dt;
  }
);

const app = express();
var cors = require("cors");
app.use(cors());

const server = app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);

const io = require("socket.io")(server, {
  cors: true,
  origins: ["http://127.0.0.1:3000"],
});

const MongoClient = require("mongodb").MongoClient;
MongoClient.connect(process.env.CONNECTIONSTRING, {
  useUnifiedTopology: true,
}).then((client) => {
  console.log("Connected to Database");
  const db = client.db("MusicQuiz");
  app.get("/room-codes", (req, res) => {
    db.collection("room-info")
      .find()
      .toArray()
      .then((results) => {
        let codes = [];
        for (var i = 0; i < results.length; i++) {
          codes.push(results[i]["roomid"]);
        }
        // sends the room codes on a get request with /room-codes
        res.json(codes);
      })
      .catch((error) => console.error(error));
  });

  app.post("/add-room", jsonParser, (req, res) => {
    // should also display some sort of an error message in browser
    if (!validateURL(req.body["spotify_url"])) return;

    db.collection("room-info")
      .find()
      .toArray()
      .then((results) => {
        let roomid = createid.getRandID();
        while (true) {
          let flag = false;
          for (var i = 0; i < results.length; i++) {
            if (results[i]["roomid"] == roomid) flag = true;
          }
          if (!flag) break;
          roomid = createid.getRandID();
        }

        // initialize an unstarted game
        let roominfo = {
          spotify_url: req.body["spotify_url"],
          started: false,
          players: [],
          roomid: roomid,
        };

        // add the new game to the database
        db.collection("room-info")
          .insertOne(roominfo)
          .then((result) => {
            console.log(
              `Adding data ${JSON.stringify(req.body)} to room ${roomid}`
            );
            res.json({ roomid: roomid });
          })
          .catch((error) => console.error(error));
      })
      .catch((error) => console.error(error));
  });

  let activeRooms = {}; // could combine these
  let startedGames = [];
  let idUserRoom = {}; // actually im not even sure if we want any of these
  // kind of defeats the purpose of having a database lol

  io.sockets.on("connection", function (socket) {
    // once a client has connected, we expect to get a ping from them saying what room they want to join
    socket.on("join-room", function (data) {
      // if (!(data["room"] in activeRooms))
      //   activeRooms[data["room"]] = { players: [], started: false };
      db.collection("room-info")
        .find({ roomid: data["room"] })
        .toArray()
        .then((match_rooms) => {
          let room = match_rooms[0];

          db.collection("user-info").updateOne(
            { socketid: this.id },
            {
              $set: {
                socketid: this.id,
                user: data["user"],
                room: room["roomid"],
              },
            },
            { upsert: true }
          );

          db.collection("room-info")
            .updateOne(
              { roomid: data["room"] },
              {
                $set: {
                  // roomid: room["roomid"],
                  players: room["players"].concat(data["user"]),
                  // spotify_url: room["spotify_url"],
                  // started: room["started"],
                },
              }
            )
            .then(() => {
              socket.join(data["room"]);
              io.sockets.in(data["room"]).emit("room_events", {
                type: "join",
                roomid: data["room"],
                user: data["user"],
              }); // this doesn't actually do anything rn lol

              io.sockets.in(data["room"]).emit("room_events", {
                type: "playerlist",
                players: room["players"].concat(data["user"]),
              });

              io.sockets.in(data["room"]).emit("room_events", {
                type: "info",
                started: room["started"],
              });
            });
        });
    });

    socket.on("leave-room", function (data) {
      db.collection("room-info")
        .find({ roomid: data["room"] })
        .toArray()
        .then((match_rooms) => {
          let room = match_rooms[0];

          db.collection("user-info").removeOne({
            socketid: this.id,
          });

          let newplayers = arrayRemove(room["players"], data["user"]);
          db.collection("room-info")
            .updateOne(
              { roomid: data["room"] },
              {
                $set: {
                  roomid: room["roomid"],
                  players: newplayers,
                  spotify_url: room["spotify_url"],
                  started: room["started"],
                },
              }
            )
            .then(() => {
              socket.join(data["room"]);
              io.sockets.in(data["room"]).emit("room_events", {
                type: "leave",
                roomid: data["room"],
                user: data["user"],
              });

              io.sockets.in(data["room"]).emit("room_events", {
                type: "playerlist",
                players: newplayers,
              });
            });
        });
    });

    socket.on("nickname-updated", function (data) {
      db.collection("room-info")
        .find({ roomid: data["room"] })
        .toArray()
        .then((match_rooms) => {
          let room = match_rooms[0];
          if (room["players"].includes(data["user"])) return;

          db.collection("user-info")
            .find({ socketid: this.id })
            .toArray()
            .then((oldusers) => {
              let olduser = oldusers[0];
              let newplayers = [];
              for (var i = 0; i < room["players"].length; i++) {
                if (room["players"][i] === olduser["user"]) {
                  newplayers.push(data["user"]);
                } else {
                  newplayers.push(room["players"][i]);
                }
              }
              console.log(newplayers);

              db.collection("user-info").updateOne(
                { socketid: this.id },
                {
                  $set: {
                    socketid: this.id,
                    user: data["user"],
                    room: room["roomid"],
                  },
                }
              );

              db.collection("room-info")
                .updateOne(
                  { roomid: data["room"] },
                  {
                    $set: {
                      roomid: room["roomid"],
                      players: newplayers,
                      spotify_url: room["spotify_url"],
                      started: room["started"],
                    },
                  }
                )
                .then(() => {
                  socket.join(data["room"]);
                  io.sockets.in(data["room"]).emit("room_events", {
                    type: "leave",
                    roomid: data["room"],
                    user: data["user"],
                  });

                  io.sockets.in(data["room"]).emit("room_events", {
                    type: "playerlist",
                    players: newplayers,
                  });
                });
            });
        });

      if (!(this.id in idUserRoom)) return;
      if (data["user"] in activeRooms[data["room"]]["players"]) return; // if the new name is already here ignore it
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
      // implement this code once we get the spotify api going
      // if (testSongGuess(data["purported"], data["actual"])){ // maybe the data should also include a time measurement
      //   // add score (depending on time?) for the user
      // }

      // if not then it's a normal message
      io.sockets.in(data["room"]).emit("chat_events", {
        type: "new_message",
        message: data,
      });
    });

    socket.on("game-start", function (data) {
      console.log(`Room ${data["room"]} started!`);

      startedGames.push(data["room"]);
      io.sockets.in(data["room"]).emit("room_events", {
        type: "info",
        started: startedGames.includes(data["room"]),
      });

      //  i think the right model here is that this will send a song over,
      //  and that after the song is finished on the other side, the client will send
      //  a "hey song is done" message and then the server will respond with the next song

      db.collection("room-info")
        .find({ roomid: data["room"] })
        .toArray()
        .then((results) => {
          var room_setting = results[0];

          let urlparts = room_setting["spotify_url"].split("/");
          var list_id = urlparts[urlparts.length - 1];

          var options = {
            url: room_setting["spotify_url"].includes("playlist") // it's either a playlist or an album
              ? `https://api.spotify.com/v1/playlists/${list_id}/tracks`
              : `https://api.spotify.com/v1/albums/${list_id}/tracks`,
            headers: {
              Authorization: "Bearer " + SPOTIFY_ACCESS_TOKEN,
            },
            json: true,
          };
          request.get(options, function (error, response, body) {
            console.log(body);
          });
        })
        .catch((error) => console.error(error));
    });

    socket.on("song-finished", function (data) {
      // data should contain the room code that just finished their song
    });

    socket.on("disconnect", function () {
      db.collection("user-info")
        .find({ socketid: this.id })
        .toArray()
        .then((users) => {
          if (users.length == 0) return;
          let user = users[0];
          db.collection("room-info")
            .find({ roomid: user["room"] })
            .toArray()
            .then((match_rooms) => {
              if (match_rooms.length == 0) return;
              let room = match_rooms[0];
              console.log(room);

              let newplayers = arrayRemove(room["players"], user["user"]);
              db.collection("room-info")
                .updateOne(
                  { roomid: user["room"] },
                  {
                    $set: {
                      roomid: room["roomid"],
                      players: newplayers,
                      spotify_url: room["spotify_url"],
                      started: room["started"],
                    },
                  }
                )
                .then(() => {
                  socket.join(user["room"]);
                  io.sockets.in(user["room"]).emit("room_events", {
                    type: "leave",
                    roomid: user["room"],
                    user: user["user"],
                  });

                  io.sockets.in(user["room"]).emit("room_events", {
                    type: "playerlist",
                    players: newplayers,
                  });
                });
            });
        });
    });
  });
});
