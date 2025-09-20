import React from "react";
import Stack from "@mui/material/Stack";
import OverallPlantExpensesChart from "./OverallPlantExpensesChart";
import TopExpenseChart from "./TopExpenseChart";
import SupplierDataChart from "./SupplierDataChart";

function DashboardCharts() {
  return (
    <Stack width="100%" direction="column">
      <Stack width="100%" direction="row">
        <OverallPlantExpensesChart />
        <TopExpenseChart />
      </Stack>
      <SupplierDataChart />
    </Stack>
  );
}

export default DashboardCharts;
