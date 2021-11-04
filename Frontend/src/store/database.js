import axios from "axios";
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

    await axios.post(
      `http://localhost:8080/api/chats/rooms/${userId}/addRooms`,
      data,
      config
    );
  } catch (error) {
    throw error;
  }
};

const fetchRooms = async (userId, authToken) => {
  const config = {
    headers: {
      authorization: `Bearer ${authToken}`,
    },
  };

  try {
    const response = await axios.get(
      `http://localhost:8080/api/chats/rooms/${userId}/getRooms`,
      config
    );
    const rooms = response.data.data;
    if (rooms) {
      return rooms;
    }
  } catch (error) {
    throw error;
  }
};

const fetchMessages = async (
  messageRoomId,
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

    const response = await axios.get(
      `http://localhost:8080/api/chats/messages/${messageRoomId}/fetchMessages/${sortOrder}`,
      config
    );
    const messages = response.data.data;
    if (messages) {
      return messages;
    }
  } catch (error) {
    throw error;
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
    throw error;
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
  } catch (error) {
    throw error;
  }
};

const getRecentMessage = async (messageRoomId, sortOrder, authToken) => {
  const config = {
    headers: {
      authorization: `Bearer ${authToken}`,
    },
  };

  try {
    if (!messageRoomId) return;

    const response = await axios.get(
      `http://localhost:8080/api/chats/messages/${messageRoomId}/fetchMessages/${sortOrder}`,
      config
    );
    const messages = response.data.data;
    if (messages) {
      return messages[0];
    }
  } catch (error) {
    throw error;
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
    throw error;
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
