import React, { useState } from "react";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";

const useStyles = makeStyles((theme) => ({
  inputBox: {
    "& > *": {
      margin: theme.spacing(1),
      width: "400px",
      background: "#ffffff",
      borderRadius: 20,
    },
  },
  optionButtons: {
    borderRadius: 100,
    marginBottom: 20,
    minWidth: 500,
    backgroundColor: "lightgreen",
    "&:hover": {
      backgroundColor: "green",
    },
  },
}));

const MusicProgress = (props) => {
  const classes = useStyles();

  const [gameStarted, setGameStarted] = useState(false);

  function startGame(e) {
    props.setGameStarted(true);
    setGameStarted(true); // this is just here to force rerender the component bc idk how to do good things
  }

  function playAudio() {
    const audioEl = document.getElementsByClassName("audio-element")[0];
    audioEl.play();
  }

  return (
    <div>
    <button onClick={playAudio}> play </button>
      <audio className="audio-element">
        <source src={props.currentTrack["preview_url"]}></source>
      </audio>

      {!props.gameStarted && (
        <Button
          className={classes.optionButtons}
          variant="contained"
          onClick={startGame}
        >
          Start Game
        </Button>
      )}
    </div>
  );
};

export default MusicProgress;
