import * as React from 'react';
import Snackbar from '@mui/material/Snackbar';
import { useEffect } from 'react';

export default function AutohideSnackbar({message, setMessage}) {
  const [open, setOpen] = React.useState(false); 

  useEffect(()=>{
    if (message) {
      setOpen(true);
    }
  },[message])

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
    setMessage(null)
  };

  const handleExited = () => {
    setMessage([]);
  };


  return (
    <div>
      <Snackbar
        open={open}
        autoHideDuration={5000}
        onClose={handleClose}
        message={message}
      />
    </div>
  );
}