import { Dialog, DialogTitle } from "@mui/material";
import { Button, CircularProgress, Grid, TextField, Typography } from "@mui/material";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";
import { SnackbarContext } from "../../context/SnackbarContext";

interface IProps {
  open: boolean;
  handleClose: (refetch: boolean) => void;
}

const ProcessVideoDialog = ({ open, handleClose }: IProps) => {
  const snackbarContext = useContext(SnackbarContext);

  const [youtubeVideoUrl, setYoutubeVideoUrl] = useState("");
  const [isVideoProcessingLoading, setIsVideoProcessingLoading] = useState(false);

  const handleProcessVideo = async () => {
    if (!youtubeVideoUrl) return snackbarContext?.openSnackbar("Youtube Video Url is not Provided", "error");
    if (!/^(https?\:\/\/)?((www\.)?youtube\.com|youtu\.be)\/.+$/.test(youtubeVideoUrl))
      return snackbarContext?.openSnackbar("Invalid Url", "error");
    setIsVideoProcessingLoading(true);
    try {
      await api.post(`/v1/user/generate-video`, { youtubeVideoUrl });
      handleClose(true);
    } catch (e: any) {
      snackbarContext?.openSnackbar(e?.response?.data?.message || "Error", "error");
    } finally {
      setIsVideoProcessingLoading(false);
    }
  };
  return (
    <Dialog
      onClose={() => {
        if (!isVideoProcessingLoading) {
          handleClose(false);
        }
      }}
      open={open}
    >
      <div>
        <DialogTitle>Generate Video</DialogTitle>
        <div style={{ padding: "1rem 2rem", width: 500 }}>
          <TextField
            disabled={isVideoProcessingLoading}
            value={youtubeVideoUrl}
            onChange={(e) => setYoutubeVideoUrl(e.target.value)}
            fullWidth
            label="Youtube Video Link"
            variant="outlined"
          />
        </div>

        <div style={{ padding: "1rem 2rem 2rem 2rem" }}>
          {isVideoProcessingLoading ? (
            <CircularProgress size="1.5rem" />
          ) : (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Button onClick={handleProcessVideo} variant="outlined">
                Process
              </Button>
              <Button color="error" onClick={() => handleClose(false)} variant="outlined">
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
};

export default ProcessVideoDialog;
