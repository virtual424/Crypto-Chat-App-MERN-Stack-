import ChatSection from "./components/ChatSection/ChatSection";
import SideBar from "./components/Sidebar/SideBar";
import styles from "./App.module.css";
import { useSelector } from "react-redux";
import React from "react";
import { Switch, Route } from "react-router-dom";
import ErrorDialog from "./components/UI/Dialog";
import AuthForm from "./Pages/Auth/AuthForm";
import WelcomePage from "./components/UI/WelcomePage";

const App = () => {
  const authToken = useSelector((state) => state.userReducer.token);
  const message = useSelector((state) => state.uiReducer.message);
  const title = useSelector((state) => state.uiReducer.title);
  const rooms = useSelector((state) => state.chatReducer.rooms);

  return (
    <React.Fragment>
      {authToken ? (
        <div className={styles.app}>
          <div className={styles["app__body"]}>
            <SideBar />
            <Switch>
              <Route path="/rooms/:messageRoomId">
                {rooms.length > 0 && <ChatSection />}
              </Route>
              <Route path="/">
                <WelcomePage />
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

export default App;
