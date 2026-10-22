import { configureStore } from "@reduxjs/toolkit";
import ratingsReducer from "./ratingsSlice";

export const store = configureStore({
  reducer: {
    ratings: ratingsReducer,
  },
});

// Infer the RootState type from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
