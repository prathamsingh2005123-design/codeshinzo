// Filename: Frontend/src/store/store.js
import {configureStore} from '@reduxjs/toolkit';
import authReducer from '../authslice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
    },
});