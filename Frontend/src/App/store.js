// import { createStore, applyMiddleware } from 'redux';
// import thunk from 'redux-thunk';
// import rootReducer from './reducers';

// const initialState = {};

// const middleware = [thunk];

// const store = createStore(
//     rootReducer,
//     initialState,
//     applyMiddleware(...middleware)
// );

// export default store;
//-------------------
import { configureStore } from "@reduxjs/toolkit";
import userSlice from "../features/profile/userSlice";
import captainSlice from "../features/profile/captainSlice";
export const store = configureStore({
  reducer: {
    user: userSlice,
    captain: captainSlice,
  },
});
//------------------
// import { configureStore } from "@reduxjs/toolkit";
// import { persistStore, persistReducer } from "redux-persist";
// import { combineReducers } from "@reduxjs/toolkit";
// import sessionStorage from "redux-persist/es/storage/session";
// import userSlice from "../features/profile/userSlice";
// import captainSlice from "../features/profile/captainSlice";
// // combine reducer
// const rootReducer = combineReducers({
//   user: userSlice,
//   captain: captainSlice,
// });
// // persist state
// const persistConfig = {
//   key: "root",
//   storage: sessionStorage, //
// };

// const persistedReducer = persistReducer(persistConfig, rootReducer);

// export const store = configureStore({
//   reducer: {
//     user: persistedReducer,
//     cpatain: persistedReducer,
//   },
// });

// export const persistor = persistStore(store);
