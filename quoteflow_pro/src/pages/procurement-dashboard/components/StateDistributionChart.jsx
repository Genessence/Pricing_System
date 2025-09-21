import * as React from "react";
import { PieChart, pieArcLabelClasses } from "@mui/x-charts/PieChart";
import { faker } from "@faker-js/faker";
import { Box, Typography, Stack } from "@mui/material";

// Indian states data with blue shades
const indianStates = [
  "Maharashtra",
  "Uttar Pradesh",
  "Karnataka",
  "Gujarat",
  "Tamil Nadu",
];

// Blue color palette with different shades
const blueShades = [
  "#1976d2", // Primary blue
  "#42a5f5", // Light blue
  "#1565c0", // Dark blue
  "#64b5f6", // Lighter blue
  "#0d47a1", // Darker blue
];

// Generate fake data for Indian states and their supply distribution
const generateSupplyData = (count) => {
  const data = [];

  for (let i = 0; i < count; i++) {
    data.push({
      id: i,
      label: indianStates[i],
      value: faker.number.int({ min: 100, max: 1000 }),
      color: blueShades[i], // Assign blue shade for each slice
    });
  }
  return data;
};

const supplyData = generateSupplyData(5); // Generate data for 5 states

const TOTAL_SUPPLY = supplyData
  .map((item) => item.value)
  .reduce((a, b) => a + b, 0);

const getArcLabel = (params) => {
  const percent = params.value / TOTAL_SUPPLY;
  return `${(percent * 100).toFixed(1)}%`;
};

export default function StateDistributionChart() {
  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 500,
        margin: "auto",
        p: 2,
        height: "100%",
        alignItems: "center",
      }}
    >
      <Stack spacing={2} alignItems="center" sx={{ height: "100%" }}>
        <Typography
          variant="h6"
          component="h4"
          gutterBottom
          align="center"
          fontWeight="bold"
        >
          Supply Distribution by State
        </Typography>
        <PieChart
          series={[
            {
              outerRadius: 120,
              data: supplyData,
              arcLabel: getArcLabel,
              highlightScope: { faded: "global", highlighted: "item" },
              faded: {
                innerRadius: 30,
                additionalRadius: -30,
                color: "gray",
              },
            },
          ]}
          sx={{
            [`& .${pieArcLabelClasses.root}`]: {
              fill: "white",
              fontSize: 14,
              fontWeight: "bold",
            },
          }}
          width={300}
          height={250}
          slotProps={{
            legend: {
              direction: "horizontal",
              position: {
                vertical: "bottom",
                horizontal: "center",
              },
            },
          }}
        />
      </Stack>
    </Box>
  );
}
