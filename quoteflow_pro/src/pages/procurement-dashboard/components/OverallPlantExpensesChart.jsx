import * as React from "react";
import Box from "@mui/material/Box";
import { BarChart } from "@mui/x-charts/BarChart";
import { faker } from "@faker-js/faker";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";

const plantNames = [
  "A-009 JHAJJHAR I",
  "A-011 JHAJJHAR II",
  "A-404 JHAJJHAR RnD",
  "A-407 JHAJJHAR 2 PLA",
  "A-406 JHAJJHAR 1 PLA",
];

const generateMonthlyData = (year, numMonths) => {
  const xLabels = [];
  const allPlantsData = {};

  for (let i = 0; i < numMonths; i++) {
    const date = new Date(year, i, 1);
    xLabels.push(
      date.toLocaleString("en-US", { month: "short", year: "numeric" })
    );
  }

  plantNames.forEach((plant) => {
    allPlantsData[plant] = [];
    for (let i = 0; i < numMonths; i++) {
      allPlantsData[plant].push(
        parseFloat(faker.finance.amount({ min: 10000, max: 100000, dec: 0 }))
      );
    }
  });

  return { xLabels, allPlantsData };
};

const { xLabels, allPlantsData } = generateMonthlyData(2023, 12);

const series = plantNames.map((plant) => ({
  data: allPlantsData[plant],
  label: plant,
  stack: "totalExpenses", // All plants stack on the same 'totalExpenses' stack
  id: plant.replace(/\s/g, "-").toLowerCase(), // Unique ID for each series
}));

function OverallPlantExpensesChart() {
  return (
    <Stack sx={{ width: "100%", height: 500, p: 2 }}>
      <Typography variant="h6" component="h2" textAlign="center" gutterBottom>
        Monthly Expenses by Manufacturing Plant
      </Typography>
      <Box sx={{ flexGrow: 1 }}>
        <BarChart
          series={series}
          xAxis={[
            {
              data: xLabels,
              scaleType: "band",
              label: "Timeline (Months & Year)",
            },
          ]}
          yAxis={[{ label: "Expenses" }]}
          height={400}
          margin={{ left: 70, right: 70, top: 50, bottom: 50 }}
          slotProps={{
            legend: {
              position: { vertical: "bottom", horizontal: "middle" },
              padding: { top: 20 },
            },
          }}
        />
      </Box>
    </Stack>
  );
}

export default OverallPlantExpensesChart;
