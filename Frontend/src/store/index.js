import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./userSlice.js";
import chatSlice from "./chatSlice.js";
import uiSlice from "./uiSlice.js";

const store = configureStore({
  reducer: {
    uiReducer: uiSlice.reducer,
    userReducer: userSlice.reducer,
    chatReducer: chatSlice.reducer,
  },
});

export const chatActions = chatSlice.actions;
export default store;
