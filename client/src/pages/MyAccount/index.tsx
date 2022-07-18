import { Button, Checkbox, CircularProgress, Grid, TextField, Typography } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";
import { SnackbarContext } from "../../context/SnackbarContext";
import { UserContext } from "../../context/UserContext";
import { validateEmail } from "../../utils/validateEmail";
import moment from "moment";
import styles from "./styles.module.css";
import { useUserProvider } from "../../hooks/useUserProvider";
import { useSubscriptionsProvider } from "../../hooks/useSubscriptionsProvider";
import { TRANSRIPTION_SECONDS_FOR_FREE_TRIAL } from "../../constants";

const MyAccount = () => {
  const snackbarContext = useContext(SnackbarContext);
  const userContext = useContext(UserContext);
  const user = userContext?.user;
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState(user?.username);
  const [email, setEmail] = useState(user?.email);
  const [currentPassword, setCurrentPassword] = useState("");
  const [changePassword, setChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");

  const isEmailChanged = email !== user?.email;
  const isUsernameChanged = username !== user?.username;

  const userProvider = useUserProvider();
  const subscriptionsProvider = useSubscriptionsProvider();

  useEffect(() => {
    userContext?.setUser(null);
  }, []);

  useEffect(() => {
    if (userProvider.data) {
      userContext?.setUser(userProvider.data);
    }
  }, [userProvider.data]);

  if (!user || userProvider.loading)
    return (
      <div style={{ padding: "1rem" }}>
        <CircularProgress />
      </div>
    );

  const handleUpdate = async () => {
    if (!email || !username || !currentPassword) return snackbarContext?.openSnackbar("Fill all fields", "error");
    if (!validateEmail(email)) return snackbarContext?.openSnackbar("Invalid Email", "error");
    if (changePassword && (!newPassword || !newPasswordConfirm)) return snackbarContext?.openSnackbar("Fill all fields", "error");
    if (changePassword && newPassword !== newPasswordConfirm) return snackbarContext?.openSnackbar("Passwords do not match", "error");
    setIsLoading(true);
    try {
      const { data } = await api.post(`/v1/user/update-account`, { email, username, currentPassword, newPassword });
      if (!changePassword) {
        userContext?.setUser(data);
        snackbarContext?.openSnackbar("Account has been updated Succesfully", "success");
        setIsLoading(false);
      } else {
        snackbarContext?.openSnackbar("Account has been updated Succesfully, Please login with new password", "success");
        setIsLoading(false);
        navigate("/login");
      }
    } catch (error: any) {
      setIsLoading(false);
      return snackbarContext?.openSnackbar(error?.response?.data?.message || "Error", "error");
    }
  };

  const handlePlanUpgrade = async (subscriptionId: string, priceId: string) => {
    const { data } = await api.post("/v1/subscription/upgrade", { subscriptionId, priceId });
    const link = document.createElement("a");
    link.href = data.url;
    link.click();
    link.remove();
  };

  const handleSubscriptionCancel = async () => {
    if (window.confirm()) {
      await api.post(`/v1/subscription/cancel`, {});
      window.location.reload();
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      {!user.subscriptionData ? (
        <>
          <Typography variant="h6">Not Subscribed</Typography>
          <Typography variant="h6">Seconds Transcripted : {user.secondsTranscripted}</Typography>
          <Typography variant="h6">
            Transcription Seconds Left : {TRANSRIPTION_SECONDS_FOR_FREE_TRIAL - user.secondsTranscripted}
          </Typography>
        </>
      ) : (
        <>
          <Typography variant="h6">
            Subscription : {user.subscriptionData.name} Plan
            <Button onClick={handleSubscriptionCancel} size="small" sx={{ marginLeft: "1rem" }} color="error" variant="contained">
              Cancel Subscription
            </Button>
          </Typography>
          <Typography variant="h6">Active Until : {moment(user.subscriptionData.endsAt).format("MMM DD, YYYY hh:mm A")}</Typography>
          <Typography variant="h6">Seconds Transcripted : {user.secondsTranscripted}</Typography>
          <Typography variant="h6">
            Transcription Seconds Left : {user.subscriptionData.transcriptionSeconds - user.secondsTranscripted}
          </Typography>
        </>
      )}
      <Grid container gap={3} marginTop={5}>
        <Grid container item xs={5} gap={2}>
          <Grid item xs={12}>
            <TextField
              disabled={isLoading}
              type="email"
              size="small"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="outlined"
              label="Email"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              disabled={isLoading}
              size="small"
              fullWidth
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              variant="outlined"
              label="Username"
            />
          </Grid>
          <Grid display="flex" alignItems="center" item xs={12}>
            <Checkbox disabled={isLoading} checked={changePassword} onClick={() => setChangePassword((b) => !b)} size="small" />
            <Typography>Change Password</Typography>
          </Grid>
          {(isEmailChanged || isUsernameChanged || changePassword) && (
            <Grid item xs={12}>
              <TextField
                disabled={isLoading}
                type="password"
                label="Current Password"
                size="small"
                fullWidth
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                variant="outlined"
              />
            </Grid>
          )}
          {changePassword && (
            <>
              <Grid item xs={12}>
                <TextField
                  disabled={isLoading}
                  size="small"
                  fullWidth
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  variant="outlined"
                  type="password"
                  label="New Password"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  disabled={isLoading}
                  size="small"
                  fullWidth
                  value={newPasswordConfirm}
                  onChange={(e) => setNewPasswordConfirm(e.target.value)}
                  variant="outlined"
                  type="password"
                  label="Confirm New Password"
                />
              </Grid>
            </>
          )}
          {(isEmailChanged || isUsernameChanged || changePassword) && (
            <Grid item xs={4}>
              <Button disabled={isLoading} onClick={handleUpdate} fullWidth variant="contained">
                {isLoading ? <CircularProgress size="1.4rem" /> : "Update"}
              </Button>
            </Grid>
          )}
        </Grid>
        {subscriptionsProvider.loading ? (
          <CircularProgress />
        ) : (
          <Grid container item xs={12} gap={1}>
            {subscriptionsProvider.data.map((subscription) => (
              <Grid item className={styles.subscriptionItem} xs={12} sm={12} md={5} xl={3}>
                <p className={styles.subTitle}>
                  {subscription.name} {user.subscriptionData?.priceId === subscription.priceId && "(Current)"}
                </p>
                <p className={styles.subDays}>{subscription.durationInDays} Days</p>
                <p className={styles.subSeconds}>{subscription.transcriptionSeconds} Seconds Video Transcription</p>
                <p className={styles.subPrice}>{subscription.priceInCents / 100}$</p>
                <Button
                  disabled={user.subscriptionData?.priceId === subscription.priceId}
                  onClick={() => handlePlanUpgrade(subscription.productId, subscription.priceId)}
                  variant="contained"
                >
                  Upgrade
                </Button>
              </Grid>
            ))}
          </Grid>
        )}
      </Grid>
    </div>
  );
};

export default MyAccount;
