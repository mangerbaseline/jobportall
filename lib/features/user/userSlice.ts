import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@/types";

const initialState: User = {
  id: "",
  name: "",
  role: "",
  loading: true,
  avatar: "",
};

export const UserSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.id = action.payload.id;
      state.name = action.payload.name;
      state.role = action.payload.role;
      state.avatar = action.payload.avatar;
      state.loading = false;
    },
    clearUser: (state) => {
      state.id = "";
      state.name = "";
      state.role = "";
      state.loading = false;
    },
    setLoading: (state) => {
      state.loading = true;
    },
  },
});

export const { setUser, clearUser, setLoading } = UserSlice.actions;
export default UserSlice.reducer;
