import React, { useState, useEffect } from "react";
import Pusher from "pusher-js";
import { CircularProgress } from "@material-ui/core";
import { useHistory } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { userActions } from "./userSlice";
import { uiActions } from "./uiSlice";
import styles from "../App.module.css";
import moment from "moment";
import crypto from "crypto";
import axios from "axios";
import Worker from "../workers/ecdh.worker";
import { chatActions } from "./chatSlice";

const AuthContext = React.createContext({
  isLoading: true,
  signIn: () => {},
  signOut: () => {},
  signUp: () => {},
});

export const AuthContextProvider = (props) => {
  const [isLoading, setIsLoading] = useState(true);
  const history = useHistory();
  const dispatch = useDispatch();

  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch (error) {
      dispatch(
        uiActions.showDialog({
          type: "ERROR",
          title: "Error",
          message: error.response ? error.response.data.error : error.message,
        })
      );

      return null;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (localStorage.getItem("token")) {
      const decodedJwt = parseJwt(token);
      if (decodedJwt.exp * 1000 < Date.now()) {
        dispatch(
          uiActions.showDialog({
            type: "ERROR",
            title: "Error",
            message: "Token expired. User logged out",
          })
        );
        signOutHandler();
      } else {
        dispatch(
          userActions.setUser({
            token: localStorage.getItem("token"),
            userName: localStorage.getItem("userName"),
            userId: localStorage.getItem("userId"),
            profileUrl: localStorage.getItem("profileUrl"),
            privateKey: localStorage.getItem("KEY"),
          })
        );

        window.worker = new Worker();

        fetchPublicKeys()
          .then((publicKeys) => {
            dispatch(chatActions.setKeys({ publicKeys }));
          })
          .catch((error) => {
            dispatch(
              uiActions.showDialog({
                type: "ERROR",
                title: "Error",
                message: error.response
                  ? error.response.data.error
                  : error.message,
              })
            );
          });
      }
    }
    setIsLoading(false);

    return () => {
      window.worker?.terminate();
    };
  }, [dispatch]);

  useEffect(() => {
    var pusher = new Pusher("e32b36b52c95aaf22268", {
      cluster: "ap2",
    });

    var channel = pusher.subscribe("keys");
    channel.bind("inserted", function (data) {
      dispatch(chatActions.setNewKey(data));
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [dispatch]);

  const signUpHandler = async (username, email, password, profileUrl) => {
    setIsLoading(true);
    window.worker = new Worker();
    const ecdh = crypto.createECDH("secp256k1");
    ecdh.generateKeys();
    const publicKey = ecdh.getPublicKey().toString("base64");
    const privateKey = ecdh.getPrivateKey().toString("base64");

    try {
      const { data } = await axios.post(
        "http://localhost:8080/api/auth/register",
        {
          username,
          email,
          password,
          profileUrl,
          publicKey,
        }
      );

      localStorage.setItem("profileUrl", data.profileUrl);
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("userName", data.username);
      localStorage.setItem("KEY", privateKey);

      dispatch(
        userActions.setUser({
          token: data.token,
          userName: data.username,
          userId: data.userId,
          profileUrl: data.profileUrl,
          privateKey,
        })
      );

      dispatch(
        uiActions.showDialog({
          type: "MESSAGE",
          title: "Alert",
          message: `This is your privateKey kindly keep it safe: ${privateKey}`,
        })
      );
      // window.location.reload();
    } catch (error) {
      dispatch(
        uiActions.showDialog({
          type: "ERROR",
          title: "Error",
          message: error.response ? error.response.data.error : error.message,
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const signInHandler = async (email, password, privateKey) => {
    setIsLoading(true);
    window.worker = new Worker();
    try {
      const { data } = await axios.post(
        "http://localhost:8080/api/auth/login",
        {
          email,
          password,
        }
      );

      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("userName", data.username);
      localStorage.setItem("profileUrl", data.profileUrl);
      localStorage.setItem("KEY", privateKey);

      dispatch(
        userActions.setUser({
          token: data.token,
          userName: data.username,
          userId: data.userId,
          profileUrl: data.profileUrl,
          privateKey,
        })
      );

      window.location.reload();
    } catch (error) {
      dispatch(
        uiActions.showDialog({
          type: "ERROR",
          title: "Error",
          message: error.response ? error.response.data.error : error.message,
        })
      );
      console.error({ error });
    } finally {
      setIsLoading(false);
    }
  };

  const signOutHandler = async () => {
    setIsLoading(true);

    try {
      const status = moment(Date.now()).format("LT");
      const userId = localStorage.getItem("userId");

      await axios.post(`http://localhost:8080/api/auth/${userId}/logout`, {
        status,
      });

      localStorage.removeItem("token");
      localStorage.removeItem("userName");
      localStorage.removeItem("userId");
      localStorage.removeItem("profileUrl");
      localStorage.removeItem("KEY");

      dispatch(
        userActions.setUser({
          token: null,
          userName: null,
          userId: null,
          profileUrl: null,
          privateKey: null,
        })
      );
      history.push("/");

      window.location.reload();
    } catch (error) {
      dispatch(
        uiActions.showDialog({
          type: "ERROR",
          title: "Error",
          message: error.response ? error.response.data.error : error.message,
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const authContextValue = {
    isLoading: isLoading,
    signIn: signInHandler,
    signOut: signOutHandler,
    signUp: signUpHandler,
  };

  if (isLoading) {
    return (
      <div className={styles.app}>
        <CircularProgress
          style={{ color: "#04bba3" }}
          varient="indeterminate"
        />
      </div>
    );
  }

  return (
    <React.Fragment>
      <AuthContext.Provider value={authContextValue}>
        {props.children}
      </AuthContext.Provider>
    </React.Fragment>
  );
};

export const fetchPublicKeys = async () => {
  try {
    const response = await axios.get(
      "http://localhost:8080/api/keys/fetchKeys"
    );
    return response.data.keys;
  } catch (error) {
    throw new Error(error);
  }
};

export default AuthContext;
