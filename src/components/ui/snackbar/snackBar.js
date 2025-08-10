"use client";

import { useEffect, useState, useCallback } from "react";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import LinearProgress from "@mui/material/LinearProgress";

const Alert = (props) => <MuiAlert elevation={6} variant="filled" {...props} />;

const SnackbarWithProgress = ({
  open,
  message,
  severity,
  setSnackbar,
  duration = 6000,
}) => {
  const [progress, setProgress] = useState(0);

  const handleSnackbarClose = useCallback(
    (event, reason) => {
      if (reason === "clickaway") return;
      setSnackbar((prev) => ({ ...prev, open: false }));
    },
    [setSnackbar]
  );

  useEffect(() => {
    if (!open) return;

    setProgress(0);
    const intervalTime = 100;
    const increment = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        const newProgress = oldProgress + increment;
        if (newProgress >= 100) {
          clearInterval(timer);
          return 100;
        }
        return newProgress;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [open, duration]);

  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={handleSnackbarClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <div style={{ width: "100%" }}>
        <Alert
          onClose={handleSnackbarClose}
          severity={severity}
          sx={{ width: "100%", borderRadius: "0px" }}
        >
          {message}
        </Alert>
        <LinearProgress
          color={severity}
          variant="determinate"
          value={progress}
          sx={{ borderRadius: "0px" }}
        />
      </div>
    </Snackbar>
  );
};

export default SnackbarWithProgress;
