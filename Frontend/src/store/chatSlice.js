import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import crypto from "crypto";

const initialChatState = { rooms: [], messages: [] };

const chatSlice = createSlice({
  name: "chat",
  initialState: initialChatState,
  reducers: {
    addNewRoom(state, actions) {
      const newRoom = actions.payload.room;
      //   const existingRooms = state.rooms;
      state.rooms.push(newRoom);
    },

    addRooms(state, actions) {
      state.rooms = actions.payload.rooms;
    },

    addMessages(state, actions) {
      const encryptedMessages = [...actions.payload.messages];
      const messages = encryptedMessages.map((message, index) => {
        message.index = index;
        return decryptMessage(message, actions.payload.key);
      });

      // let promises = [];
      // for (let message of messages) {
      //   if (message.type !== "text") {
      //     promises.push(decryptFile(message, actions.payload.key));
      //   }
      // }

      // Promise.allSettled(promises).then(() => {
      //   state.messages = messages;
      // });
      state.messages = messages;
    },

    // setMessages(state, actions) {
    //   state.messages = actions.payload.messages;
    // },

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
  if (message.type !== "text") return message;

  const payload = Buffer.from(message.message, "base64").toString("hex");
  const iv = payload.substr(0, 32);
  const encrypted = payload.substr(32, payload.length - 64);
  const authTag = payload.substr(payload.length - 32, 32);

  try {
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
  } catch (error) {
    console.log(error);
    return "decryption error";
  }
};

const decryptFile = async (message, key) => {
  let res = await axios.get(message.message, { responseType: "text" });

  const payload = Buffer.from(res.data, "base64").toString("hex");
  const iv = payload.substr(0, 32);
  const encrypted = payload.substr(32, payload.length - 64);
  const authTag = payload.substr(payload.length - 32, 32);

  try {
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      Buffer.from(
        "2bd5e574738c12fad96b6617316b8076c883fc4a6f9571c36b6ac7466e91297e",
        "hex"
      ),
      Buffer.from(iv, "hex")
    );
    decipher.setAuthTag(Buffer.from(authTag, "hex"));
    let decryptedMessage = decipher.update(encrypted, "hex", "base64");
    decryptedMessage += decipher.final("base64");
    let firstPart = decryptMessage.substring(
      0,
      decryptMessage.indexOf("base64") + 6
    );
    let secondPart = decryptMessage.substring(
      decryptMessage.indexOf("base64") + 6
    );
    firstPart =
      "data:" +
      decryptMessage.substring(4, decryptMessage.indexOf("base64")) +
      ";base64,";
    firstPart += secondPart;

    console.log(firstPart);
    message.message = firstPart;
  } catch (error) {
    console.log(error);
    return "decryption error";
  }
};

export default chatSlice;
export const chatActions = chatSlice.actions;
