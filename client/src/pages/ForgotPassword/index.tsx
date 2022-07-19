import { Button, CircularProgress, TextField } from "@mui/material";
import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api";
import { SnackbarContext } from "../../context/SnackbarContext";
import styles from "./styles.module.css";

const Login = () => {
  const snackbarContext = useContext(SnackbarContext);

  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");

  const handlePasswordReset = async () => {
    if (!email) return snackbarContext?.openSnackbar("Fields are missing", "error");
    setIsLoading(true);
    try {
      const { message } = await api.post("/v1/auth/reset-password", { email });
      snackbarContext?.openSnackbar(message, "success");
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
        <p className={styles.title}>Forgot Password ?</p>
        <p className={styles.inputLabel}>Email</p>
        <div className={styles.inputDiv}>
          <TextField
            disabled={isLoading}
            size="small"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            variant="outlined"
          />
        </div>
        <div className={styles.buttonDiv}>
          <Button disabled={isLoading} fullWidth onClick={handlePasswordReset} variant="contained">
            {isLoading ? <CircularProgress color="inherit" size="1.6rem" /> : "Send Email"}
          </Button>
          <Link className={styles.link} to="/login">
            Sign in here.
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
