import { Button, Checkbox, CircularProgress, Grid, TextField, Typography } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { useContext, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../../api";
import { SnackbarContext } from "../../context/SnackbarContext";
import styles from "./styles.module.css";

const ChangePassword = () => {
  const snackbarContext = useContext(SnackbarContext);
  const { resetToken } = useParams<{ resetToken: string }>();

  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChangePassword = async () => {
    if (!password || !confirmPassword) return snackbarContext?.openSnackbar("Fields are missing", "error");
    if (password !== confirmPassword) return snackbarContext?.openSnackbar("Passwords do not match", "error");
    setIsLoading(true);
    try {
      await api.post("/v1/auth/change-password", { password, resetToken });
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
        <p className={styles.title}>Reset Password</p>
        <p className={styles.inputLabel}>New Password</p>
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
        <p className={styles.inputLabel}>Confirm New Password</p>
        <div className={styles.inputDiv}>
          <TextField
            disabled={isLoading}
            size="small"
            fullWidth
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            type="password"
            variant="outlined"
          />
        </div>
        <div className={styles.buttonDiv}>
          <Button disabled={isLoading} fullWidth onClick={handleChangePassword} variant="contained">
            {isLoading ? <CircularProgress color="inherit" size="1.6rem" /> : "Reset Password"}
          </Button>
          <Link className={styles.link} to="/register">
            Sign in here.
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
