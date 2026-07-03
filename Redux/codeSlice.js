import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  value: "",
};

const codeSlice = createSlice({
  name: "code",
  initialState,
  reducers: {
    changeCode: (state, action) => {
      state.value = action.payload; 
    },
  },
});


export const { changeCode } = codeSlice.actions;

export default codeSlice.reducer;
