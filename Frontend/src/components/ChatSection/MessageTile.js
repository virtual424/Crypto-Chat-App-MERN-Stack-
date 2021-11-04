import React, { useEffect, useState } from "react";
import styles from "./MessageTile.module.css";
import { useSelector, useDispatch } from "react-redux";
import { uiActions } from "../../store/uiSlice";
import crypto from "crypto";
import axios from "axios";

const MessageTile = (props) => {
  const dispatch = useDispatch();
  const username = useSelector((state) => state.userReducer.userName);
  const [mediaMessage, setMediaMessage] = useState(null);
  const sharedKey = props.sharedKey;
  const messageClassName =
    props.sender === username
      ? `${styles["message-tile"]} ${styles["chat-reciever"]}`
      : `${styles["message-tile"]}`;

  const type = props.type;

  const style = type !== "text" ? { maxWidth: "30%" } : null;

  const decryptFile = async () => {
    if (type === "text") return;

    let message = props.message;
    if (message) {
      try {
        const response = await axios.get(message);

        const payload = Buffer.from(response.data, "base64").toString("hex");
        const iv = payload.substr(0, 32);
        const encrypted = payload.substr(32, payload.length - 64);
        const authTag = payload.substr(payload.length - 32, 32);

        const decipher = crypto.createDecipheriv(
          "aes-256-gcm",
          Buffer.from(sharedKey, "hex"),
          Buffer.from(iv, "hex")
        );
        decipher.setAuthTag(Buffer.from(authTag, "hex"));

        let decryptedMessage = decipher.update(encrypted, "hex", "base64");
        decryptedMessage += decipher.final("base64");

        let buffer = Buffer.from(
          decryptedMessage.substring(decryptedMessage.indexOf("base64") + 6),
          "base64"
        );
        let blob = new Blob([buffer.buffer]);

        var src = URL.createObjectURL(
          new File([blob], "name.mp4", { type: "video/mp4" })
        );
        setMediaMessage(src);
      } catch (error) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    if (sharedKey) {
      decryptFile();
    }
  }, [sharedKey]);

  return (
    <div key={props.key} className={messageClassName} style={style}>
      <div style={{ width: "100%" }}>
        {type === "text" && (
          <p
            style={{
              overflowWrap: "break-word",
              fontSize: "0.9rem",
              fontWeight: "350",
            }}
          >
            {props.message}
          </p>
        )}
        {type === "image" && (
          <img alt="sent" style={{ width: "100%" }} src={mediaMessage} />
        )}
        {type === "video" && (
          <video controls src={mediaMessage} style={{ width: "100%" }} />
        )}
      </div>
      <span className={styles["chat__timeStamp"]}>{props.timestamp}</span>
    </div>
  );
};

export default MessageTile;
