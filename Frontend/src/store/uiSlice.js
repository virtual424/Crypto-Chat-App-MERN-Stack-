import { createSlice } from "@reduxjs/toolkit";

const uiInitialState = { type: null, title: null, message: null };

const uiSlice = createSlice({
  name: "ui",
  initialState: uiInitialState,
  reducers: {
    showDialog(state, action) {
      state.type = action.payload.type;
      state.title = action.payload.title;
      state.message = action.payload.message;
    },
  },
});

export default uiSlice;
export const uiActions = uiSlice.actions;
