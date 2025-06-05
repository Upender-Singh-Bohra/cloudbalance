import axios from "axios";

const API_URL = "http://localhost:8080/api/";

// axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("sessionToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth service methods
const authService = {
  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    return response.data.data;
  },

  logout: async (token) => {
    return await api.post(
      "/auth/logout",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },
  getCurrentUser: async () => {
    const response = await api.get("/users/me");
    return response.data.data;
  },

  impersonateUser: async (targetUserId) => {
    try {
      const response = await api.post("/users/impersonate", { targetUserId });
      return response.data;
    } catch (error) {
      console.error("Error impersonating user:", error);
      throw error;
    }
  },

  revertImpersonation: async () => {
    try {
      // Use the axios instance that already has the auth interceptor
      const response = await api.post("/users/revert-impersonation");
      return response.data;
    } catch (error) {
      console.error("Error reverting impersonation:", error);
      throw error;
    }
  },
};

export const forgotPassword = async (email) => {
  try {
    const response = await fetch(`${API_URL}auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    return await response.json();
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    throw error;
  }
};

export const validateResetToken = async (token) => {
  try {
    const response = await fetch(
      `${API_URL}auth/validate-reset-token?token=${token}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return await response.json();
  } catch (error) {
    console.error("Error in validateResetToken:", error);
    throw error;
  }
};

export const resetPassword = async (token, newPassword) => {
  try {
    const response = await fetch(`${API_URL}auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, newPassword }),
    });

    return await response.json();
  } catch (error) {
    console.error("Error in resetPassword:", error);
    throw error;
  }
};

// const impersonateUser = async (targetUserId, sessionToken) => {
//   try {
//     const response = await fetch(`${API_URL}/users/impersonate`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: sessionToken,
//       },
//       body: JSON.stringify({ targetUserId }),
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       throw new Error(data.message || "Failed to impersonate user");
//     }

//     return data; // ApiResponseDto with success, message, and data
//   } catch (error) {
//     console.error("Error impersonating user:", error);
//     throw error;
//   }
// };

// const revertImpersonation = async (sessionToken) => {
//   try {
//     const response = await fetch("/api/users/revert-impersonation", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: sessionToken,
//       },
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       throw new Error(data.message || "Failed to revert impersonation");
//     }

//     return data; // ApiResponseDto with success, message, and data
//   } catch (error) {
//     console.error("Error reverting impersonation:", error);
//     throw error;
//   }
// };

export default authService;

export { api };
