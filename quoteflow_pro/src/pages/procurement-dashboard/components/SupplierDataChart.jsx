import * as React from "react";
import { PieChart, pieArcLabelClasses } from "@mui/x-charts/PieChart";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { faker } from "@faker-js/faker";
import { legendClasses } from "@mui/x-charts/ChartsLegend";
const suppliers = ["Teachnova", "GreenLeaf", "InfoLight"];

// Helper function to generate data for a single pie chart
const generateChartData = () => {
  return suppliers.map((supplier) => ({
    label: supplier,
    value: faker.number.int({ min: 50, max: 500 }),
  }));
};

// Generate data for each of the three charts
const indentItemsData = generateChartData();
const serviceRequestData = generateChartData();
const transportRequestData = generateChartData();

// Calculate total for each dataset to compute percentages
const totalIndentItems = indentItemsData.reduce(
  (sum, item) => sum + item.value,
  0
);
const totalServiceRequest = serviceRequestData.reduce(
  (sum, item) => sum + item.value,
  0
);
const totalTransportRequest = transportRequestData.reduce(
  (sum, item) => sum + item.value,
  0
);

// Function to get the arc label as a percentage
const getArcLabel = (params, total) => {
  const percent = params.value / total;
  return `${(percent * 100).toFixed(0)}%`;
};

export default function SupplierDataChart() {
  return (
    <Box sx={{ flexGrow: 1, width: "100%", p: 2, height: "100%" }}>
      <Stack spacing={2} alignItems="center" sx={{ height: "100%" }}>
        <Typography
          variant="h6"
          component="h2"
          gutterBottom
          align="center"
          fontWeight="bold"
        >
          Supplier Data Spread Comparison
        </Typography>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={4}
          justifyContent="center"
          alignItems="center"
          sx={{ width: "100%", height: "100%" }}
        >
          {/* Indent Items Chart */}
          <Box sx={{ width: 300, height: 350, textAlign: "center" }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Indent Items
            </Typography>
            <PieChart
              series={[
                {
                  outerRadius: 100,
                  data: indentItemsData,
                  arcLabel: (params) => getArcLabel(params, totalIndentItems),
                },
              ]}
              sx={{
                [`& .${pieArcLabelClasses.root}`]: {
                  fill: "white",
                  fontSize: 14,
                },
              }}
              width={300}
              height={250}
              hideLegend
            />
          </Box>

          {/* Service Request Chart */}
          <Box sx={{ width: 300, height: 350, textAlign: "center" }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Service Request
            </Typography>
            <PieChart
              series={[
                {
                  outerRadius: 100,
                  data: serviceRequestData,
                  arcLabel: (params) =>
                    getArcLabel(params, totalServiceRequest),
                },
              ]}
              sx={{
                [`& .${pieArcLabelClasses.root}`]: {
                  fill: "white",
                  fontSize: 14,
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
          </Box>

          {/* Transport Request Chart */}
          <Box sx={{ width: 300, height: 350, textAlign: "center" }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Transport Request
            </Typography>
            <PieChart
              series={[
                {
                  outerRadius: 100,
                  data: transportRequestData,
                  arcLabel: (params) =>
                    getArcLabel(params, totalTransportRequest),
                },
              ]}
              sx={{
                [`& .${pieArcLabelClasses.root}`]: {
                  fill: "white",
                  fontSize: 14,
                },
              }}
              width={300}
              height={250}
              hideLegend
            />
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
}
