import Input from "../UI/Input";
import Button from "../UI/Button";
import Modal from "../UI/Modal";
import { addRoom } from "../../store/database";
import styles from "./NewChatInput.module.css";
import React, { useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import ReactDOM from "react-dom";
import { uiActions } from "../../store/uiSlice";
import Backdrop from "../UI/Backdrop";

const NewChatInputModal = (props) => {
  const newChatRef = useRef();
  const userId = useSelector((state) => state.userReducer.userId);
  const profileUrl = useSelector((state) => state.userReducer.profileUrl);
  const authToken = useSelector((state) => state.userReducer.token);
  const dispatch = useDispatch();

  const submitHandler = (event) => {
    event.preventDefault();

    const enteredName = newChatRef.current.value.trim();
    if (enteredName.trim() === "") {
      return;
    }
    addRoom(enteredName, userId, profileUrl, authToken).catch((error) => {
      dispatch(
        uiActions.showDialog({
          type: "ERROR",
          title: "Error",
          message: error.response ? error.response.data.error : error.message,
        })
      );
    });
    props.onCancel();
  };

  const content = (
    <Modal>
      <form onSubmit={submitHandler} className={styles["new-chat"]}>
        <h2>New Chat</h2>
        <Input type="text" placeholder="Enter name" ref={newChatRef} />
        <Button type="submit" text="Done" className={styles.button} />
      </form>
    </Modal>
  );

  return (
    <React.Fragment>
      {ReactDOM.createPortal(content, document.getElementById("modal-root"))}
      {ReactDOM.createPortal(
        <Backdrop onCancel={props.onCancel} />,
        document.getElementById("backdrop-root")
      )}
    </React.Fragment>
  );
};

export default NewChatInputModal;
