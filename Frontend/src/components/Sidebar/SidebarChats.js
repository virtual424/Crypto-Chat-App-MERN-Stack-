import React, { useEffect, useState } from "react";
import { fetchRooms, getRecentMessage } from "../../store/database.js";
import styles from "./SidebarChats.module.css";
import { Avatar } from "@material-ui/core";
import Pusher from "pusher-js";
import { chatActions, decryptMessage } from "../../store/chatSlice.js";
import { useSelector, useDispatch } from "react-redux";
import moment from "moment";
import { useHistory } from "react-router-dom";
import { uiActions } from "../../store/uiSlice.js";

const SidebarChats = () => {
  const [activeId, setActiveId] = useState("");
  const dispatch = useDispatch();
  const rooms = useSelector((state) => state.chatReducer.rooms);
  const userId = useSelector((state) => state.userReducer.userId);
  const username = useSelector((state) => state.userReducer.userName);
  const authToken = useSelector((state) => state.userReducer.token);

  useEffect(() => {
    fetchRooms(userId, authToken).then((rooms) => {
      dispatch(chatActions.addRooms({ rooms: rooms }));
    });
  }, [userId, dispatch, authToken]);

  useEffect(() => {
    const pusher = new Pusher("e32b36b52c95aaf22268", {
      cluster: "ap2",
    });

    const channel = pusher.subscribe("rooms");
    channel.bind("inserted", function (data) {
      dispatch(chatActions.addNewRoom({ room: data }));
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [rooms, dispatch]);

  const activeTileHandler = (id) => {
    setActiveId(id);
  };

  return (
    <div className={styles["sidebar-chats"]}>
      {rooms.map((room) => {
        const roomName =
          room.creator !== username ? room.creator : room.reciever;
        const avatarUrl =
          room.creator !== username
            ? room.creatorProfileUrl
            : room.recieverProfileUrl;
        return (
          <ChatTile
            onActive={(id) => activeTileHandler(id)}
            key={room.roomId}
            id={room.roomId}
            active={activeId === room.roomId}
            name={roomName}
            avatarUrl={avatarUrl}
            sharedKey={room.sharedSecret}
            messageRoomId={room.roomId ? room.roomId : ""}
          />
        );
      })}
    </div>
  );
};

const ChatTile = (props) => {
  const [recentMessage, setRecentMessage] = useState(null);
  const history = useHistory();
  const authToken = useSelector((state) => state.userReducer.token);
  const dispatch = useDispatch();
  const messageRoomId = props.messageRoomId;

  useEffect(() => {
    getRecentMessage(messageRoomId, "DESC", authToken)
      .then((message) => {
        const decryptedMessage = decryptMessage(message, props.sharedKey);
        setRecentMessage(decryptedMessage);
      })
      .catch((error) => {
        dispatch(
          uiActions.showDialog({
            type: "ERROR",
            title: "Error",
            message: error.response ? error.response.data.error : error.message,
          })
        );
      });
  }, [messageRoomId, authToken]);

  useEffect(() => {
    const pusher = new Pusher("e32b36b52c95aaf22268", {
      cluster: "ap2",
    });

    const channel = pusher.subscribe("messages");
    channel.bind("inserted", function (data) {
      if (data.roomId === messageRoomId) {
        setRecentMessage(decryptMessage(data, props.sharedKey));
      }
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [messageRoomId]);

  const titleClassName = props.active
    ? `${styles["chat-tile"]} ${styles["chat-tile-active"]}`
    : styles["chat-tile"];

  const time = recentMessage?.timeStamp
    ? moment(new Date(recentMessage?.timeStamp)).format("LT")
    : "...";
  let message;

  if (recentMessage?.type === "image") {
    message = "📷 Image";
  } else if (recentMessage?.type === "video") {
    message = "🎥 Video";
  } else {
    message = recentMessage?.message;
  }

  const clickHandler = () => {
    props.onActive(props.id);
    history.push(`/rooms/${messageRoomId}`);
  };

  return (
    <div className={titleClassName} onClick={clickHandler}>
      <div className={styles.left}>
        <Avatar
          style={{ height: "50px", width: "50px" }}
          src={props.avatarUrl}
        />
        <div className={styles["chat-tile__text"]}>
          <h2>{props.name}</h2>
          <p>{message}</p>
        </div>
      </div>
      <p>{time}</p>
    </div>
  );
};

export default SidebarChats;
