import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null, // { username, roles: ['USER'|'ADMIN'] }
  token: null,
  customerId: null, // globally store customerId after customer creation
  reservationId: null, // globally store reservationId after reservation creation
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    loginSuccess(state, action) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.customerId = null; // reset customerId on login
      state.reservationId = null; // reset reservationId on login
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.customerId = null;
      state.reservationId = null;
    },
    setCustomerId(state, action) {
      state.customerId = action.payload;
    },
    setReservationId(state, action) {
      state.reservationId = action.payload;
    },
  },
});

export const { loginSuccess, logout, setCustomerId, setReservationId } = userSlice.actions;
export default userSlice.reducer;
