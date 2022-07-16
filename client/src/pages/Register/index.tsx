import { Button, CircularProgress, Grid, TextField, Typography } from "@mui/material";
import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../api";
import { SnackbarContext } from "../../context/SnackbarContext";

const Register = () => {
  const snackbarContext = useContext(SnackbarContext);

  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const handleRegister = async () => {
    if (!username || !password || !email) return snackbarContext?.openSnackbar("Fields are missing", "error");
    if (password !== passwordConfirm) return snackbarContext?.openSnackbar("Passwords Do not match", "error");
    setIsLoading(true);
    try {
      await api.post("/v1/auth/register", { username, password, email });
      navigate("/login");
    } catch (error: any) {
      snackbarContext?.openSnackbar(error.response.data?.message || "Error", "error");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Grid container xs={12} justifyContent="center" marginTop={20} gap={5}>
      <Grid item xs={7}>
        <Typography variant="h2">Register</Typography>
      </Grid>
      <Grid item xs={7}>
        <TextField value={username} onChange={(e) => setUsername(e.target.value)} fullWidth label="Username" variant="outlined" />
      </Grid>
      <Grid item xs={7}>
        <TextField value={email} onChange={(e) => setEmail(e.target.value)} fullWidth label="Email" variant="outlined" />
      </Grid>
      <Grid item xs={7}>
        <TextField
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          fullWidth
          label="Password"
          variant="outlined"
        />
      </Grid>
      <Grid item xs={7}>
        <TextField
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          type="password"
          fullWidth
          label="Confirm Password"
          variant="outlined"
        />
      </Grid>
      <Grid item xs={7}>
        {isLoading ? (
          <CircularProgress />
        ) : (
          <Button onClick={handleRegister} variant="contained">
            Register
          </Button>
        )}
      </Grid>
      <Grid item xs={7}>
        <Link to="/">Landing Page</Link>
      </Grid>
      <Grid item xs={7}>
        <Link to="/dashboard">My Dashboard</Link>
      </Grid>
      <Grid item xs={7}>
        <Link to="/login">Login</Link>
      </Grid>
    </Grid>
  );
};

export default Register;
