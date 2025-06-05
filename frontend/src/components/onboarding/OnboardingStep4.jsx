import {
  Box,
  Typography,
  Paper,
  Divider,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from "@mui/material";
import {
  AccountCircle,
  Label,
  Link as LinkIcon,
  CheckCircle,
  CheckCircleOutline,
  LocationOn,
} from "@mui/icons-material";

const OnboardingStep4 = ({ formData }) => {
  const checkFormCompletion = () => {
    const requiredFields = ["accountId", "accountName", "arn", "region"];
    const missingFields = requiredFields.filter((field) => !formData[field]);
    return missingFields.length === 0;
  };

  const isFormComplete = checkFormCompletion();

  const getRegionLabel = (regionValue) => {
    if (!regionValue) return "Not provided";

    const regions = [
      { value: "us-east-1", label: "US East (N. Virginia)" },
      { value: "us-east-2", label: "US East (Ohio)" },
      { value: "us-west-1", label: "US West (N. California)" },
      { value: "us-west-2", label: "US West (Oregon)" },
      { value: "ca-central-1", label: "Canada (Central)" },
      { value: "ca-west-1", label: "Canada West (Calgary)" },
      { value: "mx-central-1", label: "Mexico (Central)" },
      { value: "sa-east-1", label: "South America (São Paulo)" },
      { value: "eu-west-1", label: "Europe (Ireland)" },
      { value: "eu-west-2", label: "Europe (London)" },
      { value: "eu-west-3", label: "Europe (Paris)" },
      { value: "eu-central-1", label: "Europe (Frankfurt)" },
      { value: "eu-central-2", label: "Europe (Zurich)" },
      { value: "eu-north-1", label: "Europe (Stockholm)" },
      { value: "eu-south-1", label: "Europe (Milan)" },
      { value: "eu-south-2", label: "Europe (Spain)" },
      { value: "me-south-1", label: "Middle East (Bahrain)" },
      { value: "me-central-1", label: "Middle East (UAE)" },
      { value: "il-central-1", label: "Israel (Tel Aviv)" },
      { value: "af-south-1", label: "Africa (Cape Town)" },
      { value: "ap-south-1", label: "Asia Pacific (Mumbai)" },
      { value: "ap-south-2", label: "Asia Pacific (Hyderabad)" },
      { value: "ap-southeast-1", label: "Asia Pacific (Singapore)" },
      { value: "ap-southeast-2", label: "Asia Pacific (Sydney)" },
      { value: "ap-southeast-3", label: "Asia Pacific (Jakarta)" },
      { value: "ap-southeast-4", label: "Asia Pacific (Melbourne)" },
      { value: "ap-southeast-5", label: "Asia Pacific (Malaysia)" },
      { value: "ap-southeast-7", label: "Asia Pacific (Thailand)" },
      { value: "ap-northeast-1", label: "Asia Pacific (Tokyo)" },
      { value: "ap-northeast-2", label: "Asia Pacific (Seoul)" },
      { value: "ap-northeast-3", label: "Asia Pacific (Osaka)" },
      { value: "ap-east-1", label: "Asia Pacific (Hong Kong)" },
      { value: "cn-north-1", label: "China (Beijing)" },
      { value: "cn-northwest-1", label: "China (Ningxia)" },
    ];

    const region = regions.find((r) => r.value === regionValue);
    return region ? region.label : regionValue;
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Step 4: Confirm & Submit
      </Typography>

      <Typography variant="body1" paragraph>
        Please review the information below before finalizing the onboarding
        process.
      </Typography>

      {!isFormComplete && (
        <Alert severity="warning" sx={{ mb: 4 }}>
          <AlertTitle>Missing Information</AlertTitle>
          Please complete all required fields in the previous steps before
          submitting.
        </Alert>
      )}

      {isFormComplete && (
        <Alert severity="info" sx={{ mb: 4 }}>
          <AlertTitle>Ready to Submit</AlertTitle>
          All required information has been provided. You can now complete the
          onboarding process.
        </Alert>
      )}

      <Typography variant="h6" gutterBottom>
        Account Details
      </Typography>

      <Paper variant="outlined" sx={{ p: 3, mb: 4 }}>
        <List>
          <ListItem>
            <ListItemIcon>
              <AccountCircle color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="AWS Account ID"
              secondary={formData.accountId || "Not provided"}
            />
            {formData.accountId ? (
              <Chip label="Provided" color="success" size="small" />
            ) : (
              <Chip label="Missing" color="error" size="small" />
            )}
          </ListItem>

          <Divider variant="inset" component="li" />

          <ListItem>
            <ListItemIcon>
              <Label color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Account Name"
              secondary={formData.accountName || "Not provided"}
            />
            {formData.accountName ? (
              <Chip label="Provided" color="success" size="small" />
            ) : (
              <Chip label="Missing" color="error" size="small" />
            )}
          </ListItem>

          <Divider variant="inset" component="li" />

          <ListItem>
            <ListItemIcon>
              <LinkIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Role ARN"
              secondary={formData.arn || "Not provided"}
              secondaryTypographyProps={{ style: { wordBreak: "break-all" } }}
            />
            {formData.arn ? (
              <Chip label="Provided" color="success" size="small" />
            ) : (
              <Chip label="Missing" color="error" size="small" />
            )}
          </ListItem>

          <Divider variant="inset" component="li" />

          <ListItem>
            <ListItemIcon>
              <LocationOn color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="AWS Region"
              secondary={getRegionLabel(formData.region)}
            />
            {formData.region ? (
              <Chip label="Provided" color="success" size="small" />
            ) : (
              <Chip label="Missing" color="error" size="small" />
            )}
          </ListItem>
        </List>
      </Paper>

      <Typography variant="h6" gutterBottom>
        Onboarding Checklist
      </Typography>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <List>
          <ListItem>
            <ListItemIcon>
              {isFormComplete ? (
                <CheckCircle color="success" />
              ) : (
                <CheckCircleOutline color="disabled" />
              )}
            </ListItemIcon>
            <ListItemText
              primary="Account Information"
              secondary="Account ID, name, ARN, and region have been provided"
            />
            <Chip
              label={isFormComplete ? "Completed" : "Incomplete"}
              color={isFormComplete ? "success" : "default"}
              size="small"
            />
          </ListItem>

          <Divider variant="inset" component="li" />

          <ListItem>
            <ListItemIcon>
              <CheckCircle color="success" />
            </ListItemIcon>
            <ListItemText
              primary="IAM Role Created"
              secondary="IAM role with proper trust policy has been created"
            />
            <Chip label="Completed" color="success" size="small" />
          </ListItem>

          <Divider variant="inset" component="li" />

          <ListItem>
            <ListItemIcon>
              <CheckCircle color="success" />
            </ListItemIcon>
            <ListItemText
              primary="Permission Policies Attached"
              secondary="Required policies have been attached to the IAM role"
            />
            <Chip label="Completed" color="success" size="small" />
          </ListItem>

          <Divider variant="inset" component="li" />

          <ListItem>
            <ListItemIcon>
              <CheckCircle color="success" />
            </ListItemIcon>
            <ListItemText
              primary="Cost and Usage Report Created"
              secondary="Cost report has been set up with required configuration"
            />
            <Chip label="Completed" color="success" size="small" />
          </ListItem>
        </List>
      </Paper>

      <Box sx={{ mt: 4 }}>
        <Alert severity="success">
          <AlertTitle>Ready to Finalize</AlertTitle>
          Click the Submit button below to complete the onboarding process and
          add this account to CloudBalance.
        </Alert>
      </Box>
    </Box>
  );
};

export default OnboardingStep4;
