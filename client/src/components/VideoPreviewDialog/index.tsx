import { Dialog, DialogTitle } from "@mui/material";

interface IProps {
  open: boolean;
  handleClose: () => void;
  videoUrl: string;
  title: string;
}

const VideoPreviewDialog = ({ open, handleClose, videoUrl, title }: IProps) => {
  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>{title}</DialogTitle>
      <video controls onLoad={() => console.log("ha")} src={videoUrl} />
    </Dialog>
  );
};

export default VideoPreviewDialog;
