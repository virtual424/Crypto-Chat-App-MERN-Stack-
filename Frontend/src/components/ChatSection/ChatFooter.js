import React, { useState, useEffect, useCallback } from "react";
import styles from "./ChatFooter.module.css";
import { useParams } from "react-router";
import InsertEmoticonIcon from "@material-ui/icons/InsertEmoticon";
import SendIcon from "@material-ui/icons/Send";
import useInput from "../../hooks/Input";
import MicIcon from "@material-ui/icons/Mic";
import { useSelector, useDispatch } from "react-redux";
import { sendMessage, uploadFile } from "../../store/database";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import { IconButton } from "@material-ui/core";
import Dropzone from "react-dropzone";
import crypto from "crypto";
import { uiActions } from "../../store/uiSlice";

const speechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const mic = new speechRecognition();

mic.continuous = true;
mic.interimResults = true;
mic.lang = "en-IN";

const ChatFooter = () => {
  const { messageRoomId } = useParams();
  const [isListening, setIsListening] = useState(false);
  const dispatch = useDispatch();
  const userName = useSelector((state) => state.userReducer.userName);
  const authToken = useSelector((state) => state.userReducer.token);
  const rooms = useSelector((state) => state.chatReducer.rooms);
  let sharedKey;

  if (messageRoomId) {
    sharedKey = rooms.find(
      (room) => room.roomId === messageRoomId
    ).sharedSecret;
  }

  const {
    enteredInput: enteredMessage,
    inputChangeHandler: messageChangeHandler,
    resetInput: resetMessage,
    isTyping,
    setTranscript,
  } = useInput(/.*/, isListening);

  const uploadFileHandler = async (files, sharedKey) => {
    try {
      uploadFile(authToken, userName, messageRoomId, files, sharedKey);
    } catch (error) {
      dispatch(
        uiActions.showDialog({
          type: "ERROR",
          title: "Error",
          message: error.response ? error.response.data.error : error.message,
        })
      );
    }
  };

  const encryptMessage = (message) => {
    try {
      if (sharedKey) {
        const IV = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(
          "aes-256-gcm",
          Buffer.from(sharedKey, "hex"),
          IV
        );

        let encrypt = cipher.update(message, "utf8", "hex");
        encrypt += cipher.final("hex");

        const authTag = cipher.getAuthTag().toString("hex");
        const payload = IV.toString("hex") + encrypt + authTag;
        const payload64 = Buffer.from(payload, "hex").toString("base64");

        resetMessage();
        return payload64;
      } else {
        const error = Error(
          "Cannot Encrypt Message. Please Check your private Key"
        );
        console.log({ error });
        throw error;
      }
    } catch (error) {
      dispatch(
        uiActions.showDialog({
          type: "ERROR",
          title: "Error",
          message: error.response ? error.response.data.error : error.message,
        })
      );
    }
  };

  const sendMessageHandler = (event) => {
    event.preventDefault();

    const encryptedMessage = encryptMessage(enteredMessage);

    sendMessage(encryptedMessage, userName, messageRoomId, authToken);
  };

  mic.onresult = (event) => {
    const transcript = Array.from(event.results)
      .map((result) => result[0])
      .map((result) => result.transcript)
      .join("");
    setTranscript(transcript);
    mic.onerror = (event) => {
      dispatch(
        uiActions.showDialog({
          type: "ERROR",
          title: "Error",
          message: event.error.response
            ? event.error.response.data.error
            : event.error.message,
        })
      );
    };
  };

  mic.onend = () => {
    if (enteredMessage.length === 0) return;
    const message = encryptMessage(enteredMessage);
    sendMessage(message, userName, messageRoomId, authToken).catch((error) => {
      dispatch(
        uiActions.showDialog({
          type: "ERROR",
          title: "Error",
          message: error.response ? error.response.data.error : error.message,
        })
      );
    });
    resetMessage();
  };

  const handleListening = useCallback(() => {
    if (isListening) {
      mic.start();
    } else {
      mic.stop();
    }
  }, [isListening]);

  useEffect(() => {
    handleListening();
  }, [isListening, handleListening]);

  return (
    <div className={styles["chat-footer"]}>
      <IconButton>
        <InsertEmoticonIcon />
      </IconButton>
      <Dropzone
        onDrop={(event) => {
          uploadFileHandler(event, sharedKey);
        }}
      >
        {({ getRootProps, getInputProps }) => (
          <section>
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <IconButton>
                <AttachFileIcon />
              </IconButton>
            </div>
          </section>
        )}
      </Dropzone>

      <form onSubmit={sendMessageHandler}>
        <input
          type="text"
          value={enteredMessage}
          placeholder="Type a message"
          onChange={messageChangeHandler}
        />
      </form>
      {isTyping ? (
        <IconButton onClick={sendMessageHandler}>
          <SendIcon />
        </IconButton>
      ) : (
        <IconButton
          onMouseDown={() => {
            setIsListening(true);
          }}
          onMouseUp={() => {
            setIsListening(false);
          }}
        >
          <MicIcon />
        </IconButton>
      )}
    </div>
  );
};

export default ChatFooter;
