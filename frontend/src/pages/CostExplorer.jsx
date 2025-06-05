import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Checkbox,
  ListItemText,
  TextField,
  IconButton,
  Divider,
  CircularProgress,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import RefreshIcon from "@mui/icons-material/Refresh";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { api } from "../services/authService";
import CostBarChart from "../components/cost-explorer/CostBarChart";
import CostLineChart from "../components/cost-explorer/CostLineChart";
import CostTable from "../components/cost-explorer/CostTable";
import FilterPanel from "../components/cost-explorer/FilterPanel";
import { useLoader, LOADER_TYPES } from "../components/loader/LoaderProvider";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const groupByOptions = [
  { value: "Service", label: "Service" },
  { value: "InstanceType", label: "Instance Type" },
  { value: "AccountID", label: "Account ID" },
  { value: "UsageType", label: "Usage Type" },
  { value: "Platform", label: "Platform" },
  { value: "Region", label: "Region" },
  { value: "UsageTypeGroup", label: "Usage Type Group" },
  { value: "PurchaseOption", label: "Purchase Option" },
  { value: "ApiOperation", label: "API Operation" },
  { value: "Resource", label: "Resource" },
  { value: "AvailabilityZone", label: "Availability Zone" },
  { value: "Tenancy", label: "Tenancy" },
  { value: "ChargeType", label: "Charge Type" },
];

const CostExplorer = () => {
  const { showLoader, hideLoader } = useLoader();
  // Get auth state from Redux
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // State for filter options
  const [groupBy, setGroupBy] = useState("Service");
  const [startDate, setStartDate] = useState("2025-04-01");
  const [endDate, setEndDate] = useState("2025-04-30");
  const [accounts, setAccounts] = useState([]);
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // State for filter values
  const [filterValues, setFilterValues] = useState({});
  const [selectedFilters, setSelectedFilters] = useState({
    instanceTypes: [],
    services: [],
    usageTypes: [],
    platforms: [],
    regions: [],
    usageTypeGroups: [],
    purchaseOptions: [],
    apiOperations: [],
    resources: [],
    availabilityZones: [],
    tenancies: [],
    chargeTypes: [],
  });

  // State for chart data
  const [costData, setCostData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await api.get("/cost-explorer/available-accounts");
        const accountList = response.data || [];
        setAccounts(accountList);

        if (accountList.length === 0 && user?.role === "ROLE_CUSTOMER") {
          setError(
            "You don't have access to any accounts. Please contact your administrator."
          );
        }
      } catch (err) {
        console.error("Error fetching accounts:", err);
        setError("Failed to load account data");
      }
    };

    fetchAccounts();
  }, [user]);

  // Fetch filter values
  useEffect(() => {
    const fetchFilterValues = async () => {
      try {
        const fields = [
          "Service",
          "InstanceType",
          "UsageType",
          "Platform",
          "Region",
          "UsageTypeGroup",
          "PurchaseOption",
          "ApiOperation",
          "Resource",
          "AvailabilityZone",
          "Tenancy",
          "ChargeType",
        ];

        const values = {};

        for (const field of fields) {
          const response = await api.get(
            `/cost-explorer/filter-values/${field}`
          );
          values[field] = response.data || [];
        }

        setFilterValues(values);
      } catch (err) {
        console.error("Error fetching filter values:", err);
        setError("Failed to load filter values");
      }
    };

    fetchFilterValues();
  }, []);

  // Load initial data
  useEffect(() => {
    fetchCostData();
  }, []);

  const fetchCostData = async () => {
    showLoader({});
    // setLoading(true);
    setError(null);

    try {
      const filterData = {
        accountIds: selectedAccounts.length > 0 ? selectedAccounts : null,
        groupBy: groupBy,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        services:
          selectedFilters.services.length > 0 ? selectedFilters.services : null,
        instanceTypes:
          selectedFilters.instanceTypes.length > 0
            ? selectedFilters.instanceTypes
            : null,
        usageTypes:
          selectedFilters.usageTypes.length > 0
            ? selectedFilters.usageTypes
            : null,
        platforms:
          selectedFilters.platforms.length > 0
            ? selectedFilters.platforms
            : null,
        regions:
          selectedFilters.regions.length > 0 ? selectedFilters.regions : null,
        usageTypeGroups:
          selectedFilters.usageTypeGroups.length > 0
            ? selectedFilters.usageTypeGroups
            : null,
        purchaseOptions:
          selectedFilters.purchaseOptions.length > 0
            ? selectedFilters.purchaseOptions
            : null,
        apiOperations:
          selectedFilters.apiOperations.length > 0
            ? selectedFilters.apiOperations
            : null,
        resources:
          selectedFilters.resources.length > 0
            ? selectedFilters.resources
            : null,
        availabilityZones:
          selectedFilters.availabilityZones.length > 0
            ? selectedFilters.availabilityZones
            : null,
        tenancies:
          selectedFilters.tenancies.length > 0
            ? selectedFilters.tenancies
            : null,
        chargeTypes:
          selectedFilters.chargeTypes.length > 0
            ? selectedFilters.chargeTypes
            : null,
      };

      const response = await api.post("/cost-explorer/data", filterData);

      // Check if the response data is empty or effectively empty
      const isEmpty =
        !response.data ||
        !response.data.groups ||
        response.data.groups.length === 0 ||
        !response.data.timeUnits ||
        response.data.timeUnits.length === 0;

      if (isEmpty) {
        // Set a specific state for no data
        setCostData(null);
        setError("No cost data available for your account.");
      } else {
        setCostData(response.data);
        setError(null);
      }
    } catch (err) {
      console.error("Error fetching cost data:", err);
      setError("Failed to load cost data. Please try again.");
      setCostData(null);
    } finally {
      hideLoader();
    }
  };

  const handleFilterChange = (filterName, selectedValues) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filterName]: selectedValues,
    }));
  };

  const handleRefresh = () => {
    fetchCostData();
  };

  const handleExport = () => {
    // Implementation for exporting data
    if (!costData) return;

    const csvContent = generateCSV(costData);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `cost-explorer-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateCSV = (data) => {
    const headers = ["Group", ...data.timeUnits, "Total"];

    const rows = data.groups.map((group) => {
      const rowData = [group.key];
      data.timeUnits.forEach((time) => {
        rowData.push(
          group.values[time] ? group.values[time].toFixed(2) : "0.00"
        );
      });
      rowData.push(group.total.toFixed(2));
      return rowData;
    });

    // Add totals row
    const totalsRow = ["Total"];
    data.timeUnits.forEach((time) => {
      totalsRow.push(data.totals[time] ? data.totals[time].toFixed(2) : "0.00");
    });

    const total = Object.values(data.totals).reduce(
      (sum, val) => sum + Number(val),
      0
    );
    totalsRow.push(total.toFixed(2));

    rows.push(totalsRow);

    // Create CSV content
    const csvRows = [headers.join(","), ...rows.map((row) => row.join(","))];

    return csvRows.join("\n");
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: "medium" }}>
            Cost Explorer
          </Typography>
          <Typography variant="body2" color="text.secondary">
            How to always be aware of cost changes and history.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          color="primary"
          onClick={handleExport}
          startIcon={<FileDownloadIcon />}
          disabled={!costData}
        >
          Export
        </Button>
      </Box>

      <Box
        sx={{
          display: "flex",
          width: "100%",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Main content area */}
        <Box
          sx={{
            width: showFilters ? "calc(100% - 350px)" : "100%",
            transition: "width 0.3s ease",
            overflow: "hidden",
          }}
        >
          <Paper sx={{ p: 2, mb: 2 }}>
            {/* Group By tiles */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Group By:
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {/* Display the currently selected option first if it's from "More" */}
                {groupByOptions
                  .slice(7)
                  .some((opt) => opt.value === groupBy) ? (
                  <>
                    <Button
                      variant="contained"
                      color="primary"
                      sx={{ minWidth: "auto", textTransform: "none" }}
                    >
                      {
                        groupByOptions.find((opt) => opt.value === groupBy)
                          ?.label
                      }
                    </Button>
                    {groupByOptions.slice(0, 6).map((option) => (
                      <Button
                        key={option.value}
                        variant="outlined"
                        color="primary"
                        onClick={() => setGroupBy(option.value)}
                        sx={{ minWidth: "auto", textTransform: "none" }}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </>
                ) : (
                  // Normal display of the first 7 options
                  groupByOptions.slice(0, 7).map((option) => (
                    <Button
                      key={option.value}
                      variant={
                        groupBy === option.value ? "contained" : "outlined"
                      }
                      color="primary"
                      onClick={() => setGroupBy(option.value)}
                      sx={{
                        minWidth: "auto",
                        textTransform: "none",
                        bgcolor:
                          groupBy === option.value
                            ? "primary.main"
                            : "transparent",
                        color:
                          groupBy === option.value ? "white" : "primary.main",
                      }}
                    >
                      {option.label}
                    </Button>
                  ))
                )}
                <FormControl size="small">
                  <Select
                    value=""
                    displayEmpty
                    renderValue={() => "More"}
                    size="small"
                    sx={{
                      minWidth: "auto",
                      height: "100%",
                      ".MuiSelect-select": {
                        py: 0.5,
                        px: 1.5,
                      },
                    }}
                  >
                    {groupByOptions.slice(7).map((option) => (
                      <MenuItem
                        key={option.value}
                        value={option.value}
                        onClick={() => setGroupBy(option.value)}
                        selected={groupBy === option.value}
                      >
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" gutterBottom>
                  Start Date:
                </Typography>
                <TextField
                  type="date"
                  fullWidth
                  size="small"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" gutterBottom>
                  End Date:
                </Typography>
                <TextField
                  type="date"
                  fullWidth
                  size="small"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    mt: { xs: 0, sm: 3 },
                  }}
                >
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => setShowFilters(!showFilters)}
                    startIcon={<FilterListIcon />}
                    sx={{ mr: 1 }}
                  >
                    Filters
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleRefresh}
                    sx={{ mr: 1 }}
                  >
                    Apply
                  </Button>
                  {/* <IconButton color="primary" onClick={handleRefresh}>
                    <RefreshIcon />
                  </IconButton> */}
                </Box>
              </Grid>

              {accounts.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Accounts:
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      multiple
                      displayEmpty
                      value={selectedAccounts}
                      onChange={(e) => setSelectedAccounts(e.target.value)}
                      input={<OutlinedInput />}
                      renderValue={(selected) => (
                        <Box
                          sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                        >
                          {selected.length === 0 ? (
                            <Typography color="text.secondary">
                              All Accounts
                            </Typography>
                          ) : (
                            selected.map((value) => (
                              <Chip key={value} label={value} size="small" />
                            ))
                          )}
                        </Box>
                      )}
                      MenuProps={MenuProps}
                    >
                      {accounts.map((account) => (
                        <MenuItem key={account} value={account}>
                          <Checkbox
                            checked={selectedAccounts.indexOf(account) > -1}
                          />
                          <ListItemText primary={account} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
            </Grid>
          </Paper>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Paper sx={{ p: 3, textAlign: "center" }}>
              <Typography color="error">{error}</Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleRefresh}
                sx={{ mt: 2 }}
              >
                Try Again
              </Button>
            </Paper>
          ) : costData ? (
            <>
              <Paper
                sx={{ p: 2, mb: 2, width: "100%", boxSizing: "border-box" }}
              >
                <Typography variant="h6" gutterBottom>
                  Cost Over Time
                </Typography>
                <CostBarChart data={costData} />
              </Paper>

              <Paper
                sx={{ p: 2, mb: 2, width: "100%", boxSizing: "border-box" }}
              >
                <Typography variant="h6" gutterBottom>
                  Cost Trends
                </Typography>
                <CostLineChart data={costData} />
              </Paper>

              <Paper sx={{ p: 2, width: "100%", boxSizing: "border-box" }}>
                <Typography variant="h6" gutterBottom>
                  Cost Details
                </Typography>
                <CostTable data={costData} />
              </Paper>

              <Box sx={{ mt: 2, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  We are showing up to 1000 records by cost.
                </Typography>
              </Box>
            </>
          ) : (
            <Paper sx={{ p: 3, textAlign: "center" }}>
              <Typography>
                No data available. Adjust filters and try again.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleRefresh}
                sx={{ mt: 2 }}
              >
                Load Data
              </Button>
            </Paper>
          )}
        </Box>

        {/* Filters panel on the right */}
        {showFilters && (
          <Box
            sx={{
              width: 350,
              position: "absolute",
              right: 0,
              top: 0,
              height: "auto",
              transition: "transform 0.3s ease",
              transform: "translateX(0)",
              zIndex: 10,
            }}
          >
            <Paper sx={{ p: 2, boxShadow: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontSize: "1.125rem", fontWeight: 500 }}
                >
                  Filters
                </Typography>
                <Button
                  variant="text"
                  color="primary"
                  size="small"
                  onClick={() => {
                    // Reset all filters
                    Object.keys(selectedFilters).forEach((key) => {
                      handleFilterChange(key, []);
                    });
                  }}
                  sx={{ fontSize: "0.8125rem", textTransform: "none" }}
                >
                  Reset All
                </Button>
              </Box>

              <FilterPanel
                filterValues={filterValues}
                selectedFilters={selectedFilters}
                onFilterChange={handleFilterChange}
              />

              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setShowFilters(false)}
                  sx={{
                    mr: 1,
                    textTransform: "none",
                    fontSize: "0.8125rem",
                    height: "36px",
                  }}
                >
                  Close
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    handleRefresh();
                    setShowFilters(false);
                  }}
                  sx={{
                    textTransform: "none",
                    fontSize: "0.8125rem",
                    height: "36px",
                  }}
                >
                  Apply
                </Button>
              </Box>
            </Paper>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default CostExplorer;
