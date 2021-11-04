import React from "react";
import styles from "./WelcomePage.module.css";
import welcomePng from "./welcome.png";

const WelcomePage = () => {
  return (
    <div className={styles.welcomeChatBody}>
      <img src={welcomePng} alt="welcome" className={styles.welcomeImg} />
      <h2 className={styles.appTitle}>CryptoChat App</h2>
      <div className={styles.info}>
        <p>Send and receive messages securely with End-to-End encryption</p>
        <p>Use on any device web, mobile or your desktop PC</p>
      </div>
      <hr />
      <p className={styles.label}>🔒 End-to-End encrypted</p>
    </div>
  );
};

export default WelcomePage;
