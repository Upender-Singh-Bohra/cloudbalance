import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import {
  Edit as EditIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  ManageAccounts as ManageAccountsIcon,
} from "@mui/icons-material";
import AddUserDialog from "../components/users/AddUserDialog";
import EditUserDialog from "../components/users/EditUserDialog";
import ManageAccountsDialog from "../components/users/ManageAccountsDialog";
import { useSelector } from "react-redux";
import userService from "../services/userService";
// import { useLoader, LOADER_TYPES } from "../components/loader/LoaderProvider";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  // const { showLoader, hideLoader } = useLoader();
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openManageAccountsDialog, setOpenManageAccountsDialog] =
    useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const { user: currentUser } = useSelector((state) => state.auth);
  const isAdmin = currentUser?.role === "ROLE_ADMIN";

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    // showLoader({
    //   type: LOADER_TYPES.VERTICAL_BARS, // or LOADER_TYPES.CREATIVE
    //   text: "Loading users...",
    // });
    
    setLoading(true);
    try {
      const response = await userService.getAllUsers();
      setUsers(response);
      setError(null);
    } catch (err) {
      setError("Failed to fetch users. Please try again.");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
      // hideLoader();
    }
  };

  const handleOpenAddDialog = () => {
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
  };

  const handleOpenEditDialog = (user) => {
    setSelectedUser(user);
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedUser(null);
  };

  const handleOpenManageAccountsDialog = (user) => {
    setSelectedUser(user);
    setOpenManageAccountsDialog(true);
  };

  const handleCloseManageAccountsDialog = () => {
    setOpenManageAccountsDialog(false);
    setSelectedUser(null);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleUserAdded = () => {
    fetchUsers();
    handleCloseAddDialog();
  };

  const handleUserUpdated = () => {
    fetchUsers();
    handleCloseEditDialog();
  };

  const handleAccountsUpdated = () => {
    fetchUsers();
    handleCloseManageAccountsDialog();
  };

  // Filter users based on search query
  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.roleName
        .toLowerCase()
        .replace("role_", "")
        .includes(searchQuery.toLowerCase())
  );

  const getRoleColor = (role) => {
    switch (role) {
      case "ROLE_ADMIN":
        return "error";
      case "ROLE_READ_ONLY":
        return "info";
      case "ROLE_CUSTOMER":
        return "success";
      default:
        return "default";
    }
  };

  const formatRoleName = (role) => {
    return role.replace("ROLE_", "");
  };

  const renderAccountsAssignment = (user) => {
    if (user.roleName === "ROLE_ADMIN" || user.roleName === "ROLE_READ_ONLY") {
      return (
        <Chip
          label="All Accounts"
          color="primary"
          size="small"
          variant="outlined"
        />
      );
    } else {
      return user.assignedAccounts?.length || 0;
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          User Management
        </Typography>
        <Box>
          {isAdmin && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenAddDialog}
              sx={{ mr: 1 }}
            >
              Add User
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchUsers}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      <Paper sx={{ width: "100%", mb: 3 }}>
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search users..."
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell><strong>Username</strong></TableCell>
                <TableCell><strong>Full Name</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Role</strong></TableCell>
                <TableCell><strong>Assigned Accounts</strong></TableCell>
                <TableCell align="right"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress size={40} />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    align="center"
                    sx={{ color: "error.main" }}
                  >
                    {error}
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={formatRoleName(user.roleName)}
                        color={getRoleColor(user.roleName)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{renderAccountsAssignment(user)}</TableCell>
                    <TableCell align="right">
                      {isAdmin && (
                        <>
                          <Tooltip title="Manage Accounts">
                            <IconButton
                              onClick={() =>
                                handleOpenManageAccountsDialog(user)
                              }
                            >
                              <ManageAccountsIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit User">
                            <IconButton
                              onClick={() => handleOpenEditDialog(user)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add User Dialog */}
      <AddUserDialog
        open={openAddDialog}
        onClose={handleCloseAddDialog}
        onUserAdded={handleUserAdded}
      />

      {/* Edit User Dialog */}
      {selectedUser && (
        <EditUserDialog
          open={openEditDialog}
          onClose={handleCloseEditDialog}
          user={selectedUser}
          onUserUpdated={handleUserUpdated}
        />
      )}

      {/* Manage Accounts Dialog */}
      {selectedUser && (
        <ManageAccountsDialog
          open={openManageAccountsDialog}
          onClose={handleCloseManageAccountsDialog}
          user={selectedUser}
          onAccountsUpdated={handleAccountsUpdated}
        />
      )}
    </Box>
  );
};

export default UserManagement;
