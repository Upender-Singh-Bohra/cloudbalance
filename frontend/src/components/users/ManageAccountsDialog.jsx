

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Grid,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  TextField,
  InputAdornment,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  FormControlLabel,
} from "@mui/material";
import {
  Search as SearchIcon,
  ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon,
  Refresh as RefreshIcon,
  FolderOpen as FolderIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import userService from "../../services/userService";
import cloudAccountService from "../../services/cloudAccountService";

const ManageAccountsDialog = ({ open, onClose, user, onAccountsUpdated }) => {
  const [availableAccounts, setAvailableAccounts] = useState([]);
  const [assignedAccounts, setAssignedAccounts] = useState([]);
  const [selectedAvailable, setSelectedAvailable] = useState([]);
  const [selectedAssigned, setSelectedAssigned] = useState([]);
  const [searchAvailable, setSearchAvailable] = useState("");
  const [searchAssigned, setSearchAssigned] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if user has admin or read-only role
  const isAdminOrReadOnly =
    user?.roleName === "ROLE_ADMIN" || user?.roleName === "ROLE_READ_ONLY";

  useEffect(() => {
    if (open && user) {
      if (isAdminOrReadOnly) {
        // Clear any existing errors for admin/readonly users
        setError(null);
      } else {
        // Only fetch account data for customer role
        fetchData();
      }
    }
  }, [open, user, isAdminOrReadOnly]);

  const fetchData = async () => {
    if (!user || !user.id) return;

    setLoading(true);
    try {
      // Fetch data one by one with more detailed error handling
      let allAccounts = [];
      let userDetails = null;

      try {
        console.log("Fetching all cloud accounts...");
        const accountsResponse =
          await cloudAccountService.getAllCloudAccounts();
        console.log("Cloud accounts response:", accountsResponse);
        allAccounts = accountsResponse || [];
      } catch (accountErr) {
        console.error("Error fetching all cloud accounts:", accountErr);
        setError(
          `Failed to fetch cloud accounts: ${
            accountErr.message || "Unknown error"
          }`
        );
        // Continue with empty accounts array
      }

      try {
        console.log("Fetching user details for ID:", user.id);
        userDetails = await userService.getUserById(user.id);
        console.log("User details response:", userDetails);
      } catch (userErr) {
        console.error("Error fetching user details:", userErr);
        setError(
          `Failed to fetch user details: ${userErr.message || "Unknown error"}`
        );
        // Continue with null user details
      }

      // Set assigned accounts from user details
      const userAssignedAccounts = userDetails?.assignedAccounts || [];
      setAssignedAccounts(userAssignedAccounts);

      // Filter out assigned accounts from available accounts
      const assignedIds = userAssignedAccounts.map((acc) => acc.id);
      const available = allAccounts.filter(
        (acc) => !assignedIds.includes(acc.id)
      );
      setAvailableAccounts(available);

      if (allAccounts.length === 0) {
        console.log("No accounts found, using mock data for testing");
        // Mock data for testing UI
        const mockAccounts = [
          {
            id: 1,
            accountId: "123456789012",
            accountName: "Test Account 1",
            provider: "AWS",
            region: "us-east-1",
          },
          {
            id: 2,
            accountId: "234567890123",
            accountName: "Test Account 2",
            provider: "AWS",
            region: "us-west-2",
          },
          {
            id: 3,
            accountId: "345678901234",
            accountName: "Test Account 3",
            provider: "AWS",
            region: "eu-west-1",
          },
        ];

        // Only use mock data if there's also no assigned accounts
        if (userAssignedAccounts.length === 0) {
          setAvailableAccounts(mockAccounts);
          setError("Using mock data for testing - API call failed");
        } else {
          setError("No available cloud accounts found.");
        }
      } else {
        setError(null);
      }
    } catch (err) {
      setError(
        `Failed to process account data: ${err.message || "Unknown error"}`
      );
      console.error("Error in fetchData:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAllAvailable = (event) => {
    if (event.target.checked) {
      setSelectedAvailable(filteredAvailableAccounts.map((acc) => acc.id));
    } else {
      setSelectedAvailable([]);
    }
  };

  const handleSelectAllAssigned = (event) => {
    if (event.target.checked) {
      setSelectedAssigned(filteredAssignedAccounts.map((acc) => acc.id));
    } else {
      setSelectedAssigned([]);
    }
  };

  const handleToggleAvailable = (id) => {
    const currentIndex = selectedAvailable.indexOf(id);
    const newSelected = [...selectedAvailable];

    if (currentIndex === -1) {
      newSelected.push(id);
    } else {
      newSelected.splice(currentIndex, 1);
    }

    setSelectedAvailable(newSelected);
  };

  const handleToggleAssigned = (id) => {
    const currentIndex = selectedAssigned.indexOf(id);
    const newSelected = [...selectedAssigned];

    if (currentIndex === -1) {
      newSelected.push(id);
    } else {
      newSelected.splice(currentIndex, 1);
    }

    setSelectedAssigned(newSelected);
  };

  const handleAssignAccounts = async () => {
    if (selectedAvailable.length === 0) return;

    setLoading(true);
    try {
      console.log("Attempting to assign accounts:", selectedAvailable);

      // In case the API call fails, let's try to handle the UI update directly
      // Store current state for potential rollback
      const previousAvailable = [...availableAccounts];
      const previousAssigned = [...assignedAccounts];

      // Update UI optimistically
      const accountsToMove = availableAccounts.filter((acc) =>
        selectedAvailable.includes(acc.id)
      );
      setAssignedAccounts([...assignedAccounts, ...accountsToMove]);
      setAvailableAccounts(
        availableAccounts.filter((acc) => !selectedAvailable.includes(acc.id))
      );
      setSelectedAvailable([]);

      try {
        // Now make the actual API call
        await userService.assignAccountsToUser(user.id, selectedAvailable);
        console.log("Accounts assigned successfully via API");
        setError(null);
      } catch (apiErr) {
        console.error("API error when assigning accounts:", apiErr);
        console.log("Error response details:", apiErr.response?.data);

        // Rollback UI state
        setAvailableAccounts(previousAvailable);
        setAssignedAccounts(previousAssigned);

        setError(
          `API error: ${
            apiErr.response?.data?.message || apiErr.message || "Unknown error"
          }`
        );
      }
    } catch (err) {
      setError(`Failed to assign accounts: ${err.message || "Unknown error"}`);
      console.error("Error in handleAssignAccounts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAccounts = async () => {
    if (selectedAssigned.length === 0) return;

    setLoading(true);
    try {
      await userService.removeAccountsFromUser(user.id, selectedAssigned);

      // Update local state
      const accountsToMove = assignedAccounts.filter((acc) =>
        selectedAssigned.includes(acc.id)
      );
      setAvailableAccounts([...availableAccounts, ...accountsToMove]);
      setAssignedAccounts(
        assignedAccounts.filter((acc) => !selectedAssigned.includes(acc.id))
      );
      setSelectedAssigned([]);

      setError(null);
    } catch (err) {
      setError("Failed to remove accounts. Please try again.");
      console.error("Error removing accounts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchAvailableChange = (event) => {
    setSearchAvailable(event.target.value);
  };

  const handleSearchAssignedChange = (event) => {
    setSearchAssigned(event.target.value);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Get all assigned account IDs
      const accountIds = assignedAccounts.map((acc) => acc.id);

      console.log("DEBUG: Saving assigned accounts:", accountIds);
      console.log("DEBUG: Current user:", user);

      // Log what the assignment should look like
      const originalAssignedIds = (user.assignedAccounts || []).map(
        (acc) => acc.id
      );
      console.log("DEBUG: Original assigned IDs:", originalAssignedIds);
      console.log("DEBUG: New assigned IDs:", accountIds);

      // Add a confirmation dialog for checking console
      if (
        window.confirm(
          "About to save account assignments. Check the console for debugging info and click OK to proceed."
        )
      ) {
        try {
          await userService.assignAccountsToUser(user.id, accountIds);
          console.log("DEBUG: Accounts saved successfully");
          setError(null);
          alert("Account assignment was successful!");

          if (onAccountsUpdated) {
            onAccountsUpdated();
          }
        } catch (apiErr) {
          console.error("DEBUG: API error when saving accounts:", apiErr);
          setError(`API error: ${apiErr.message || "Unknown error"}`);
          alert(`Error: ${apiErr.message || "Unknown error"}`);
        }
      }
    } catch (err) {
      setError(
        `Failed to save account assignments: ${err.message || "Unknown error"}`
      );
      console.error("DEBUG: Error in handleSave:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter accounts based on search query
  const filteredAvailableAccounts = availableAccounts.filter(
    (acc) =>
      acc.accountName?.toLowerCase().includes(searchAvailable.toLowerCase()) ||
      acc.accountId?.toLowerCase().includes(searchAvailable.toLowerCase()) ||
      acc.provider?.toLowerCase().includes(searchAvailable.toLowerCase())
  );

  const filteredAssignedAccounts = assignedAccounts.filter(
    (acc) =>
      acc.accountName?.toLowerCase().includes(searchAssigned.toLowerCase()) ||
      acc.accountId?.toLowerCase().includes(searchAssigned.toLowerCase()) ||
      acc.provider?.toLowerCase().includes(searchAssigned.toLowerCase())
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="manage-accounts-dialog-title"
    >
      <DialogTitle id="manage-accounts-dialog-title">
        Manage Account -{" "}
        <strong>
          {user?.firstName} {user?.lastName}
        </strong>
      </DialogTitle>

      <DialogContent>
        {isAdminOrReadOnly ? (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="h6" gutterBottom>
              This user has{" "}
              {user?.roleName === "ROLE_ADMIN" ? "Admin" : "Read-Only"} role
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Users with Admin or Read-Only roles automatically have access to
              all cloud accounts. No manual account assignment is necessary.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <InfoIcon
                color="primary"
                sx={{ fontSize: 48, opacity: 0.7, mb: 2 }}
              />
            </Box>
          </Box>
        ) : (
          <>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box sx={{ mb: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Typography variant="h6">Manage Account Id(s)</Typography>
                <Button startIcon={<RefreshIcon />} onClick={fetchData}>
                  Reset
                </Button>
              </Box>
            </Box>

            <Grid container spacing={2}>
              {/* Available Accounts */}
              <Grid item xs={12} md={6}>
                <Paper
                  variant="outlined"
                  sx={{ height: 400, display: "flex", flexDirection: "column" }}
                >
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "background.default",
                      borderBottom: 1,
                      borderColor: "divider",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="subtitle1">
                        Choose Account IDs to Associate
                      </Typography>
                      <Typography variant="caption" color="primary">
                        {filteredAvailableAccounts.length} Available
                      </Typography>
                    </Box>
                    <TextField
                      placeholder="Search"
                      variant="outlined"
                      size="small"
                      fullWidth
                      sx={{ mt: 1 }}
                      value={searchAvailable}
                      onChange={handleSearchAvailableChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>

                  <Box sx={{ borderBottom: 1, borderColor: "divider", p: 1 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={
                            filteredAvailableAccounts.length > 0 &&
                            selectedAvailable.length ===
                              filteredAvailableAccounts.length
                          }
                          indeterminate={
                            selectedAvailable.length > 0 &&
                            selectedAvailable.length <
                              filteredAvailableAccounts.length
                          }
                          onChange={handleSelectAllAvailable}
                        />
                      }
                      label="Select All"
                    />
                  </Box>

                  {loading ? (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        flexGrow: 1,
                      }}
                    >
                      <CircularProgress />
                    </Box>
                  ) : (
                    <List sx={{ overflow: "auto", flexGrow: 1 }}>
                      {filteredAvailableAccounts.length === 0 ? (
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "100%",
                            p: 2,
                          }}
                        >
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            align="center"
                          >
                            No available accounts found
                          </Typography>
                        </Box>
                      ) : (
                        filteredAvailableAccounts.map((account) => (
                          <ListItem
                            key={account.id}
                            dense
                            button
                            onClick={() => handleToggleAvailable(account.id)}
                          >
                            <Checkbox
                              edge="start"
                              checked={
                                selectedAvailable.indexOf(account.id) !== -1
                              }
                              tabIndex={-1}
                              disableRipple
                            />
                            <ListItemText
                              primary={`${account.accountName} (${account.accountId})`}
                              secondary={account.provider}
                            />
                          </ListItem>
                        ))
                      )}
                    </List>
                  )}
                </Paper>
              </Grid>

              {/* Assign/Remove Buttons */}
              <Grid
                item
                xs={12}
                md="auto"
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Button
                  variant="outlined"
                  disabled={selectedAvailable.length === 0 || loading}
                  onClick={handleAssignAccounts}
                  sx={{ mb: 1 }}
                >
                  <ChevronRightIcon />
                </Button>
                <Button
                  variant="outlined"
                  disabled={selectedAssigned.length === 0 || loading}
                  onClick={handleRemoveAccounts}
                >
                  <ChevronLeftIcon />
                </Button>
              </Grid>

              {/* Assigned Accounts */}
              <Grid item xs={12} md={5}>
                <Paper
                  variant="outlined"
                  sx={{ height: 400, display: "flex", flexDirection: "column" }}
                >
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "background.default",
                      borderBottom: 1,
                      borderColor: "divider",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="subtitle1">
                        Associated Account IDs
                      </Typography>
                      <Typography variant="caption" color="primary">
                        {filteredAssignedAccounts.length} Added
                      </Typography>
                    </Box>
                    <TextField
                      placeholder="Search"
                      variant="outlined"
                      size="small"
                      fullWidth
                      sx={{ mt: 1 }}
                      value={searchAssigned}
                      onChange={handleSearchAssignedChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>

                  <Box sx={{ borderBottom: 1, borderColor: "divider", p: 1 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={
                            filteredAssignedAccounts.length > 0 &&
                            selectedAssigned.length ===
                              filteredAssignedAccounts.length
                          }
                          indeterminate={
                            selectedAssigned.length > 0 &&
                            selectedAssigned.length <
                              filteredAssignedAccounts.length
                          }
                          onChange={handleSelectAllAssigned}
                        />
                      }
                      label="Select All"
                    />
                  </Box>

                  {loading ? (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        flexGrow: 1,
                      }}
                    >
                      <CircularProgress />
                    </Box>
                  ) : (
                    <List sx={{ overflow: "auto", flexGrow: 1 }}>
                      {filteredAssignedAccounts.length === 0 ? (
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "100%",
                            p: 3,
                          }}
                        >
                          <FolderIcon
                            sx={{ fontSize: 40, color: "primary.main", mb: 1 }}
                          />
                          <Typography
                            variant="body1"
                            color="textSecondary"
                            align="center"
                            gutterBottom
                          >
                            No Account IDs Added
                          </Typography>
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            align="center"
                          >
                            Selected Account IDs will be shown here.
                          </Typography>
                        </Box>
                      ) : (
                        filteredAssignedAccounts.map((account) => (
                          <ListItem
                            key={account.id}
                            dense
                            button
                            onClick={() => handleToggleAssigned(account.id)}
                          >
                            <Checkbox
                              edge="start"
                              checked={
                                selectedAssigned.indexOf(account.id) !== -1
                              }
                              tabIndex={-1}
                              disableRipple
                            />
                            <ListItemText
                              primary={`${account.accountName} (${account.accountId})`}
                              secondary={account.provider}
                            />
                          </ListItem>
                        ))
                      )}
                    </List>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          OK
        </Button>
        {!isAdminOrReadOnly && (
          <Button
            onClick={handleSave}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            Save
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ManageAccountsDialog;
