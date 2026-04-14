import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "../features/counter/counterslice";
import UserReducer from "@/lib/features/user/userSlice";
import UserDetailReducer from "@/lib/features/user/profileDetail";

export const makeStore = () =>
  configureStore({
    reducer: {
      counter: counterReducer,
      user: UserReducer,
      details: UserDetailReducer,
    },
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
