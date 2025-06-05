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
  TextField,
  InputAdornment,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  Chip,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Memory as EC2Icon,
  Storage as DatabaseIcon,
  AutoAwesome as ASGIcon,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { useLoader, LOADER_TYPES } from "../components/loader/LoaderProvider";
import cloudAccountService from "../services/cloudAccountService";

const AwsServices = () => {
  const [selectedService, setSelectedService] = useState("ec2");
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [ec2Instances, setEc2Instances] = useState([]);
  const [rdsInstances, setRdsInstances] = useState([]);
  const [asgGroups, setAsgGroups] = useState([]);
  const { showLoader, hideLoader } = useLoader();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // const { user: currentUser } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccount) {
      fetchAwsResources();
    }
  }, [selectedAccount, selectedService]);

  const { user } = useSelector((state) => state.auth);
  //


  const fetchAccounts = async () => {
    try {
      let accountsData;

      if (user && user.role === "ROLE_CUSTOMER") {
        accountsData = await cloudAccountService.getAccessibleAccountsForUser(
          user.id
        );
      } else {
        accountsData = await cloudAccountService.getAllCloudAccounts();
      }

      console.log("Accounts data:", accountsData);

      if (accountsData && accountsData.length > 0) {
        
        
        setAccounts(accountsData);
        setSelectedAccount(accountsData[0].id);
        
      } else {
        setAccounts([]);
        setError("No AWS accounts available for your user.");
      }
    } catch (err) {
      console.error("Error fetching accounts:", err);
      setError("Failed to fetch accounts. Please try again.");
    }
  };

  const fetchAwsResources = async () => {
    if (!selectedAccount) return;
    showLoader({ text: "Fetching AWS data" });
    // setLoading(true);
    setError(null);

    try {
      const baseUrl = `api/aws-services`;
      const token = localStorage.getItem("sessionToken");

      const endpoint = `${baseUrl}/${selectedService}/${selectedAccount}`;
      console.log(`Fetching from: ${endpoint}`);

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const responseText = await response.text();
      console.log(`Response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        throw new Error(
          `Server responded with ${response.status}: ${response.statusText}`
        );
      }

      try {
        const parsedData = JSON.parse(responseText);

        // Update the appropriate state based on service type
        switch (selectedService) {
          case "ec2":
            setEc2Instances(parsedData.data || []);
            break;
          case "rds":
            setRdsInstances(parsedData.data || []);
            break;
          case "asg":
            setAsgGroups(parsedData.data || []);
            break;
        }
      } catch (jsonError) {
        console.error("Error parsing JSON:", jsonError);
        throw new Error("Invalid response format from server");
      }
    } catch (err) {
      console.error(`Error fetching ${selectedService} data:`, err);
      setError(
        `Failed to fetch ${selectedService.toUpperCase()} resources. ${
          err.message
        }`
      );
    } finally {
      // setLoading(false);
      hideLoader();
    }
  };

  const handleAccountChange = (event) => {
    setSelectedAccount(event.target.value);
  };

  const handleServiceChange = (service) => {
    setSelectedService(service);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleRefresh = () => {
    fetchAwsResources();
  };

  // Filter resources based on search query
  const getFilteredResources = () => {
    switch (selectedService) {
      case "ec2":
        return ec2Instances.filter(
          (instance) =>
            instance.resourceId
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            instance.resourceName
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            instance.region
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            instance.status?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      case "rds":
        return rdsInstances.filter(
          (instance) =>
            instance.resourceId
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            instance.resourceName
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            instance.region
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            instance.engine
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            instance.status?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      case "asg":
        return asgGroups.filter(
          (group) =>
            group.resourceId
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            group.resourceName
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            group.region?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            group.status?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      default:
        return [];
    }
  };

  const getStatusColor = (status) => {
    status = status?.toLowerCase() || "";
    if (
      status.includes("running") ||
      status.includes("active") ||
      status.includes("available")
    ) {
      return "success";
    } else if (status.includes("stopped") || status.includes("inactive")) {
      return "error";
    } else if (status.includes("pending") || status.includes("starting")) {
      return "warning";
    } else {
      return "default";
    }
  };

  const renderServiceIcon = (service, selected) => {
    const color = selected ? "primary" : "action";
    switch (service) {
      case "ec2":
        return <EC2Icon color={color} />;
      case "rds":
        return <DatabaseIcon color={color} />;
      case "asg":
        return <ASGIcon color={color} />;
      default:
        return null;
    }
  };

  const renderServiceTiles = () => {
    const services = [
      {
        id: "ec2",
        name: "EC2 Instances",
        icon: "ec2",
        description: "Elastic Compute Cloud virtual servers",
      },
      {
        id: "rds",
        name: "RDS Instances",
        icon: "rds",
        description: "Relational Database Service instances",
      },
      {
        id: "asg",
        name: "Auto Scaling Groups",
        icon: "asg",
        description: "Auto Scaling Groups for EC2 instances",
      },
    ];

    return (
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {services.map((service) => (
          <Grid item key={service.id} xs={12} sm={4}>
            <Card
              sx={{
                cursor: "pointer",
                transition: "all 0.2s",
                border:
                  selectedService === service.id ? "2px solid" : "1px solid",
                borderColor:
                  selectedService === service.id ? "primary.main" : "divider",
                "&:hover": {
                  boxShadow: 3,
                  borderColor: "primary.main",
                },
              }}
              onClick={() => handleServiceChange(service.id)}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: 1,
                    color:
                      selectedService === service.id
                        ? "primary.main"
                        : "text.primary",
                  }}
                >
                  {renderServiceIcon(
                    service.id,
                    selectedService === service.id
                  )}
                  <Typography variant="h6" component="div" sx={{ ml: 1 }}>
                    {service.name}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {service.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderTable = () => {
    const filteredResources = getFilteredResources();

    return (
      <TableContainer>
        {selectedService === "ec2" && (
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>Resource ID</strong>
                </TableCell>
                <TableCell>
                  <strong>Resource Name</strong>
                </TableCell>
                <TableCell>
                  <strong>Region</strong>
                </TableCell>
                <TableCell>
                  <strong>Status</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <CircularProgress size={40} />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    align="center"
                    sx={{ color: "error.main" }}
                  >
                    {error}
                  </TableCell>
                </TableRow>
              ) : filteredResources.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No EC2 instances found
                  </TableCell>
                </TableRow>
              ) : (
                filteredResources.map((instance, index) => (
                  <TableRow key={instance.resourceId || index}>
                    <TableCell>{instance.resourceId}</TableCell>
                    <TableCell>{instance.resourceName}</TableCell>
                    <TableCell>{instance.region}</TableCell>
                    <TableCell>
                      <Chip
                        label={instance.status}
                        color={getStatusColor(instance.status)}
                        size="small"
                        variant="filled"
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}

        {selectedService === "rds" && (
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>Resource ID</strong>
                </TableCell>
                <TableCell>
                  <strong>Resource Name</strong>
                </TableCell>
                <TableCell>
                  <strong>Region</strong>
                </TableCell>
                <TableCell>
                  <strong>Engine</strong>
                </TableCell>
                <TableCell>
                  <strong>Status</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <CircularProgress size={40} />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    align="center"
                    sx={{ color: "error.main" }}
                  >
                    {error}
                  </TableCell>
                </TableRow>
              ) : filteredResources.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No RDS instances found
                  </TableCell>
                </TableRow>
              ) : (
                filteredResources.map((instance, index) => (
                  <TableRow key={instance.resourceId || index}>
                    <TableCell>{instance.resourceId}</TableCell>
                    <TableCell>{instance.resourceName}</TableCell>
                    <TableCell>{instance.region}</TableCell>
                    <TableCell>{instance.engine}</TableCell>
                    <TableCell>
                      <Chip
                        label={instance.status}
                        color={getStatusColor(instance.status)}
                        size="small"
                        variant="filled"
                      />
                      {/* <Typography>{instance.status}</Typography> */}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}

        {selectedService === "asg" && (
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>Resource ID</TableCell>
                <TableCell>Resource Name</TableCell>
                <TableCell>Region</TableCell>
                <TableCell>Desired Capacity</TableCell>
                <TableCell>Min Size</TableCell>
                <TableCell>Max Size</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress size={40} />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    align="center"
                    sx={{ color: "error.main" }}
                  >
                    {error}
                  </TableCell>
                </TableRow>
              ) : filteredResources.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No Auto Scaling Groups found
                  </TableCell>
                </TableRow>
              ) : (
                filteredResources.map((group, index) => (
                  <TableRow key={group.resourceId || index}>
                    <TableCell>{group.resourceId}</TableCell>
                    <TableCell>{group.resourceName}</TableCell>
                    <TableCell>{group.region}</TableCell>
                    <TableCell>{group.desiredCapacity}</TableCell>
                    <TableCell>{group.minSize}</TableCell>
                    <TableCell>{group.maxSize}</TableCell>
                    <TableCell>
                      <Chip
                        label={group.status}
                        color={getStatusColor(group.status)}
                        size="small"
                        variant="filled"
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>
    );
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
          AWS Services
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <FormControl variant="outlined" sx={{ minWidth: 200, mr: 2 }}>
            <InputLabel id="account-select-label">AWS Account</InputLabel>
            <Select
              labelId="account-select-label"
              id="account-select"
              value={selectedAccount || ""}
              onChange={handleAccountChange}
              label="AWS Account"
            >
              {accounts.map((account) => (
                <MenuItem key={account.id} value={account.id}>
                  {account.accountName}
                  
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {renderServiceTiles()}

      <Paper sx={{ width: "100%", mb: 3 }}>
        <Box sx={{ p: 2, display: "flex", justifyContent: "space-between" }}>
          <TextField
            sx={{ width: "100%" }}
            variant="outlined"
            placeholder={`Search ${selectedService.toUpperCase()} resources...`}
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
        {renderTable()}
      </Paper>
    </Box>
  );
};

export default AwsServices;
