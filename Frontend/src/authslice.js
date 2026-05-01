import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosClient from "./utils/axiosClient";

/* =========================
   🔥 REGISTER
========================= */
export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post("/user/register", userData);

      // ✅ SAVE TOKEN
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        "Registration failed"
      );
    }
  }
);

/* =========================
   🔥 LOGIN
========================= */
export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post("/user/login", credentials);

      // ✅ SAVE TOKEN (MAIN FIX)
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        "Login failed"
      );
    }
  }
);

/* =========================
   🔥 CHECK AUTH
========================= */
export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get("/user/check-auth");
      return response.data;
    } catch (error) {
      return rejectWithValue(null);
    }
  }
);

/* =========================
   🔥 LOGOUT
========================= */
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await axiosClient.post("/user/logout");
      return null;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        "Logout failed"
      );
    }
  }
);

/* =========================
   🔥 SLICE
========================= */
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: true,
    error: null,
  },

  reducers: {
    setUser: (state, action) => {
      state.user = action.payload?.user || action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },

    logoutLocal: (state) => {
      localStorage.removeItem("token"); // ✅ IMPORTANT
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      /* ---------- REGISTER ---------- */
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        const userData = action.payload?.user || action.payload?.reply;
        state.user = userData;
        state.isAuthenticated = !!userData;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })

      /* ---------- LOGIN ---------- */
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        const userData = action.payload?.user || action.payload?.reply;
        state.user = userData;
        state.isAuthenticated = !!userData;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })

      /* ---------- CHECK AUTH ---------- */
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        const userData = action.payload?.reply || action.payload?.user;

        if (userData && userData._id) {
          state.user = userData;
          state.isAuthenticated = true;
        } else {
          state.user = null;
          state.isAuthenticated = false;
        }
      })
      .addCase(checkAuth.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
      })

      /* ---------- LOGOUT ---------- */
      .addCase(logoutUser.fulfilled, (state) => {
        localStorage.removeItem("token"); // ✅ IMPORTANT
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        localStorage.removeItem("token");
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
      });
  },
});

export const { setUser, logoutLocal } = authSlice.actions;
export default authSlice.reducer;