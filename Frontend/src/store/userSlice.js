import { createSlice } from "@reduxjs/toolkit";

const userInitialState = {
  token: null,
  userId: null,
  userName: null,
  profileUrl: null,
  privateKey: null,
  publicKeys: [],
  sharedKey: null,
};

const userSlice = createSlice({
  name: "user",
  initialState: userInitialState,
  reducers: {
    setUser(state, action) {
      state.token = action.payload.token;
      state.userId = action.payload.userId;
      state.userName = action.payload.userName;
      state.profileUrl = action.payload.profileUrl;
      state.privateKey = action.payload.privateKey;
    },
    setKeys(state, action) {
      state.publicKeys = action.payload.publicKeys;
    },
    setSharedKey(state, action) {
      state.sharedKey = action.payload.sharedKey;
    },
  },
});

export default userSlice;
export const userActions = userSlice.actions;
