import React from "react";
import FusionCharts from "fusioncharts";
import Charts from "fusioncharts/fusioncharts.charts";
import ReactFC from "react-fusioncharts";
import FusionTheme from "fusioncharts/themes/fusioncharts.theme.fusion";
import { Box, CircularProgress } from "@mui/material";

// Add deps
ReactFC.fcRoot(FusionCharts, Charts, FusionTheme);

const CostBarChart = ({ data }) => {
  if (!data || !data.groups || !data.timeUnits) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "400px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Generate colors for each group
  const generateColors = () => {
    return [
      "#2E93fA",
      "#66DA26",
      "#546E7A",
      "#E91E63",
      "#FF9800",
      "#1565C0",
      "#43A047",
      "#5E35B1",
      "#D81B60",
      "#FFA000",
      "#0288D1",
      "#388E3C",
      "#7B1FA2",
      "#C2185B",
      "#FFB300",
    ];
  };

  // Sort groups by total cost descending
  const sortedGroups = [...data.groups].sort((a, b) => b.total - a.total);

  // Take top 10 for better visualization
  const top10Groups = sortedGroups.slice(0, 10);

  // Transform data for FusionCharts
  const categories = [
    {
      category: data.timeUnits.map((time) => ({
        label: time,
      })),
    },
  ];

  const dataset = top10Groups.map((group, index) => {
    return {
      seriesname: group.key,
      color: generateColors()[index % generateColors().length],
      data: data.timeUnits.map((time) => ({
        value: group.values[time]
          ? parseFloat(group.values[time]).toFixed(2)
          : "0",
      })),
    };
  });

  const chartConfig = {
    type: "mscolumn2d",
    width: "100%",
    height: "400",
    dataFormat: "json",
    containerBackgroundOpacity: "0",
    dataSource: {
      chart: {
        caption: "Monthly Cost Breakdown",
        subCaption:
          "By " +
          (data.groups[0]?.key ? data.groups[0].key.split(" ")[0] : "Service"),
        xAxisName: "Month",
        yAxisName: "Cost ($)",
        theme: "fusion",
        showValues: "0",
        plotSpacePercent: "40",
        showHoverEffect: "1",
        legendPosition: "bottom",
        drawCustomLegendIcon: "1",
        showLegend: "1",
        legendIconBorderThickness: "1",
        legendIconBorderColor: "#666666",
        showYAxisValues: "1",
        showXAxisLine: "1",
        showYAxisLine: "1",
        showAlternateHGridColor: "0",
        formatNumberScale: "0",
        numberPrefix: "$",
        divlineAlpha: "40",
        divlineDashed: "1",
        divlineDashLen: "2",
        divlineDashGap: "2",
        labelDisplay: "auto",
        rotateLabels: "0",
        slantLabels: "0",
        labelFontSize: "12",
        labelStep: "1",
        canvasBorderThickness: "1",
        canvasBorderColor: "#cccccc",
        canvasBgColor: "#ffffff",
        bgColor: "#ffffff",
        usePlotGradientColor: "0",
        // Disable export to prevent the excelexport.js error
        exportEnabled: "0",
        exportFileName: "CostExplorer",
        // Add responsive settings
        chartLeftMargin: "0",
        chartRightMargin: "0",
        canvasLeftMargin: "0",
        canvasRightMargin: "0",
      },
      categories: categories,
      dataset: dataset,
    },
  };

  return (
    <Box sx={{ width: "100%", height: "400px", overflow: "hidden" }}>
      <ReactFC {...chartConfig} />
    </Box>
  );
};

export default CostBarChart;
