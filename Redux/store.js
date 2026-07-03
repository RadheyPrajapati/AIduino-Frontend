import { configureStore } from '@reduxjs/toolkit';
import codeReducer from './codeSlice';
import sketchReducer from './sketchSlice';
import userReducer from './userSlice';

export const store = configureStore({
  reducer: {
    code: codeReducer,
    sketch: sketchReducer,
    user: userReducer
  },
});
