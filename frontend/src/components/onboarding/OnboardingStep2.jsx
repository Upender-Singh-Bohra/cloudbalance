

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
import NumberIcon from "../common/NumberIcon";
import img1 from "../../assets/image1_second_page.png";
import img2 from "../../assets/image2_second_page.png";
import img3 from "../../assets/image3_second_page.png";
import img4 from "../../assets/image4_second_page.png";

const iamPolicyJsonReadOnly = `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "CostAudit",
      "Effect": "Allow",
      "Action": [
        "dms:Describe*",
        "dms:List*",
        // ... (rest of the policy)
      ],
      "Resource": "*"
    }
    // ... (rest of the policy statements)
  ]
}`;

const inlinePolicyJson = `{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": [
          "s3:GetBucketAcl",
          "s3:GetBucketPolicy"
        ],
        "Resource": "arn:aws:s3:::example-bucket"
      }
    ]
  }`;

const OnboardingStep2 = ({ formData }) => {
  // Step configuration for rendering ListItems
  const steps = [
    {
      number: 1,
      text: "Go to the Create-Policy Page"
    },
    {
      number: 2,
      text: "Click on the JSON tab and paste the following policy and click on Next:",
      codeBlock: iamPolicyJsonReadOnly
    },
    {
      number: 3,
      text: "In the Name field, enter below-mentioned policy name and click on Create Policy"
    },
    {
      number: 4,
      text: "Again, go to the Create Policy Page."
    },
    {
      number: 5,
      text: "Click on the JSON tab and paste the following policy and click on Next:",
      codeBlock: iamPolicyJsonReadOnly
    },
    {
      number: 6,
      text: "In the Name field, enter below-mentioned policy name and click on Create Policy"
    },
    {
      number: 7,
      text: "Go to the Ck-Tuner-Role",
      image: img1
    },
    {
      number: 8,
      text: "In Permission policies, click on Add permission > Attach Policies",
      image: img2
    },
    {
      number: 9,
      text: "Filter by Type > Customer managed then search for cktuner-CostAuditPolicy, cktuner-TunerReadEssentials and select them.",
      image: img3
    },
    {
      number: 10,
      text: "Now click on add permissions"
    },
    {
      number: 11,
      text: "In Permission policies, click on Add permission > Create inline policy",
      image: img4
    },
    {
      number: 12,
      text: "Click on the JSON tab and paste the following policy",
      codeBlock: inlinePolicyJson
    },
    {
      number: 13,
      text: "Now click on Review policy"
    },
    {
      number: 14,
      text: "In the Name field, enter below-mentioned policy name and click on Create Policy"
    }
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Step 2: Add Customer Managed Policies
      </Typography>

      <Typography variant="body1" paragraph>
        Create an Inline policy for the role by following these steps
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
                <Box sx={{ pl: 6, pr: 2, py: 2, maxHeight: 400, overflow: "auto" }}>
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

export default OnboardingStep2;