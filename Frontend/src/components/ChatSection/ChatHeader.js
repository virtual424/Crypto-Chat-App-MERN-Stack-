import { Avatar, IconButton } from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import styles from "./ChatHeader.module.css";
import { useParams } from "react-router-dom";
import { fetchRoomName } from "../../store/database";

const ChatHeader = () => {
  const { messageRoomId } = useParams();
  const [roomName, setRoomName] = useState("");
  const [roomProfileUrl, setRoomProfileUrl] = useState(null);
  const userId = useSelector((state) => state.userReducer.userId);
  const userName = useSelector((state) => state.userReducer.userName);
  const authToken = useSelector((state) => state.userReducer.token);

  useEffect(() => {
    fetchRoomName(userName, messageRoomId, userId, authToken).then(
      (roomData) => {
        if (roomData) {
          setRoomName(roomData.roomName);
          setRoomProfileUrl(roomData.roomProfileUrl);
        }
      }
    );
  }, [messageRoomId, userId, userName, authToken]);

  return (
    <div className={styles["chat-header"]}>
      <Avatar style={{ height: "35px", width: "35px" }} src={roomProfileUrl} />
      <div className={styles["chat-header__info"]}>
        <h3>{roomName}</h3>
        <p>online</p>
      </div>
      <div className={styles["chat-header__right"]}>
        <IconButton>
          <SearchIcon style={{ height: "20px", width: "20px" }} />
        </IconButton>
        <IconButton>
          <MoreVertIcon style={{ height: "20px", width: "20px" }} />
        </IconButton>
      </div>
    </div>
  );
};

export default ChatHeader;
