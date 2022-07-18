import { CircularProgress } from "@mui/material";

const Loader = () => (
  <div
    style={{
      position: "absolute",
      width: "100%",
      height: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <CircularProgress />
  </div>
);

export default Loader;
