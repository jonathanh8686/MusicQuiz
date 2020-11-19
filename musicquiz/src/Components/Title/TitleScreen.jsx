import React, { useState } from "react";
import Button from "@material-ui/core/Button";

import Zoom from "@material-ui/core/Zoom";
import { makeStyles } from "@material-ui/core/styles";
import Fade from "@material-ui/core/Fade";
import Collapse from "@material-ui/core/Collapse";

import GameIDInput from "./GameIDInput.jsx";
import CreateLobby from "./CreateLobby.jsx";

const useStyles = makeStyles((theme) => ({
  root: {
    "& > *": {
      margin: theme.spacing(1),
    },
  },
  optionButtons: {
    borderRadius: 100,
    marginBottom: 20,
    minWidth: 500,
  },
}));

const TitleScreen = ({}) => {
  const classes = useStyles();
  const [showJoin, setShowJoin] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const [joinCode, setJoinCode] = useState(" ");
  const [newLobby, setNewLobby] = useState({});

  function joinLobby(e) {
    setShowJoin(true);
    setShowCreate(false);
  }

  function createLobby(e) {
    setShowCreate(true);
    setShowJoin(false);
  }

  function enteredJoinCode(e) {
    setJoinCode(e);
    console.log("Joining lobby code: " + e);
  }

  function enteredCreateLobby(e) {
    setNewLobby(e);
    console.log("Creating new lobby with properties: " + JSON.stringify(e));
  }

  return (
    <div>
      <h1 class="line-1 anim-typewriter"> Music Quiz </h1>
      <Zoom in={true} style={{ transitionDelay: "600ms" }}>
        <Button
          className={classes.optionButtons}
          variant="contained"
          color="primary"
          onClick={joinLobby}
        >
          Join Lobby
        </Button>
      </Zoom>

      <Collapse in={showJoin}>
        <GameIDInput passJoinCode={enteredJoinCode}></GameIDInput>
      </Collapse>

      <br></br>
      <Zoom in={true} style={{ transitionDelay: "800ms" }}>
        <Button
          className={classes.optionButtons}
          variant="contained"
          color="secondary"
          onClick={createLobby}
        >
          Create Lobby
        </Button>
      </Zoom>

      <Collapse in={showCreate}>
        <CreateLobby passLobbySettings={enteredCreateLobby}></CreateLobby>
      </Collapse>
    </div>
  );
};

export default TitleScreen;
