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
import { fetchRoomName } from "../../store/database";
import Dropzone from "react-dropzone";
import crypto from "crypto";
import { userActions } from "../../store/userSlice";

const speechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const mic = new speechRecognition();

mic.continuous = true;
mic.interimResults = true;
mic.lang = "en-IN";

const ChatFooter = () => {
  const { messageRoomId } = useParams();
  const [isListening, setIsListening] = useState(false);
  const userName = useSelector((state) => state.userReducer.userName);
  const authToken = useSelector((state) => state.userReducer.token);
  const userId = useSelector((state) => state.userReducer.userId);
  // const publicKeys = useSelector((state) => state.userReducer.publicKeys);
  // const privateKey = useSelector((state) => state.userReducer.privateKey);
  const [roomName, setRoomName] = useState(null);
  const dispatch = useDispatch();
  const sharedKey = useSelector((state) => state.userReducer.sharedKey);

  useEffect(() => {
    fetchRoomName(userName, messageRoomId, userId, authToken).then(
      (roomData) => {
        if (roomData) {
          setRoomName(roomData.roomName);
          // setPublicKey();
        }
      }
    );
  }, [messageRoomId, userId, userName, authToken]);

  useEffect(() => {
    // if (roomName) {
    //   const document = publicKeys.filter((doc) => doc.username === roomName);
    //   const key = document[0].key;
    //   const ecdh = crypto.createECDH("secp256k1");
    //   ecdh.setPrivateKey(privateKey, "base64");
    //   const sharedSecret = ecdh.computeSecret(key, "base64", "hex");
    //   dispatch(userActions.setSharedKey({ sharedKey: sharedSecret }));
    // }
  }, [roomName]);

  const uploadFileHandler = async (files, sharedKey) => {
    try {
      const reponse = await uploadFile(
        authToken,
        userName,
        messageRoomId,
        files,
        sharedKey
      );
    } catch (error) {
      console.log(error);
    }
  };

  const {
    enteredInput: enteredMessage,
    inputChangeHandler: messageChangeHandler,
    resetInput: resetMessage,
    isTyping,
    setTranscript,
  } = useInput(/.*/, isListening);

  const sendMessageHandler = (event) => {
    event.preventDefault();

    if (sharedKey) {
      const IV = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(
        "aes-256-gcm",
        Buffer.from(sharedKey, "hex"),
        IV
      );
      let encrypt = cipher.update(enteredMessage, "utf8", "hex");
      encrypt += cipher.final("hex");
      const authTag = cipher.getAuthTag().toString("hex");
      const payload = IV.toString("hex") + encrypt + authTag;
      const payload64 = Buffer.from(payload, "hex").toString("base64");
      sendMessage(payload64, userName, messageRoomId, authToken);
      resetMessage();
    } else {
      console.log("cannot send");
    }
  };

  mic.onstart = () => {
    console.log("Mics on");
  };

  mic.onresult = (event) => {
    const transcript = Array.from(event.results)
      .map((result) => result[0])
      .map((result) => result.transcript)
      .join("");
    setTranscript(transcript);
    mic.onerror = (event) => {
      console.log(event.error);
    };
  };

  mic.onend = () => {
    console.log("stopeed mic");
    sendMessage(enteredMessage, userName, messageRoomId, authToken);
    resetMessage();
  };

  const handleListening = useCallback(() => {
    if (isListening) {
      mic.start();
    } else {
      mic.stop();
    }
  }, [isListening]);

  // const handleListening = () => {
  //   if (isListening) {
  //     mic.start();
  //   } else {
  //     mic.stop();
  //   }
  // };

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
            console.log("listening");
          }}
          onMouseUp={() => {
            setIsListening(false);
            console.log("stopped listening");
          }}
        >
          <MicIcon />
        </IconButton>
      )}
    </div>
  );
};

export default ChatFooter;
