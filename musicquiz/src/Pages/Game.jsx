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

  function updateMessages(data) {
    console.log("Chat Event:", data.message);
    if (data["type"] == "new_message") {
      setMessages(messages => [...messages, data]);
    }
  }

  // on mount
  useEffect(() => {
    //socket.emit("connection", "joined");
    socket.on("connect", function () {
      socket.emit("join-room", { room: id, user: nickname });
    });

    socket.on("chat_events", updateMessages);

    socket.on("room_events", function (data) {
      console.log("Room Event:", data);
      if (data["type"] == "playerlist") {
        setPlayers(data["players"]);
      }
    });

    return () => {
      // Anything in here is fired on component unmount.
      //socket.emit("disconnect");
      socket.off();
    };
  }, []);

  return (
    <div>
      {/* Button for testing purposes */}
      {/* <button onClick={() => console.log(messages)}>View Messages</button> */}
      <div class="flex flex-col sm:flex-row items-center">
        <aside class="aside aside-1 mx-3 mb-4">
          <NicknameInput
            currentNick={nickname}
            setNickname={updateNickname}
          ></NicknameInput>
          <OnlineList onlinePlayers={players}> </OnlineList>
        </aside>
        <aside class="aside aside-2 mr-3">
          <Chat messages={messages} send_message={sendMessage}></Chat>
        </aside>
      </div>
      <footer class="footer">
          <p> Game Code: {id} </p>
        </footer>
    </div>
  );
};

export default GamePage;
