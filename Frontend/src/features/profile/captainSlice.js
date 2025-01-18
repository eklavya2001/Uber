import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  fullname: {
    firstname: "",
    lastname: "",
  },
  email: "",
  phone: "",
  vehicle: {
    vehicleName: "",
    color: "",
    plateNo: "",

    vehicleType: "",
  },

  isAuthenticated: false,
  isOtpSent: false,
};

const captainSlice = createSlice({
  name: "captain",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.fullname.firstname = action.payload.fullname.firstname;
      state.fullname.lastname = action.payload.fullname.lastname;
      state.email = action.payload.email;
      state.phone = action.payload.phone;
      state.vehicle.vehicleName = action.payload.vehicle.vehicleName;
      state.vehicle.color = action.payload.vehicle.color;
      state.vehicle.plateNo = action.payload.vehicle.plateNo;
      state.vehicle.vehicleType = action.payload.vehicle.vehicleType;

      state.isAuthenticated = action.payload.isAuthenticated;
    },
    signupSuccess: (state, action) => {
      state.isOtpSent = action.payload.isOtpSent;
    },
  },
});

export const { loginSuccess, signupSuccess } = captainSlice.actions;

export default captainSlice.reducer;
