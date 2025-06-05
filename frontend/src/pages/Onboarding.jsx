
import { useState, useEffect } from "react";
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Container,
  Paper,
  Snackbar,
  Alert,
} from "@mui/material";
import OnboardingStep1 from "../components/onboarding/OnboardingStep1";
import OnboardingStep2 from "../components/onboarding/OnboardingStep2";
import OnboardingStep3 from "../components/onboarding/OnboardingStep3";
import OnboardingStep4 from "../components/onboarding/OnboardingStep4";
import cloudAccountService from "../services/cloudAccountService";
import { useLoader, LOADER_TYPES } from "../components/loader/LoaderProvider";

const steps = [
  "Create IAM Role",
  "Configure Permissions",
  "Set Up Cost Usage Report",
  "Confirm & Submit",
];

const Onboarding = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    accountId: "",
    accountName: "",
    arn: "",
    region: "",
  });
  const [formErrors, setFormErrors] = useState({
    accountId: false,
    accountName: false,
    arn: false,
    region: false,
  });
  const [formTouched, setFormTouched] = useState({
    accountId: false,
    accountName: false,
    arn: false,
    region: false,
  });
  const { showLoader, hideLoader } = useLoader();
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeStep]);

  const validateField = (field, value) => {
    if (!value) return true; // Field is invalid (empty)

    // Add specific validation if needed
    switch (field) {
      case "accountId":
        return !/^\d{12}$/.test(value); // Invalid if not 12 digits
      case "arn":
        return !value.startsWith("arn:aws:iam::"); // Invalid if not correct format
      default:
        return false; // Valid
    }
  };

  const handleNext = () => {
    // Check if all required fields are filled for the first step
    if (activeStep === 0) {
      const requiredFields = ["accountId", "accountName", "arn", "region"];
      const missingFields = requiredFields.filter((field) => !formData[field]);

      // Mark all fields as touched
      const newTouched = { ...formTouched };
      requiredFields.forEach((field) => {
        newTouched[field] = true;
      });
      setFormTouched(newTouched);

      // Validate all fields
      const newErrors = { ...formErrors };
      requiredFields.forEach((field) => {
        newErrors[field] = validateField(field, formData[field]);
      });
      setFormErrors(newErrors);

      if (
        missingFields.length > 0 ||
        Object.values(newErrors).some((error) => error)
      ) {
        setSnackbar({
          open: true,
          message:
            "Please fill in all required fields correctly before proceeding",
          severity: "error",
        });
        return;
      }
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleFormChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });

    // Mark field as touched
    setFormTouched({
      ...formTouched,
      [field]: true,
    });

    // Validate field
    setFormErrors({
      ...formErrors,
      [field]: validateField(field, value),
    });
  };

  const handleBlur = (field) => {
    setFormTouched({
      ...formTouched,
      [field]: true,
    });
  };

  const handleSubmit = async () => {
    // Submit the form data to create a new cloud account
    setLoading(true);
    // custom loader
    showLoader({
      type: LOADER_TYPES.VERTICAL_BARS, // or LOADER_TYPES.CREATIVE
      text: "Creating account...",
    });

    try {
      // Call API to create a new cloud account
      const cloudAccountData = {
        accountId: formData.accountId,
        accountName: formData.accountName,
        arn: formData.arn,
        provider: "AWS",
        region: formData.region,
        isActive: true,
      };

      await cloudAccountService.createCloudAccount(cloudAccountData);

      setSnackbar({
        open: true,
        message: "Cloud account successfully created!",
        severity: "success",
      });

      // Move to the next step (success screen)
      handleNext();
    } catch (error) {
      console.error("Error creating cloud account:", error);
      setSnackbar({
        open: true,
        message:
          error.response?.data?.message || "Failed to create cloud account",
        severity: "error",
      });
    } finally {
      hideLoader();
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <OnboardingStep1
            formData={formData}
            onChange={handleFormChange}
            onBlur={handleBlur}
            formErrors={formErrors}
            formTouched={formTouched}
          />
        );
      case 1:
        return <OnboardingStep2 formData={formData} />;
      case 2:
        return <OnboardingStep3 formData={formData} />;
      case 3:
        return <OnboardingStep4 formData={formData} />;
      default:
        return "Unknown step";
    }
  };

  const isLastStep = activeStep === steps.length - 1;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography component="h1" variant="h4" align="center" gutterBottom>
          Account Onboarding
        </Typography>
        <Typography
          variant="subtitle1"
          align="center"
          color="text.secondary"
          paragraph
        >
          Follow these steps to onboard a new cloud account to CloudBalance
        </Typography>

        <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box>
          {activeStep === steps.length ? (
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h5" gutterBottom>
                Account Successfully Onboarded!
              </Typography>
              <Typography variant="subtitle1">
                You have successfully onboarded a new cloud account to
                CloudBalance.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 3 }}
                onClick={() => (window.location.href = "/dashboard")}
              >
                Return to Dashboard
              </Button>
            </Box>
          ) : (
            <>
              <Box>{getStepContent(activeStep)}</Box>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}
              >
                <Button
                  color="inherit"
                  disabled={activeStep === 0 || loading}
                  onClick={handleBack}
                  sx={{ mr: 1 }}
                >
                  Back
                </Button>
                <Box sx={{ flex: "1 1 auto" }} />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={isLastStep ? handleSubmit : handleNext}
                  disabled={loading}
                >
                  {loading ? "Processing..." : isLastStep ? "Submit" : "Next"}
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Onboarding;
