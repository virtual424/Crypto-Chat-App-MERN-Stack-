import { createSlice } from "@reduxjs/toolkit";
import crypto from "crypto";

const initialChatState = {
  rooms: [],
  messages: [],
  publicKeys: [],
};

const chatSlice = createSlice({
  name: "chat",
  initialState: initialChatState,
  reducers: {
    addNewRoom(state, actions) {
      const newRoom = actions.payload.room;
      const currentLoggedUser = localStorage.getItem("userName");
      if (
        newRoom.creator !== currentLoggedUser &&
        newRoom.reciever !== currentLoggedUser
      )
        return;

      const roomName =
        newRoom.creator === currentLoggedUser
          ? newRoom.reciever
          : newRoom.creator;

      const keyOb = state.publicKeys.find(
        (keyObj) => keyObj.username === roomName
      );
      const publicKey = keyOb.key;
      const ecdh = crypto.createECDH("secp256k1");
      ecdh.setPrivateKey(localStorage.getItem("KEY"), "base64");
      const sharedSecret = ecdh.computeSecret(publicKey, "base64", "hex");
      newRoom.sharedSecret = sharedSecret;
      state.rooms.push(newRoom);
    },

    addRooms(state, actions) {
      const rooms = actions.payload.rooms;
      rooms.forEach((room) => {
        const roomName =
          room.creator === localStorage.getItem("userName")
            ? room.reciever
            : room.creator;
        const keyOb = state.publicKeys.find(
          (keyObj) => keyObj.username === roomName
        );
        const publicKey = keyOb.key;
        const ecdh = crypto.createECDH("secp256k1");
        ecdh.setPrivateKey(localStorage.getItem("KEY"), "base64");
        const sharedSecret = ecdh.computeSecret(publicKey, "base64", "hex");
        room.sharedSecret = sharedSecret;
      });
      state.rooms = rooms;
    },

    addMessages(state, actions) {
      const encryptedMessages = [...actions.payload.messages];
      const messages = encryptedMessages.map((message, index) => {
        message.index = index;
        return decryptMessage(message, actions.payload.key);
      });
      state.messages = messages;
    },

    setKeys(state, action) {
      state.publicKeys = action.payload.publicKeys;
    },

    setNewKey(state, action) {
      state.publicKeys.push(action.payload);
      console.log(state.publicKeys);
    },

    addNewMessage(state, actions) {
      const newMessage = decryptMessage(
        actions.payload.message,
        actions.payload.key
      );
      state.messages.push(newMessage);
    },
  },
});

export const decryptMessage = (message, key) => {
  if (!message || message.type !== "text") return message;

  const payload = Buffer.from(message.message, "base64").toString("hex");
  const iv = payload.substr(0, 32);
  const encrypted = payload.substr(32, payload.length - 64);
  const authTag = payload.substr(payload.length - 32, 32);

  try {
    if (key) {
      const decipher = crypto.createDecipheriv(
        "aes-256-gcm",
        Buffer.from(key, "hex"),
        Buffer.from(iv, "hex")
      );
      decipher.setAuthTag(Buffer.from(authTag, "hex"));
      let decryptedMessage = decipher.update(encrypted, "hex", "utf8");
      decryptedMessage += decipher.final("utf8");

      message.message = decryptedMessage;
      return message;
    }
  } catch (error) {
    throw error;
  }
};

export default chatSlice;
export const chatActions = chatSlice.actions;
