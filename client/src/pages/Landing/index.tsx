import { Grid } from "@mui/material";
import { Link } from "react-router-dom";
import styles from "./styles.module.css";

const Landing = () => {
  return (
    <Grid container xs={12} justifyContent="center" marginTop={20} gap={5}>
      <Grid item xs={7}>
        <Link to="login">Login</Link>
      </Grid>
      <Grid item xs={7}>
        <Link to="register">Register</Link>
      </Grid>
      <Grid item xs={7}>
        <Link to="dashboard">My Dashboard</Link>
      </Grid>
    </Grid>
  );
};

export default Landing;

// import { Button, CircularProgress, Grid, TextField, Typography } from "@mui/material";
// import { useState } from "react";
// import { api } from "../../api";
// import styles from "./styles.module.css";

// const Landing = () => {
//   const [youtubeVideoUrl, setYoutubeVideoUrl] = useState("");
//   const [processingData, setProcessingData] = useState<any>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<any>(null);

//   const handleClick = async () => {
//     setIsLoading(true);
//     try {
//       const { data } = await api.post(`/v1/upload`, { youtubeVideoUrl });
//       setProcessingData(data);
//     } catch (e: any) {
//       setError(e.response.data);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <Grid container xs={12} justifyContent="center" marginTop={20} gap={5}>
//       {error ? (
//         <>
//           <Grid item xs={7}>
//             <Typography variant="h4">Error :</Typography>
//           </Grid>
//           <Grid item xs={7}>
//             <pre>{JSON.stringify(error, null, 2)}</pre>
//           </Grid>
//         </>
//       ) : processingData ? (
//         <>
//           <Grid item xs={7}>
//             <Typography variant="h4">Uuid of Video is :</Typography>
//           </Grid>
//           <Grid item xs={7}>
//             <Typography variant="body1">{processingData.uuid}</Typography>
//           </Grid>
//         </>
//       ) : (
//         <>
//           <Grid item xs={7}>
//             <Typography variant="h4">Generate Clips and Shorts from Youtube Video</Typography>
//           </Grid>
//           <Grid item xs={7}>
//             <TextField
//               value={youtubeVideoUrl}
//               onChange={(e) => setYoutubeVideoUrl(e.target.value)}
//               fullWidth
//               label="Youtube Video Link"
//               variant="outlined"
//             />
//           </Grid>
//           <Grid item xs={7}>
//             {isLoading ? (
//               <CircularProgress size="1.5rem" />
//             ) : (
//               <Button onClick={handleClick} variant="contained">
//                 Process
//               </Button>
//             )}
//           </Grid>
//         </>
//       )}
//     </Grid>
//   );
// };

// export default Landing;
