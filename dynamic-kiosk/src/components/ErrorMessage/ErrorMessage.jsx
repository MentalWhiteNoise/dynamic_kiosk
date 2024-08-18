import * as React from 'react';
import { Snackbar, Alert} from '@mui/material';

export default function ErrorMessage(props) {
  const { errorMessage, onClearErrorMessage } = props;
  var open = (errorMessage ?? "") != ""

  return (
    <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={open}
        autoHideDuration={6000}
        onClose={onClearErrorMessage}
        >
        <Alert severity="error">{errorMessage}</Alert>
    </Snackbar>
  );
}