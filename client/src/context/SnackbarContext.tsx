import { Alert, Snackbar } from "@mui/material";
import { createContext, useState, ReactNode } from "react";

type SnackbarContextType = {
  openSnackbar: (message: string, type: AlertType) => void;
};

type AlertType = "error" | "warning" | "info" | "success";

export const SnackbarContext = createContext<SnackbarContextType | null>(null);

export const SnackbarProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState<AlertType>("success");

  const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  const value = {
    openSnackbar: (message: string, type: AlertType) => {
      setMessage(message);
      setType(type);
      setOpen(true);
    },
  };

  return (
    <SnackbarContext.Provider value={value}>
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity={type} sx={{ width: "100%" }}>
          {message}
        </Alert>
      </Snackbar>
      {children}
    </SnackbarContext.Provider>
  );
};
