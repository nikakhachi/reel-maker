import { TextField } from "@mui/material";
import { useContext, useState } from "react";
import { UserContext } from "../../context/UserContext";
import styles from "./styles.module.css";

const MyAccount = () => {
  const userContext = useContext(UserContext);
  const user = userContext?.user;

  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState(user?.username);
  const [email, setEmail] = useState(user?.email);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  if (!user) return null;
  return (
    <div style={{ padding: "1rem", display: "flex", justifyContent: "center" }}>
      <div className={styles.container}>
        <div className={styles.inputDiv}>
          <TextField
            type="email"
            disabled={true}
            size="small"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            variant="outlined"
            label="Email"
          />
        </div>
        <div className={styles.inputDiv}>
          <TextField
            disabled={true}
            size="small"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            variant="outlined"
            label="Username"
          />
        </div>
        {/* <div className={styles.inputDiv}>
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
      </div> */}
      </div>
    </div>
  );
};

export default MyAccount;
