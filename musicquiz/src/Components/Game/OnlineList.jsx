import React from 'react';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import "./OnlineList.css";

const StyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: "#455273",
    color: "white",
    fontSize:30,
    borderBottom: "none"
  },
  body: {
    fontSize: 23,
    borderBottom: "none",
  },
}))(TableCell);

const StyledTableRow = withStyles((theme) => ({
  root: {
    '&:nth-of-type(odd)': {
      backgroundColor: "#2EB2AE",
    },
    '&:nth-of-type(even)': {
      backgroundColor: "#21827F",
    },
  },
}))(TableRow);

const tableStyle = {
  border: "none",
  boxShadow: "none",
};

const useStyles = makeStyles({
  table: {
    minWidth: "100%",
    borderRadius: "20px"
  },
});

const OnlineList = (props) => {
  const classes = useStyles();

  console.log(props.onlinePlayers);
  return (
    <div className="tablediv">
      <TableContainer component={Paper} style={{borderRadius: 15}}>
        <Table className={classes.table} aria-label="customized table" style={tableStyle}>
          <TableHead>
            <TableRow>
              <StyledTableCell><span className="font-bold">Players</span></StyledTableCell>
            </TableRow>
          </TableHead>
          <div style={{ overflow: "auto", maxHeight:"20vh", width:"100%"}} >
            <TableBody className="flex flex-col" style={{display:"flex", borderBottom:"none", overflow: "auto", maxHeight:"20vh",}}>
              {props.onlinePlayers.map((row) => (
                <StyledTableRow key={row["socketid"]} >
                  <StyledTableCell className="w-full" style={{padding: "8px", paddingLeft: "12px"}} component="th" scope="row">
                    <span className="font-light text-lg">{row["user"]}</span>
                  </StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </div>

        </Table>
      </TableContainer>
    </div>
    );
};

export default OnlineList;
