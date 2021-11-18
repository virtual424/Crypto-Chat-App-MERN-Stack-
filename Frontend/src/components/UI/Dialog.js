import React from "react";
import styles from "./Dialog.module.css";
import Button from "./Button";
import ReactDOM from "react-dom";
import { useDispatch } from "react-redux";
import { uiActions } from "../../store/uiSlice";
import Backdrop from "./Backdrop";
import Modal from "./Modal";

const Dialog = (props) => {
  const dispatch = useDispatch();

  const closeModal = () => {
    dispatch(
      uiActions.showDialog({
        type: null,
        title: null,
        message: null,
      })
    );
    window.location.reload();
  };

  const content = (
    <Modal>
      <h2 className={styles.errorTitle}>{props.title}</h2>
      <p>{props.message}</p>
      <Button text="OK" className={styles.button} onClick={closeModal} />
    </Modal>
  );

  return (
    <>
      {ReactDOM.createPortal(content, document.getElementById("modal-root"))}
      {ReactDOM.createPortal(
        <Backdrop onCancel={closeModal} />,
        document.getElementById("backdrop-root")
      )}
    </>
  );
};

export default Dialog;
