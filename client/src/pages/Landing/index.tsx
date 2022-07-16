import { Grid, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import styles from "./styles.module.css";

const Landing = () => {
  return (
    <Grid container xs={12} justifyContent="center" marginTop={20} gap={5}>
      <Grid item xs={7}>
        <Typography variant="h2">Landing Page</Typography>
      </Grid>
      <Grid item xs={7}>
        <Link to="login">Login</Link>
      </Grid>
      <Grid item xs={7}>
        <Link to="register">Register</Link>
      </Grid>
      <Grid item xs={7}>
        <Link to="dashboard">My Dashboard</Link>
      </Grid>
    </Grid>
  );
};

export default Landing;
