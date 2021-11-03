import axios from "axios";
import { chatActions, decryptMessage } from "./chatSlice";
import crypto from "crypto";

const addRoom = async (enteredName, userId, profileUrl, authToken) => {
  try {
    const config = {
      headers: {
        authorization: `Bearer ${authToken}`,
      },
    };

    const data = {
      creator: localStorage.getItem("userName"),
      reciever: enteredName,
      creatorProfileUrl: profileUrl,
      createdAt: new Date(),
      messages: [],
    };

    const response = await axios.post(
      `http://localhost:8080/api/chats/rooms/${userId}/addRooms`,
      data,
      config
    );
  } catch (error) {
    console.log(error);
  }
};

const fetchRooms = async (userId, dispatch, authToken) => {
  const config = {
    headers: {
      authorization: `Bearer ${authToken}`,
    },
  };

  try {
    const rooms = await axios.get(
      `http://localhost:8080/api/chats/rooms/${userId}/getRooms`,
      config
    );

    if (rooms.data.data) {
      dispatch(chatActions.addRooms({ rooms: rooms.data.data }));
    }
  } catch (error) {
    console.log(error.message);
  }
};

const fetchMessages = async (
  messageRoomId,
  dispatch,
  sortOrder,
  authToken,
  sharedKey
) => {
  const config = {
    headers: {
      authorization: `Bearer ${authToken}`,
    },
  };
  try {
    if (!messageRoomId) return;

    const messages = await axios.get(
      `http://localhost:8080/api/chats/messages/${messageRoomId}/fetchMessages/${sortOrder}`,
      config
    );

    if (messages.data.data) {
      dispatch(
        chatActions.addMessages({
          messages: messages.data.data,
          key: sharedKey,
        })
      );
    }
  } catch (error) {
    console.log(error);
  }
};

const sendMessage = async (
  enteredMessage,
  username,
  messageRoomId,
  authToken
) => {
  const config = {
    headers: {
      authorization: `Bearer ${authToken}`,
    },
  };

  const data = {
    sender: username,
    enteredMessage,
  };
  try {
    await axios.post(
      `http://localhost:8080/api/chats/messages/${messageRoomId}/sendMessages`,
      data,
      config
    );
  } catch (error) {
    console.log(error.message);
  }
};

const fetchRoomName = async (username, roomId, userId, authToken) => {
  const config = {
    headers: {
      authorization: `Bearer ${authToken}`,
    },
  };

  try {
    const rooms = await axios.get(
      `http://localhost:8080/api/chats/rooms/${userId}/getRooms`,
      config
    );

    const room = rooms.data.data.filter((room) => {
      return room.roomId === roomId;
    })[0];

    if (!room) return;

    const roomName = room.creator === username ? room.reciever : room.creator;
    const roomProfileUrl =
      room.creator === username
        ? room.recieverProfileUrl
        : room.creatorProfileUrl;
    const roomData = { roomName, roomProfileUrl };
    return roomData;
    // setRoomName(roomName);
    // if (setProfileUrl) {
    //   setProfileUrl(roomProfileUrl);
    // }
  } catch (error) {
    console.log(error.message);
  }
};

const getRecentMessage = async (
  messageRoomId,
  setRecentMessage,
  sortOrder,
  authToken,
  sharedKey
) => {
  const config = {
    headers: {
      authorization: `Bearer ${authToken}`,
    },
  };

  try {
    if (!messageRoomId) return;

    const messages = await axios.get(
      `http://localhost:8080/api/chats/messages/${messageRoomId}/fetchMessages/${sortOrder}`,
      config
    );

    if (messages.data.data) {
      const message = decryptMessage(messages.data.data[0], sharedKey);
      setRecentMessage(message);
    }
  } catch (error) {
    console.log(error.message);
  }
};

const fileToBase64 = (file) => {
  return new Promise((resolve) => {
    let reader = new FileReader();
    reader.onload = (event) => {
      resolve(event.target.result);
    };
    reader.readAsDataURL(file);
  });
};

// function base64ImageToBlob(str) {
//   // extract content type and base64 payload from original string
//   // var pos = str.indexOf("base64");
//   // var b64 = str.substr(pos + 6);

//   // decode base64
//   var imageContent = atob(str);

//   // create an ArrayBuffer and a view (as unsigned 8-bit)
//   var buffer = new ArrayBuffer(imageContent.length);
//   var view = new Uint8Array(buffer);

//   // fill the view, using the decoded base64
//   for (var n = 0; n < imageContent.length; n++) {
//     view[n] = imageContent.charCodeAt(n);
//   }

//   // convert ArrayBuffer to Blob
//   var blob = new Blob([buffer], { type: "text/plain" });

//   return blob;
// }

const uploadFile = async (
  authToken,
  userName,
  messageRoomId,
  files,
  sharedKey
) => {
  let formData = new FormData();

  const config = {
    headers: {
      "content-type": "multipart/form-data",
      authorization: `Bearer ${authToken}`,
    },
  };

  try {
    const base64File = await fileToBase64(files[0]);
    const IV = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      "aes-256-gcm",
      Buffer.from(sharedKey, "hex"),
      IV
    );
    let encrypt = cipher.update(base64File, "base64", "hex");
    encrypt += cipher.final("hex");
    const authTag = cipher.getAuthTag().toString("hex");
    const payload = IV.toString("hex") + encrypt + authTag;
    const payload64 = Buffer.from(payload, "hex").toString("base64");
    const blob = new Blob([payload64], { type: "text/plain" });
    const file = new File([blob], files[0].name);
    formData.append("file", file);
    formData.append("sender", userName);
    formData.append("mimetype", files[0].type);
    await axios.post(
      `http://localhost:8080/api/chats/messages/${messageRoomId}/uploadFiles`,
      formData,
      config
    );
  } catch (error) {
    console.log(error);
  }
};

export {
  addRoom,
  fetchRooms,
  fetchMessages,
  sendMessage,
  fetchRoomName,
  getRecentMessage,
  uploadFile,
};
