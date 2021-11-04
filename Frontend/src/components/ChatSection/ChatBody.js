import React, { useEffect, useRef, useState } from "react";
import moment from "moment";
import Pusher from "pusher-js";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router";
import { fetchMessages } from "../../store/database";
import { chatActions } from "../../store/chatSlice";
import styles from "./ChatBody.module.css";
import MessageTile from "./MessageTile";

const ChatBody = () => {
  const { messageRoomId } = useParams();
  const scrollRef = useRef();
  const dispatch = useDispatch();

  const rooms = useSelector((state) => state.chatReducer.rooms);
  const sharedKey = rooms.find(
    (room) => room.roomId === messageRoomId
  ).sharedSecret;

  const messages = useSelector((state) => state.chatReducer.messages);
  const authToken = useSelector((state) => state.userReducer.token);

  useEffect(() => {
    if (messageRoomId) {
      fetchMessages(messageRoomId, "ASC", authToken).then((messages) => {
        dispatch(
          chatActions.addMessages({
            messages: messages,
            key: sharedKey,
          })
        );
      });
    }
  }, [messageRoomId, authToken, dispatch]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behaviour: "smooth" });
  }, [messages]);

  useEffect(() => {
    var pusher = new Pusher("e32b36b52c95aaf22268", {
      cluster: "ap2",
    });

    var channel = pusher.subscribe("messages");
    channel.bind("inserted", function (data) {
      dispatch(chatActions.addNewMessage({ message: data, key: sharedKey }));
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [messages, dispatch]);

  return (
    <div className={styles["chat-body"]}>
      {messages &&
        messages.map((message) => {
          const time = message.timeStamp
            ? moment(new Date(message.timeStamp)).format("LT")
            : "...";
          return (
            <div key={message.id} ref={scrollRef}>
              <MessageTile
                type={message.type}
                id={message.id}
                sender={message.sender}
                message={message.message}
                timestamp={time}
                sharedKey={sharedKey}
              />
            </div>
          );
        })}
    </div>
  );
};

export default ChatBody;
