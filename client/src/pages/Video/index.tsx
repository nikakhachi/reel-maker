import { Button, CircularProgress, Grid, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../api";
import styles from "./styles.module.css";

const Home = () => {
  const { videoUuid } = useParams<{ videoUuid: string }>();

  const [youtubeVideoUrl, setYoutubeVideoUrl] = useState("");
  const [processingData, setProcessingData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const { data, message } = await api.get(`/v1/${videoUuid}`);
        setProcessingData(data || message);
      } catch (error: any) {
        setError(error.response.data);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return (
    <Grid container xs={12} justifyContent="center" marginTop={20} gap={5}>
      {isLoading ? (
        <CircularProgress />
      ) : error ? (
        <>
          <Grid item xs={7}>
            <Typography variant="h4">Error for {videoUuid} :</Typography>
          </Grid>
          <Grid item xs={7}>
            <pre>{JSON.stringify(error, null, 2)}</pre>
          </Grid>
        </>
      ) : (
        <>
          <Grid item xs={7}>
            <Typography variant="h4">Clips and Reels for {videoUuid} :</Typography>
          </Grid>
          <Grid item xs={7}>
            <p>{JSON.stringify(processingData, null, 2)}</p>
          </Grid>
        </>
      )}
    </Grid>
  );
};

export default Home;
