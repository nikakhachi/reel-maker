import { Button, Checkbox, CircularProgress, Grid, TextField, Typography } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../api";
import { SnackbarContext } from "../../context/SnackbarContext";
import styles from "./styles.module.css";

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
      navigate("/dashboard/youtube-videos");
    } catch (error: any) {
      snackbarContext?.openSnackbar(error.response.data?.message || "Error", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* <div className={styles.imageDiv}>
        <img src="https://images.unsplash.com/photo-1505904267569-f02eaeb45a4c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1908&q=80" />
      </div> */}
      <div className={styles.formContainer}>
        <div className={styles.logoDiv}>
          <img src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg" />
        </div>
        <p className={styles.title}>Sign in to your account</p>
        <p className={styles.titleSecondary}>
          Or{" "}
          <a className={styles.freeTrialLink} href="#">
            start your 14-day free trial
          </a>
        </p>
        <p className={styles.inputLabel}>Sign in with</p>
        <div className={styles.socialContainer}>
          <div className={styles.socialItem}>
            <GoogleIcon />
          </div>
        </div>
        <p className={styles.orContinue}>Or continue with</p>
        <p className={styles.inputLabel}>Username</p>
        <div className={styles.inputDiv}>
          <TextField
            disabled={isLoading}
            size="small"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            variant="outlined"
          />
        </div>
        <p className={styles.inputLabel}>Password</p>
        <div className={styles.inputDiv}>
          <TextField
            disabled={isLoading}
            size="small"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            variant="outlined"
          />
        </div>
        <div className={styles.optionsDiv}>
          <div>
            <Checkbox disabled={isLoading} size="small" defaultChecked />
            <p>Remember Me</p>
          </div>
          <Link className={styles.forgotPassword} to="/forgot-password">
            Forgot your password?
          </Link>
        </div>
        <div className={styles.buttonDiv}>
          <Button disabled={isLoading} fullWidth onClick={handleLogin} variant="contained">
            {isLoading ? <CircularProgress color="inherit" size="1.6rem" /> : "Sign in"}
          </Button>
          <Button disabled={isLoading} fullWidth onClick={() => navigate("/register")} variant="contained">
            Register
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Login;
