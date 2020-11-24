import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import io from "socket.io-client";
import { Grid, Col } from "gymnast";

import "./Game.css";

import OnlineList from "../Components/Game/OnlineList.jsx";
import NicknameInput from "../Components/Game/NicknameInput.jsx";
import Chat from "../Components/Game/Chat.jsx";

const generateRandomAnimalName = require("../../node_modules/random-animal-name-generator");

var socket = io.connect("http://localhost:3001");

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  control: {
    padding: theme.spacing(2),
  },
}));

const GamePage = ({ match }) => {
  const id = match["params"]["id"];

  const classes = useStyles();

  const [players, setPlayers] = useState([]);
  const [nickname, setNickname] = useState(generateRandomAnimalName());
  const [messages, setMessages] = useState([]);

  socket.on("chat_events", function (data) {
    console.log("Chat Event:", data);
    if (data["type"] == "new_message") {
      setMessages([...messages, data]);
    }
  });

  socket.on("room_events", function (data) {
    console.log("Room Event:", data);
    if (data["type"] == "playerlist") {
      setPlayers(data["players"]);
    }
  });

  function updateNickname(e) {
    let flag = false;
    for (var i = 0; i < players.length; i++) {
      if (e.trim() == players[i].trim()) flag = true;
    }
    if (e.length > 30) flag = true;
    if (flag) return;
    setNickname(e);
    socket.emit("nickname-updated", { room: id, user: e });
  }

  function sendMessage(e) {
    socket.emit("new-message", { room: id, user: nickname, message: e });
  }

  // on mount
  useEffect(() => {
    //socket.emit("connection", "joined");
    socket.on("connect", function () {
      socket.emit("join-room", { room: id, user: nickname });
    });

    return () => {
      // Anything in here is fired on component unmount.
      //socket.emit("disconnect");
      socket.off();
    };
  }, []);

  return (
    <div>
      <div class="wrapper">
        <aside class="aside aside-1">
          <NicknameInput
            currentNick={nickname}
            setNickname={updateNickname}
          ></NicknameInput>
          <OnlineList onlinePlayers={players}> </OnlineList>
        </aside>
        <aside class="aside aside-2">
          <Chat messages={messages} send_message={sendMessage}></Chat>
        </aside>
        <footer class="footer">
          <p> Game Code: {id} </p>
        </footer>
      </div>
    </div>
  );
};

export default GamePage;
