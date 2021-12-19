import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, DialogContentText } from "@mui/material";

export default function ConfirmationDialog(props){
    const { open, onConfirm, onCancel, title, message, cancelText, okText } = props;  
    return (
        <Dialog open={open}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText>{message}</DialogContentText>
            </DialogContent>
            <DialogActions>
            <Button onClick={onCancel}>{cancelText || "Cancel"}</Button>
            <Button onClick={onConfirm} autoFocus>{okText || "Yes"}</Button>
            </DialogActions>
        </Dialog>
)}