
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // Uses localStorage by default
import userSlice from "./slice/userSlice";
import showAddModel from "./slice/showAddModel";

// Combine all reducers
const rootReducer = combineReducers({
  user:userSlice,
  showAddModel:showAddModel
});
// Persist configuration
const persistConfig = {
    key: "root",
    storage,
    whitelist: ["user"], // Persist user and showNoti only
};

// Apply persist reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);
// Create Redux store
export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false, // Required for Redux Persist
        }),
});

// Create Persistor
export const persistor = persistStore(store);
