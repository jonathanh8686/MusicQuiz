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
}));

const NicknameInput = (props) => {
  const classes = useStyles();

  const [inputID, setInputID] = useState("");

  function inputChanged(e) {
    props.setNickname(e.target.value);
  }

  return (
    <div>
      <form className="w-auto bg-transparent" noValidate autoComplete="off" onSubmit={(e) => {e.preventDefault();}}>
        <div className="mb-3 bg-white border-4 rounded-2xl">
          <TextField
            className="w-full"
            label="Nickname"
            variant="filled"
            onChange={inputChanged}
            defaultValue={props.currentNick}
            InputProps={{ disableUnderline: true }}
          />
        </div>
      </form>
    </div>
  );
};

export default NicknameInput;
