import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  fullname: {
    firstname: "",
    lastname: "",
  },
  phone: "",
  email: "",
  isAuthenticated: false,
  isOtpSent: false,
  location: {
    latitude: "",
    longitude: "",
    address: {
      userLocation: "",
      destination: "",
    },
  },
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.fullname.firstname = action.payload.fullname.firstname;
      state.fullname.lastname = action.payload.fullname.lastname;
      state.phone = action.payload.phone;
      state.email = action.payload.email;
      state.isAuthenticated = action.payload.isAuthenticated;
    },
    signupSuccess: (state, action) => {
      state.isOtpSent = action.payload.isOtpSent;
    },
    getLocation: (state, action) => {
      state.location.latitude = action.payload.location.latitude;
      state.location.longitude = action.payload.location.longitude;
      state.location.address.userLocation =
        action.payload.location.address.userLocation;
      state.location.address.destination =
        action.payload.location.address.destination;
    },
  },
});

export const { loginSuccess, signupSuccess, getLocation } = userSlice.actions;

export default userSlice.reducer;
