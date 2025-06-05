import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  impersonateUser,
  revertImpersonation,
} from "../../store/slices/authSlice";
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  Avatar,
  Box,
} from "@mui/material";
import {
  AccountCircle,
  ArrowBack,
  People,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import userService from "../../services/userService";

const SwitchUserMenu = ({ onLogout }) => {
  const dispatch = useDispatch();
  const { user, isImpersonating } = useSelector((state) => state.auth);
  const [anchorEl, setAnchorEl] = useState(null);
  const [userListOpen, setUserListOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOpenUserList = () => {
    handleMenuClose();
    setUserListOpen(true);
    fetchUsers();
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Fetching users...");
      const response = await userService.getAllUsers();

      console.log("Raw API response:", response);

      // Check the response structure
      let usersArray = [];
      if (response.data) {
        usersArray = response.data;
      } else if (Array.isArray(response)) {
        usersArray = response;
      } else {
        console.error("Unexpected API response structure:", response);
        setError("Invalid API response format");
        usersArray = [];
      }

      console.log("Users array:", usersArray);

      // Filter only customer users
      const customerUsers = usersArray.filter(
        (user) => user && user.roleName === "ROLE_CUSTOMER"
      );

      console.log("Filtered customer users:", customerUsers);
      setUsers(customerUsers);

      if (customerUsers.length === 0) {
        console.log("No customer users found in response");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to load users: " + (error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  //   const handleUserSelect = (targetUserId) => {
  //     console.log('Selecting user ID:', targetUserId);
  //     dispatch(impersonateUser(targetUserId))
  //       .unwrap()
  //       .then(() => {
  //         setUserListOpen(false);
  //         console.log('Impersonation successful');
  //       })
  //       .catch(error => {
  //         console.error('Failed to impersonate user:', error);
  //         setError('Failed to impersonate user: ' + (error.message || 'Unknown error'));
  //       });
  //   };
  const handleUserSelect = (targetUserId) => {
    console.log("Selecting user ID:", targetUserId);

    // Check if the action is defined
    if (typeof impersonateUser !== "function") {
      console.error("impersonateUser is not a function!", impersonateUser);
      setError("Switch user functionality is not properly configured");
      return;
    }

    dispatch(impersonateUser(targetUserId))
      .unwrap()
      .then(() => {
        setUserListOpen(false);
        console.log("Impersonation successful");
      })
      .catch((error) => {
        console.error("Failed to impersonate user:", error);
        setError(
          "Failed to impersonate user: " + (error.message || "Unknown error")
        );
      });
  };

  const handleRevertImpersonation = () => {
    dispatch(revertImpersonation())
      .unwrap()
      .then(() => {
        handleMenuClose();
        console.log("Reverted impersonation successfully");
      })
      .catch((error) => {
        console.error("Failed to revert impersonation:", error);
        setError(
          "Failed to revert impersonation: " +
            (error.message || "Unknown error")
        );
      });
  };

  // Check if user is admin - handle both role and roleName
  const userRole = user && (user.roleName || user.role);
  const isAdmin = userRole === "ROLE_ADMIN" || userRole === "ADMIN";

  console.log("Current user:", user);
  console.log("Is admin?", isAdmin);
  console.log("Is impersonating?", isImpersonating);

  return (
    <>
      {/* Menu Button */}
      <IconButton color="inherit" onClick={handleMenuOpen} edge="end">
        <AccountCircle />
      </IconButton>

      {/* User Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem disabled>
          <Typography variant="body2">
            {user ? `${user.firstName || ""} ${user.lastName || ""}` : ""}
          </Typography>
        </MenuItem>
        <MenuItem disabled>
          <Typography variant="caption" color="textSecondary">
            {userRole ? userRole.replace("ROLE_", "") : ""}
          </Typography>
        </MenuItem>

        <Divider />

        {isImpersonating && (
          <MenuItem onClick={handleRevertImpersonation}>
            <ListItemIcon>
              <ArrowBack fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Return to Admin" />
          </MenuItem>
        )}

        {isAdmin && !isImpersonating && (
          <MenuItem onClick={handleOpenUserList}>
            <ListItemIcon>
              <People fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Switch User" />
          </MenuItem>
        )}

        <MenuItem onClick={onLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </MenuItem>
      </Menu>

      {/* User List Dialog */}
      <Dialog
        open={userListOpen}
        onClose={() => setUserListOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Switch to User</DialogTitle>
        <DialogContent>
          {loading && <Typography>Loading users...</Typography>}

          {error && <Typography color="error">{error}</Typography>}

          {!loading && !error && (
            <List>
              {users.length > 0 ? (
                users.map((user) => (
                  <ListItem
                    button
                    key={user.id}
                    onClick={() => handleUserSelect(user.id)}
                  >
                    <ListItemIcon>
                      <Avatar>
                        {user.firstName ? user.firstName.charAt(0) : "?"}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={`${user.firstName || ""} ${user.lastName || ""}`}
                      secondary={user.email || ""}
                    />
                  </ListItem>
                ))
              ) : (
                <Box py={2}>
                  <Typography color="textSecondary" align="center">
                    No customer users found
                  </Typography>
                </Box>
              )}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserListOpen(false)} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SwitchUserMenu;
