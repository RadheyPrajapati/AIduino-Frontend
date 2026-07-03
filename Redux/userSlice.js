import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isLoggedIn : false
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
   
    setUser: (state, action) => {
      state.isLoggedIn = action.payload.isLoggedIn;
    },
  }
});


export const { setUser } = userSlice.actions;

export default userSlice.reducer;
