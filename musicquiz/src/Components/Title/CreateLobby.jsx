import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";

const useStyles = makeStyles((theme) => ({
  inputBox: {
    "& > *": {
      margin: theme.spacing(1),
      width: "400px",
      background: "#ffffff",
      borderRadius: 40,
    },
  },
  goButton: {
    width: "100px",
    height: "50px",
    color: "darkgreen",
    backgroundColor: "#64d166",
  },
}));

const CreateLobby = (props) => {
  const classes = useStyles();

  const [lobbySettings, setLobbySettings] = useState({});

  function handleSubmit(e) {
    e.preventDefault();
    props.passLobbySettings(lobbySettings);
  }

  function handleYoutubePlaylistChange(e) {
    let newSettings = lobbySettings;
    lobbySettings["youtube_url"] = e.target.value;
    setLobbySettings(lobbySettings);
  }

  return (
    <div>
      <form
        className={classes.inputBox}
        noValidate
        autoComplete="off"
        onSubmit={handleSubmit}
      >
        <TextField
          InputProps={{ disableUnderline: true }}
          label="Youtube Playlist URL"
          variant="filled"
          onChange={handleYoutubePlaylistChange}
        />

        <Button
          className={classes.goButton}
          variant="contained"
          onClick={handleSubmit}
        >
          Go!
        </Button>
      </form>
    </div>
  );
};

export default CreateLobby;
