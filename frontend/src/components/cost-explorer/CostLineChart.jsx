import React from "react";
import FusionCharts from "fusioncharts";
import Charts from "fusioncharts/fusioncharts.charts";
import ReactFC from "react-fusioncharts";
import FusionTheme from "fusioncharts/themes/fusioncharts.theme.fusion";
import { Box, CircularProgress } from "@mui/material";

// Add deps
ReactFC.fcRoot(FusionCharts, Charts, FusionTheme);

const CostLineChart = ({ data }) => {
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
    const colors = [
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
    ];
    return colors;
  };

  // Transform data for FusionCharts
  const categories = [
    {
      category: data.timeUnits.map((time) => ({
        label: time,
      })),
    },
  ];

  // Take top 5 services by cost for line chart to avoid clutter
  const sortedGroups = [...data.groups].sort((a, b) => b.total - a.total);
  const top5Groups = sortedGroups.slice(0, 5);

  const dataset = top5Groups.map((group, index) => {
    return {
      seriesname: group.key,
      color: generateColors()[index],
      anchorBorderColor: generateColors()[index],
      anchorBgColor: "#FFFFFF",
      lineThickness: "2",
      data: data.timeUnits.map((time) => ({
        value: group.values[time]
          ? parseFloat(group.values[time]).toFixed(2)
          : "0",
      })),
    };
  });

  // Add total as another line
  const totalCosts = data.timeUnits.map((time) =>
    data.groups.reduce((sum, group) => sum + (group.values[time] || 0), 0)
  );

  dataset.push({
    seriesname: "Total",
    color: "#000000",
    anchorBorderColor: "#000000",
    anchorBgColor: "#FFFFFF",
    lineThickness: "3",
    data: data.timeUnits.map((time, index) => ({
      value: totalCosts[index].toFixed(2),
    })),
  });

  const chartConfig = {
    type: "msline",
    width: "100%",
    height: "400",
    dataFormat: "json",
    containerBackgroundOpacity: "0",
    dataSource: {
      chart: {
        caption: "Cost Trends Over Time",
        subCaption: "Top 5 Services by Cost + Total",
        xAxisName: "Month",
        yAxisName: "Cost ($)",
        theme: "fusion",
        showValues: "0",
        showHoverEffect: "1",
        lineThickness: "2",
        anchorRadius: "4",
        anchorBorderThickness: "2",
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
        // Disable export to prevent the excelexport.js error
        exportEnabled: "0",
        exportFileName: "CostTrends",
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

export default CostLineChart;
