import React, { useState, useEffect, useRef } from "react";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import Paper from "@material-ui/core/Paper";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import { TextField } from "@material-ui/core";
import useDeepCompareEffect from "use-deep-compare-effect";

const useStyles = makeStyles((theme) => ({
  inputBox: {
    "& > *": {
      margin: theme.spacing(1),
      width: "400px",
      maxWidth: "400px",
      background: "#ffffff",
      borderRadius: 20,
    },
  },
}));



const StyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: "#455273",
    color: "white",
    fontSize: 30,
    borderBottom: "none",
  },
  body: {
    fontSize: 23,
    borderBottom: "none",
  },
}))(TableCell);

const StyledTableRow = withStyles((theme) => ({
  root: {
    "&:nth-of-type(odd)": {
      backgroundColor: "#2EB2AE",
    },
    "&:nth-of-type(even)": {
      backgroundColor: "#21827F",
    },
  },
}))(TableRow);

const tableStyle = {
  border: "none",
  boxShadow: "none",
};

const Chat = (props) => {
  const classes = useStyles();

  var currMessageKey = 0;
  const [inputState, setInputState] = useState("");

  function handleSubmit(e) {
    setInputState("");
    e.preventDefault();
    if(inputState == "") return;
    props.send_message(inputState);
  }

  function renderRow(row){
    currMessageKey = currMessageKey + 1;
    return <StyledTableRow key={currMessageKey}>
      <StyledTableCell component="th" scope="row">
        {row["message"]["user"]}: {row["message"]["message"]}
      </StyledTableCell>
    </StyledTableRow>
  }

  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(scrollToBottom, [props.messages]);

  return (
    <div className="flex flex-col items-center">
      <div class="tablediv w-full sm:w-4/5" style={{ overflow: "auto", maxHeight: "40vh" }}>
        <TableContainer component={Paper} style={{ borderRadius: 15 }}>
          <Table
            className={classes.table}
            aria-label="customized table"
            style={tableStyle}
          >
            <TableBody>
              {props.messages.map((row) => renderRow(row))}
              <div ref={messagesEndRef} />
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      <form
        className={classes.inputBox}
        noValidate
        autoComplete="off"
        onSubmit={handleSubmit}
      >
        <TextField
          label="Message"
          variant="filled"
          InputProps={{ disableUnderline: true }}
          value={inputState}
          onChange={(e) => {
            setInputState(e.target.value);
          }}
        />
      </form>
    </div>
  );
};

export default Chat;
