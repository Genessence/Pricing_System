import React from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import { Stack, Typography, Box } from "@mui/material";
import { faker } from "@faker-js/faker";
import * as colors from "@mui/material/colors"; // Import Material UI colors

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const plants = [
  "A-009 JHAJJHAR I",
  "A-011 JHAJJHAR II",
  "A-404 JHAJJHAR RnD",
  "A-407 JHAJJHAR 2 PLA",
  "A-406 JHAJJHAR 1 PLA",
];

const expenseCategories = [
  "Raw Material",
  "Packaging",
  "Consumables",
  "Utilities",
  "Maintenance",
  "Salaries",
  "Rent",
  "Depreciation",
  "Logistics",
  "Others",
];

// Define base colors for each plant
const plantBaseColors = {
  "A-009 JHAJJHAR I": colors.purple,
  "A-011 JHAJJHAR II": colors.teal,
  "A-404 JHAJJHAR RnD": colors.orange,
  "A-407 JHAJJHAR 2 PLA": colors.brown,
  "A-406 JHAJJHAR 1 PLA": colors.green,
};

// Define shades to use for expense categories
const expenseShadeKeys = [
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
];

// Generate fake data
const generatePlantExpenseData = () => {
  const data = {};

  plants.forEach((plant) => {
    data[plant] = {};
    months.forEach((month) => {
      data[plant][month] = {};
      expenseCategories.forEach((category) => {
        data[plant][month][category] = faker.number.int({
          min: 50000,
          max: 500000,
        });
      });
    });
  });
  return data;
};

const plantExpenseData = generatePlantExpenseData();

// Prepare series for BarChart with specific colors and shades
const chartSeries = expenseCategories.flatMap((category, categoryIndex) =>
  plants.map((plant) => ({
    data: months.map((month) => plantExpenseData[plant][month][category]),
    label: `${plant} - ${category}`, // Label for the legend
    stack: plant, // This groups bars by plant for each month
    color: plantBaseColors[plant][expenseShadeKeys[categoryIndex]], // Assign specific shade
  }))
);

const valueFormatter = (value) =>
  value
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(value)
    : "";

function TopExpenseChart() {
  return (
    <Box sx={{ width: "100%", overflowX: "auto", p: 2 }}>
      <Stack spacing={2} alignItems="center">
        <Typography variant="h5" component="h1" gutterBottom>
          Monthly Top 10 Expenses by Manufacturing Plant
        </Typography>
        <BarChart
          xAxis={[{ scaleType: "band", data: months, label: "Month" }]}
          yAxis={[{ label: "Expense Amount", valueFormatter: valueFormatter }]}
          series={chartSeries}
          height={450}
          width={900} // Increased width to accommodate all series
          margin={{ left: 80, right: 20, top: 40, bottom: 60 }}
          slotProps={{
            legend: {
              direction: "column",
              position: { vertical: "middle", horizontal: "right" },
              itemMarkWidth: 10,
              itemMarkHeight: 10,
              labelStyle: {
                fontSize: 10,
              },
              padding: 10,
            },
          }}
          hideLegend
        />
      </Stack>
    </Box>
  );
}

export default TopExpenseChart;
