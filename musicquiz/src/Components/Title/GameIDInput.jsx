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

const GameIDInput = (props) => {
  const classes = useStyles();

  const [inputID, setInputID] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    props.passJoinCode(inputID);
  }

  function inputChanged(e) {
    setInputID(e.target.value);
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
          label="Game ID"
          variant="filled"
          onChange={inputChanged}
          InputProps={{ disableUnderline: true }}
        />

        <Button className={classes.goButton} variant="contained">
          Go!
        </Button>
      </form>
    </div>
  );
};

export default GameIDInput;
