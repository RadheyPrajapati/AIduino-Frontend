import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  title: "",
  code: "",
  sketchId: ""
};

const sketchSlice = createSlice({
  name: "sketch",
  initialState,
  reducers: {
   
    setSketch: (state, action) => {
      state.title = action.payload.title;
      state.code = action.payload.code;
      state.sketchId = action.payload.sketchId;
    },
  }
});


export const { setSketch } = sketchSlice.actions;

export default sketchSlice.reducer;
