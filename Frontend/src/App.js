import ChatSection from "./components/ChatSection/ChatSection";
import SideBar from "./components/Sidebar/SideBar";
import styles from "./App.module.css";
import { useSelector } from "react-redux";
import React from "react";
import { Switch, Route } from "react-router-dom";
import ErrorDialog from "./components/UI/Dialog";
import AuthForm from "./Pages/Auth/AuthForm";
import * as crypto from "crypto";

const App = () => {
  const authToken = useSelector((state) => state.userReducer.token);
  const message = useSelector((state) => state.uiReducer.message);
  const title = useSelector((state) => state.uiReducer.title);

  return (
    <React.Fragment>
      {authToken ? (
        <div className={styles.app}>
          <div className={styles["app__body"]}>
            <SideBar />
            <Switch>
              <Route path="/rooms/:messageRoomId">
                <ChatSection />
              </Route>
              <Route path="/">
                <ChatSection />
              </Route>
            </Switch>
          </div>
        </div>
      ) : (
        <AuthForm />
      )}
      {message && <ErrorDialog title={title} message={message} />}
    </React.Fragment>
  );
};

// const alice = crypto.getDiffieHellman("modp15");
// const bob = crypto.getDiffieHellman("modp15");

// alice.generateKeys();
// bob.generateKeys();

// const a = alice.computeSecret(bob.getPublicKey(), null, "hex");
// const b = bob.computeSecret(alice.getPublicKey(), null, "hex");

// console.log(a, b);

export default App;
