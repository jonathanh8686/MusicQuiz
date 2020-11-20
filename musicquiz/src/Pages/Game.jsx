import React, { useEffect } from "react";
import io from 'socket.io-client'

const socket = io('http://localhost:3001');

const GamePage = ({ match }) => {
  const id = match["params"]["id"];

  useEffect(() => {
    socket.emit("connection", "joined");

    console.log(`Mounted page ${id}`);
    socket.on("player-join", () => {
      console.log("test");
    })
  }, []);

  return (
    <div>
      <h1> {id} </h1>
    </div>
  );
};

export default GamePage;
