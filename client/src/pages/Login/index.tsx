import { Button, CircularProgress, Grid, TextField, Typography } from "@mui/material";
import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../api";
import { SnackbarContext } from "../../context/SnackbarContext";

const Login = () => {
  const snackbarContext = useContext(SnackbarContext);

  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!username || !password) return snackbarContext?.openSnackbar("Fields are missing", "error");
    setIsLoading(true);
    try {
      await api.post("/v1/auth/login", { username, password });
      navigate("/dashboard");
    } catch (error: any) {
      snackbarContext?.openSnackbar(error.response.data?.message || "Error", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Grid container xs={12} justifyContent="center" marginTop={20} gap={5}>
      <Grid item xs={7}>
        <Typography variant="h2">Login</Typography>
      </Grid>
      <Grid item xs={7}>
        <TextField value={username} onChange={(e) => setUsername(e.target.value)} fullWidth label="Username" variant="outlined" />
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
        {isLoading ? (
          <CircularProgress />
        ) : (
          <Button onClick={handleLogin} variant="contained">
            Login
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
        <Link to="/register">Register</Link>
      </Grid>
      <Grid item xs={7}>
        <Link to="/forgot-password">Forgot Password</Link>
      </Grid>
      <Grid item xs={7}>
        <Link to="/reset-password">Reset Password</Link>
      </Grid>
    </Grid>
  );
};

export default Login;
