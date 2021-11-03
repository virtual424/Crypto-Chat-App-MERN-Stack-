import React, { useEffect, useState } from "react";
import styles from "./MessageTile.module.css";
import { useSelector } from "react-redux";
import crypto from "crypto";
import mime from "mime-types";
import axios from "axios";

const MessageTile = (props) => {
  const username = useSelector((state) => state.userReducer.userName);
  const sharedKey = useSelector((state) => state.userReducer.sharedKey);
  const [mediaMessage, setMediaMessage] = useState(null);

  const messageClassName =
    props.sender === username
      ? `${styles["message-tile"]} ${styles["chat-reciever"]}`
      : `${styles["message-tile"]}`;
  const type = props.type;

  const style = type !== "text" ? { maxWidth: "30%" } : null;

  const decryptFile = async () => {
    if (type === "text") return;
    const message = props.message;
    if (message) {
      const response = await axios.get(message);
      const payload = Buffer.from(response.data, "base64").toString("hex");
      const iv = payload.substr(0, 32);
      const encrypted = payload.substr(32, payload.length - 64);
      const authTag = payload.substr(payload.length - 32, 32);

      try {
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
        console.log(src);
        setMediaMessage(src);
      } catch (error) {
        console.log(error);
        return "decryption error";
      }
    }
  };

  useEffect(() => {
    decryptFile();
  }, [sharedKey]);

  return (
    <div key={props.key} className={messageClassName} style={style}>
      <div style={{ width: "100%" }}>
        {type === "text" && (
          <p style={{ overflowWrap: "break-word" }}>{props.message}</p>
        )}
        {type === "image" && (
          <img alt="sent" style={{ width: "100%" }} src={mediaMessage} />
        )}
        {type === "video" && (
          <video controls src={mediaMessage} style={{ width: "100%" }}>
            {/* <source type="video/webm" src={mediaMessage} />
            <source type="video/mp4" src={mediaMessage} /> */}
          </video>
        )}
      </div>
      <span className={styles["chat__timeStamp"]}>{props.timestamp}</span>
    </div>
  );
};

export default MessageTile;
