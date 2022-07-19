import { Button, CircularProgress, TextField } from "@mui/material";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";
import { SnackbarContext } from "../../context/SnackbarContext";
import validator from "validator";
import styles from "./styles.module.css";

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
    if (!validator.isEmail(email)) return snackbarContext?.openSnackbar("Invaild Email", "error");
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
    <div className={styles.container}>
      {/* <div className={styles.imageDiv}>
        <img src="https://images.unsplash.com/photo-1505904267569-f02eaeb45a4c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1908&q=80" />
      </div> */}
      <div className={styles.formContainer}>
        <div className={styles.logoDiv}>
          <img src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg" />
        </div>
        <p className={styles.title}>Sign Up</p>
        <p className={styles.inputLabel}>Email Address</p>
        <div className={styles.inputDiv}>
          <TextField
            type="email"
            disabled={isLoading}
            size="small"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            variant="outlined"
          />
        </div>
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
        <p className={styles.inputLabel}>Confirm Password</p>
        <div className={styles.inputDiv}>
          <TextField
            disabled={isLoading}
            size="small"
            fullWidth
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            type="password"
            variant="outlined"
          />
        </div>
        <div className={styles.buttonDiv}>
          <Button disabled={isLoading} fullWidth onClick={handleRegister} variant="contained">
            {isLoading ? <CircularProgress color="inherit" size="1.6rem" /> : "Register"}
          </Button>
          <Button disabled={isLoading} fullWidth onClick={() => navigate("/login")} variant="contained">
            Sign In
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Register;
