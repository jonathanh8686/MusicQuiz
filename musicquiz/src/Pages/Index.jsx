import React from "react";
import "./Index.css";
import Button from "@material-ui/core/Button";
import Zoom from '@material-ui/core/Zoom';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
  optionButtons: {
    borderRadius: 100,
    marginBottom: 20,
    minWidth: 500
  },
}));

const IndexPage = () => {
  const classes = useStyles();
  return (
    <div>
      <h1 class="line-1 anim-typewriter"> Music Quiz </h1>
      <Zoom in={true} style={{ transitionDelay: '800ms' }}>
        <Button  className={classes.optionButtons} variant="contained" color="primary">
          Join Lobby
        </Button>
      </Zoom>

      <br></br>
      <Zoom in={true} style={{ transitionDelay: '1000ms' }}>
        <Button className={classes.optionButtons} variant="contained" color="secondary">
          Create Lobby
        </Button>
      </Zoom>
    </div>
  );
};

export default IndexPage;
