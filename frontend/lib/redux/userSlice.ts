import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserData {
  _id?: string;
  name?: string;
  email?: string;
  [key: string]: any;
}

interface UserState {
  userData: UserData | null;
}

const initialState: UserState = {
  userData: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserData: (state, action: PayloadAction<UserData | null>) => {
      state.userData = action.payload;
    },
  },
});

export const { setUserData } = userSlice.actions;
export default userSlice.reducer;
