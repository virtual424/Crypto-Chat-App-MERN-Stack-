import React, { useEffect, useRef } from "react";
import moment from "moment";
import Pusher from "pusher-js";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router";
import { fetchMessages, fetchRoomName } from "../../store/database";
import { chatActions } from "../../store/chatSlice";
import { userActions } from "../../store/userSlice.js";
import crypto from "crypto";
import styles from "./ChatBody.module.css";
import MessageTile from "./MessageTile";
import { fetchPublicKeys } from "../../store/AuthContext";

const ChatBody = () => {
  const privateKey = useSelector((state) => state.userReducer.privateKey);
  const { messageRoomId } = useParams();
  const messages = useSelector((state) => state.chatReducer.messages);
  const authToken = useSelector((state) => state.userReducer.token);
  const username = useSelector((state) => state.userReducer.userName);
  const userId = useSelector((state) => state.userReducer.userId);
  const scrollRef = useRef();
  const sharedKey = useSelector((state) => state.userReducer.sharedKey);
  const dispatch = useDispatch();

  useEffect(() => {
    if (messageRoomId) {
      fetchRoomName(username, messageRoomId, userId, authToken).then(
        (result) => {
          const roomName = result.roomName;
          fetchPublicKeys().then((keys) => {
            const data = keys.find((key) => key.username === roomName);
            const ecdh = crypto.createECDH("secp256k1");
            ecdh.setPrivateKey(privateKey, "base64");
            const sharedSecret = ecdh.computeSecret(data.key, "base64", "hex");
            dispatch(userActions.setSharedKey({ sharedKey: sharedSecret }));
          });
        }
      );
    }
  }, [messageRoomId, dispatch, authToken]);

  useEffect(() => {
    if (sharedKey) {
      fetchMessages(messageRoomId, dispatch, "ASC", authToken, sharedKey);
    }
  }, [sharedKey]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behaviour: "smooth" });
  }, [messages]);

  useEffect(() => {
    var pusher = new Pusher("e32b36b52c95aaf22268", {
      cluster: "ap2",
    });

    var channel = pusher.subscribe("messages");
    channel.bind("inserted", function (data) {
      console.log(sharedKey);
      dispatch(chatActions.addNewMessage({ message: data, key: sharedKey }));
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [messages, dispatch]);

  return (
    <div className={styles["chat-body"]}>
      {messages.map((message) => {
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
            />
          </div>
        );
      })}
    </div>
  );
};

export default ChatBody;
