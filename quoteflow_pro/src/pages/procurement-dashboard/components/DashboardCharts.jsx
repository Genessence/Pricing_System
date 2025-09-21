import React from "react";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import OverallPlantExpensesChart from "./OverallPlantExpensesChart";
import TopExpenseChart from "./TopExpenseChart";
import SupplierDataChart from "./SupplierDataChart";
import StateDistributionChart from "./StateDistributionChart";

function DashboardCharts() {
  return (
    <Stack width="100%" direction="column" spacing={2}>
      {[
        [<OverallPlantExpensesChart />, <TopExpenseChart />],
        [<StateDistributionChart />, <SupplierDataChart />],
      ].map(([chart1, chart2]) => (
        <Stack width="100%" direction="row" spacing={2}>
          <Box sx={{ width: "50%", height: "500px" }}>
            <Paper elevation={3} sx={{ height: "100%" }}>
              {chart1}
            </Paper>
          </Box>
          <Box sx={{ width: "50%", height: "500px" }}>
            <Paper elevation={3} sx={{ height: "100%" }}>
              {chart2}
            </Paper>
          </Box>
        </Stack>
      ))}
      <Stack width="100%" direction="row"></Stack>
    </Stack>
  );
}

export default DashboardCharts;
