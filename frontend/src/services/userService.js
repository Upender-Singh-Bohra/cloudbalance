
import { api } from "./authService";



const userService = {

  getCurrentUser: async () => {
    try {
      const response = await api.get("/users/me");
      return response.data.data;
    } catch (error) {
      console.error("Error fetching current user:", error);
      throw error;
    }
  },

  
  // Get all users
  getAllUsers: async () => {
    const response = await api.get("/users");
    return response.data.data;
  },

  // Get user by ID
  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data.data;
  },

  // Create a new user
  createUser: async (userData) => {
    const response = await api.post("/users", userData);
    return response.data.data;
  },

  // Update an existing user
  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data.data;
  },

  // Get accessible accounts for a user
  getAccessibleAccounts: async (userId) => {
    try {
      const response = await api.get(`/accounts/user/${userId}/accessible`);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching accessible accounts:", error);
      throw error;
    }
  },

  // Assign cloud accounts to a user - with DEBUG mode
  assignAccountsToUser: async (userId, accountIds) => {
    console.log(`DEBUG: Assigning accounts to user ${userId}:`, accountIds);

    // Check if user is admin or readonly
    try {
      const userDetails = await userService.getUserById(userId);
      if (
        userDetails.roleName === "ROLE_ADMIN" ||
        userDetails.roleName === "ROLE_READ_ONLY"
      ) {
        throw new Error(
          "Admin and Read-Only users automatically have access to all accounts"
        );
      }
    } catch (checkError) {
      // If we can't check the role, proceed with the original attempt
      // The backend will enforce this rule anyway
      console.error("Error checking user role:", checkError);
    }

    // First, let's inspect what's in the API object to make sure our interceptors are working
    console.log("API headers configuration:", api.defaults.headers);

    // Check for API connectivity by making a simple GET request first
    try {
      const testResponse = await api.get(`/users/${userId}`);
      console.log("User GET response:", testResponse);
    } catch (testError) {
      console.error(
        "Cannot even fetch the user, likely auth issue:",
        testError
      );
    }

    // Multiple attempts with different formats and HTTP methods
    const attempts = [
      { method: "post", url: `/users/${userId}/accounts`, data: accountIds },
      {
        method: "post",
        url: `/users/${userId}/accounts`,
        data: { accountIds },
      },
      { method: "put", url: `/users/${userId}`, data: { accountIds } },
      {
        method: "put",
        url: `/users/${userId}`,
        data: { assignedAccounts: accountIds },
      },
    ];

    for (let i = 0; i < attempts.length; i++) {
      const attempt = attempts[i];
      console.log(`DEBUG: Attempt #${i + 1}:`, attempt);
      try {
        const response = await api.request({
          method: attempt.method,
          url: attempt.url,
          data: attempt.data,
        });
        console.log(`DEBUG: Attempt #${i + 1} SUCCESS:`, response);
        return response.data.data;
      } catch (error) {
        console.error(`DEBUG: Attempt #${i + 1} FAILED:`, error);
        console.log("Error response:", error.response?.data);

        // If this is the last attempt, throw the error
        if (i === attempts.length - 1) {
          throw error;
        }
        // Otherwise continue to the next attempt
      }
    }
  },

  // Remove cloud accounts from a user
  removeAccountsFromUser: async (userId, accountIds) => {
    console.log(`Removing accounts from user ${userId}:`, accountIds);

    // Check if user is admin or readonly
    try {
      const userDetails = await userService.getUserById(userId);
      if (
        userDetails.roleName === "ROLE_ADMIN" ||
        userDetails.roleName === "ROLE_READ_ONLY"
      ) {
        throw new Error(
          "Admin and Read-Only users automatically have access to all accounts"
        );
      }
    } catch (checkError) {
      
      console.error("Error checking user role:", checkError);
    }

    try {
      const response = await api.delete(`/users/${userId}/accounts`, {
        data: accountIds,
      });
      console.log("Account removal response:", response);
      return response.data.data;
    } catch (error) {
      console.error("Error removing accounts:", error);
      console.log("Error response:", error.response);
      throw error;
    }
  },
};

export default userService;
