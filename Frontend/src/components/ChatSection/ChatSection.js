import React from "react";
import ChatBody from "./ChatBody";
import ChatFooter from "./ChatFooter";
import ChatHeader from "./ChatHeader";

import styles from "./ChatSection.module.css";

const ChatSection = () => {
  return (
    <div className={styles.chat}>
      <ChatHeader />
      <ChatBody />
      <ChatFooter />
    </div>
  );
};

export default ChatSection;
