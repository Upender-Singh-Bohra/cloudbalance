import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "../../services/authService.js";

// Check if user is already logged in
const sessionToken = localStorage.getItem("sessionToken");
const user = localStorage.getItem("user")
  ? JSON.parse(localStorage.getItem("user"))
  : null;
const isAuthenticated = !!sessionToken;
const isImpersonating = isAuthenticated
  ? localStorage.getItem("isImpersonating") === "true"
  : false;
const originalAdminSessionToken = isImpersonating
  ? localStorage.getItem("originalAdminSessionToken")
  : null;

const initialState = {
  user: localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null,
  sessionToken: sessionToken,
  isAuthenticated: isAuthenticated,
  isLoading: false,
  error: null,
  isImpersonating: isImpersonating,
  originalAdminSessionToken: originalAdminSessionToken,
};

// Async thunk for login
export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

// Async thunk for logout
export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue, getState }) => {
    const { sessionToken } = getState().auth;
    try {
      await authService.logout(sessionToken);
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Logout failed");
    }
  }
);

// export const impersonateUser = createAsyncThunk(
//   "auth/impersonateUser",
//   async (targetUserId, { rejectWithValue, getState }) => {
//     try {
//       const { sessionToken } = getState().auth;
//       const response = await authService.impersonateUser(
//         targetUserId,
//         sessionToken
//       );

//       // Use your ApiResponseDto structure
//       if (response.success) {
//         return response.data;
//       } else {
//         return rejectWithValue(
//           response.message || "Failed to impersonate user"
//         );
//       }
//     } catch (error) {
//       return rejectWithValue(error.message || "Failed to impersonate user");
//     }
//   }
// );
export const impersonateUser = createAsyncThunk(
  "auth/impersonateUser",
  async (targetUserId, { rejectWithValue, getState }) => {
    try {
      // Don't pass sessionToken here since axios interceptor will handle it
      const response = await authService.impersonateUser(targetUserId);

      // Debug log
      console.log("Impersonation response:", response);

      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(
          response.message || "Failed to impersonate user"
        );
      }
    } catch (error) {
      console.error("Impersonation error:", error);
      return rejectWithValue(error.message || "Failed to impersonate user");
    }
  }
);

export const revertImpersonation = createAsyncThunk(
  "auth/revertImpersonation",
  async (_, { rejectWithValue, getState }) => {
    try {
      const { sessionToken } = getState().auth;
      const response = await authService.revertImpersonation(sessionToken);

      // Use your ApiResponseDto structure
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(
          response.message || "Failed to revert impersonation"
        );
      }
    } catch (error) {
      return rejectWithValue(error.message || "Failed to revert impersonation");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = {
          id: action.payload.userId,
          username: action.payload.username,
          firstName: action.payload.firstName,
          lastName: action.payload.lastName,
          email: action.payload.email,
          role: action.payload.role,
        };
        state.sessionToken = action.payload.sessionToken;
        state.isImpersonating = false; // Reset on new login
        state.originalAdminSessionToken = null; // Reset on new login

        // Store in localStorage
        localStorage.setItem("sessionToken", action.payload.sessionToken);
        localStorage.setItem("user", JSON.stringify(state.user));
        localStorage.removeItem("isImpersonating"); // Remove impersonation flags
        localStorage.removeItem("originalAdminSessionToken");
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.sessionToken = null;
        state.isImpersonating = false;
        // Remove from localStorage
        localStorage.removeItem("sessionToken");
        localStorage.removeItem("user");
        localStorage.removeItem("isImpersonating");
        localStorage.removeItem("originalAdminSessionToken");
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(impersonateUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(impersonateUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = {
          id: action.payload.userId,
          username: action.payload.username,
          firstName: action.payload.firstName,
          lastName: action.payload.lastName,
          email: action.payload.email,
          role: action.payload.role,
        };
        // Add a flag to indicate impersonation
        state.isImpersonating = true;
        state.originalAdminSessionToken = state.sessionToken; // Store original admin token
        state.sessionToken = action.payload.sessionToken;

        // Update localStorage
        localStorage.setItem("sessionToken", action.payload.sessionToken);
        localStorage.setItem("user", JSON.stringify(state.user));
        localStorage.setItem("isImpersonating", "true");
        localStorage.setItem(
          "originalAdminSessionToken",
          state.originalAdminSessionToken
        );
      })
      .addCase(impersonateUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Handle revertImpersonation states
      .addCase(revertImpersonation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(revertImpersonation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = {
          id: action.payload.userId,
          username: action.payload.username,
          firstName: action.payload.firstName,
          lastName: action.payload.lastName,
          email: action.payload.email,
          role: action.payload.role,
        };
        state.isImpersonating = false;
        state.originalAdminSessionToken = null;
        state.sessionToken = action.payload.sessionToken;

        // Update localStorage
        localStorage.setItem("sessionToken", action.payload.sessionToken);
        localStorage.setItem("user", JSON.stringify(state.user));
        localStorage.removeItem("isImpersonating");
        localStorage.removeItem("originalAdminSessionToken");
      })
      .addCase(revertImpersonation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
