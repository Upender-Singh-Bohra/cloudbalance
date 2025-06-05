
import React from "react";
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import CodeBlock from "../common/CodeBlock";
import FormField from "../common/FormField";
import NumberIcon from "../common/NumberIcon";
import img1 from "../../assets/image1_first_page.png";

const iamPolicyJson = `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::951485052809:root"
      },
      "Action": "sts:AssumeRole",
      "Condition": {
        "StringEquals": {
          "sts:ExternalId": "Um9oaXRES19ERUZBVUxUZDIzOTJkZTgtN2E0OS00NWQ3LTg3MzItODkyM2ExZTIzMjQw"
        }
      }
    },
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "s3.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}`;

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

const OnboardingStep1 = ({ formData, onChange, onBlur, formErrors, formTouched }) => {
  // Only show error if field has been touched
  const showError = (field) => {
    return formTouched[field] && formErrors[field];
  };

  // Step configuration for rendering ListItems
  const steps = [
    {
      number: 1,
      text: "Log into AWS account & Create an IAM Role."
    },
    {
      number: 2,
      text: "In the Trusted entity type section, select Custom trust policy. Replace the prefilled policy with the policy provided below ",
      codeBlock: iamPolicyJson
    },
    {
      number: 3,
      text: "Name the Click on Next to go to the Add permissions page. We would not be adding any permissions for now because the permission policy content will be dependent on the AWS Account ID retrieved from the IAM Role. Click on Next."
    },
    {
      number: 4,
      text: "In the Role name field, enter the below-mentioned role name, and click on Create Role -"
    },
    {
      number: 5,
      text: "Go to the newly create IAM Role and copy the Role ARN",
      image: img1
    }
  ];

  const formFields = [
    {
      id: "accountId",
      name: "accountId",
      label: "AWS Account ID",
      type: "text",
      required: true,
      error: showError("accountId"),
      helperText: "Your 12-digit AWS account ID (e.g., 123456789012)",
      errorText: "Please enter a valid 12-digit AWS account ID",
      value: formData.accountId
    },
    {
      id: "accountName",
      name: "accountName",
      label: "Account Name",
      type: "text",
      required: true,
      error: showError("accountName"),
      helperText: "A descriptive name for this account",
      errorText: "Account name is required",
      value: formData.accountName
    },
    {
      id: "arn",
      name: "arn",
      label: "Role ARN",
      type: "text",
      required: true,
      error: showError("arn"),
      helperText: "The ARN of the IAM role you created (e.g., arn:aws:iam::123456789012:role/CK-Tuner-Role)",
      errorText: "Please enter a valid ARN starting with arn:aws:iam::",
      value: formData.arn
    },
    {
      id: "region",
      name: "region",
      label: "AWS Region",
      type: "select",
      required: true,
      error: showError("region"),
      helperText: "The AWS region where your resources are located",
      errorText: "Please select a region",
      value: formData.region,
      options: regions
    }
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Step 1: Create IAM Role
      </Typography>

      <Typography variant="body1" paragraph>
        In this step, you'll create an IAM role that will be used by
        CloudBalance to access your AWS account data.
      </Typography>

      <Paper variant="outlined" sx={{ p: 3, mb: 4 }}>
        <List>
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <ListItem>
                <ListItemIcon>
                  <NumberIcon number={step.number} color="primary" />
                </ListItemIcon>
                <ListItemText primary={step.text} />
              </ListItem>

              {step.codeBlock && (
                <Box sx={{ pl: 6, pr: 2, py: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Custom trust policy:
                  </Typography>
                  <CodeBlock code={step.codeBlock} language="json" />
                </Box>
              )}

              {step.image && (
                <Box sx={{ mt: 2, textAlign: "center" }}>
                  <img
                    src={step.image}
                    alt={`Step ${step.number} screenshot`}
                    style={{ maxWidth: "100%", borderRadius: 8 }}
                  />
                </Box>
              )}

              {index < steps.length - 1 && <Divider component="li" sx={{ my: 2 }} />}
            </React.Fragment>
          ))}
        </List>
      </Paper>

      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        Enter Account Details
      </Typography>

      <Box
        component="form"
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          mt: 2,
        }}
      >
        {formFields.map((field) => (
          <FormField
            key={field.id}
            {...field}
            onChange={onChange}
            onBlur={onBlur}
          />
        ))}
      </Box>
    </Box>
  );
};

export default OnboardingStep1;