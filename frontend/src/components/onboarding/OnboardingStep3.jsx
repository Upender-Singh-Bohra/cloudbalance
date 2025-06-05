

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
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import NumberIcon from "../common/NumberIcon";
import img1 from "../../assets/image1_third_page.png";
import img2 from "../../assets/image2_third_page.png";
import img3 from "../../assets/image3_third_page.png";

const OnboardingStep3 = ({ formData }) => {
  // Step configuration for rendering ListItems
  const steps = [
    {
      number: 1,
      text: "Go to Cost and Usage Reports in the Billing Dashboard and click on Create report"
    },
    {
      number: 2,
      text: "Name the report as shown below and select the Include resource IDs checkbox-",
      content: (
        <Box sx={{ pl: 2 }}>
          <Typography variant="body2" gutterBottom>
            • Report name: ck-tuner-{formData.accountId || "{accountId}"}-hourly-cur
          </Typography>
          <FormControlLabel
            control={<Checkbox checked={true} disabled />}
            label="Include resource IDs"
          />
        </Box>
      ),
      image: img1
    },
    {
      number: 3,
      text: "In Configuration S3 Bucket, provide the name of the S3 bucket that was created -",
      content: (
        <Box sx={{ pl: 2 }}>
          <Typography variant="body2" gutterBottom>
            Ensure that the following configuration is checked
          </Typography>
          <FormControlLabel
            control={<Checkbox checked={true} disabled />}
            label="The following default policy will be applied to your bucket"
          />
        </Box>
      ),
      image: img2
    },
    {
      number: 4,
      text: "In the Delivery options section, enter the below-mentioned Report path prefix-",
      image: img3,
      content: (
        <>
          <Typography variant="subtitle2" gutterBottom>
            Delivery options:
          </Typography>
          <Box sx={{ pl: 2 }}>
            <Typography variant="body2" gutterBottom>
              • Report path prefix:{" "}
              {formData.accountId || "{your-account-id}"}
            </Typography>
            <Typography variant="body2" gutterBottom>
              • Time granularity: Hourly
            </Typography>
            <Typography variant="body2" gutterBottom>
              • Report versioning: Create new report version
            </Typography>
            <Typography variant="body2" gutterBottom>
              • Enable data integration for: Amazon Athena
            </Typography>
            <Typography variant="body2" gutterBottom>
              • Compression type: Parquet
            </Typography>
          </Box>
        </>
      )
    },
    {
      number: 5,
      text: "Click on Next. Now, review the configuration of the Cost and Usage Report. Once satisfied, click on Create Report"
    }
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Step 3: Set Up Cost Usage Report
      </Typography>

      <Typography variant="body1" paragraph>
        In this step, you'll set up a Cost and Usage Report in your AWS account
        that will provide detailed cost data to CloudBalance.
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

              {step.content && (
                <Box sx={{ pl: 6, pr: 2, py: 2 }}>
                  {step.content}
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

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Account Information
        </Typography>
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Account ID
          </Typography>
          <Typography variant="body1" paragraph sx={{ pl: 2 }}>
            {formData.accountId || "Not provided yet"}
          </Typography>

          <Typography variant="subtitle2" gutterBottom>
            Account Name
          </Typography>
          <Typography variant="body1" paragraph sx={{ pl: 2 }}>
            {formData.accountName || "Not provided yet"}
          </Typography>

          <Typography variant="subtitle2" gutterBottom>
            Role ARN
          </Typography>
          <Typography
            variant="body1"
            paragraph
            sx={{ pl: 2, wordBreak: "break-all" }}
          >
            {formData.arn || "Not provided yet"}
          </Typography>

          <Typography variant="subtitle2" gutterBottom>
            Region
          </Typography>
          <Typography variant="body1" sx={{ pl: 2 }}>
            {formData.region || "Not provided yet"}
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default OnboardingStep3;