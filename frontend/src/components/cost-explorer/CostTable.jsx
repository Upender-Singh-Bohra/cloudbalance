import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  TablePagination,
  Box,
} from "@mui/material";

const CostTable = ({ data }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState("total");
  const [order, setOrder] = useState("desc");

  if (!data || !data.groups || !data.timeUnits) return null;

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Sort data
  const sortedGroups = [...data.groups].sort((a, b) => {
    if (orderBy === "key") {
      return order === "asc"
        ? a.key.localeCompare(b.key)
        : b.key.localeCompare(a.key);
    } else if (orderBy === "total") {
      return order === "asc" ? a.total - b.total : b.total - a.total;
    } else {
      // Sort by a specific time period
      const aValue = a.values[orderBy] || 0;
      const bValue = b.values[orderBy] || 0;
      return order === "asc" ? aValue - bValue : bValue - aValue;
    }
  });

  // Apply pagination
  const paginatedGroups = sortedGroups.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Format currency
  const formatCurrency = (value) => {
    if (value === undefined || value === null) return "$0.00";
    return `$${Number(value).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <Box sx={{ width: "100%", overflow: "auto" }}>
      <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
        <Table
          stickyHeader
          aria-label="cost table"
          size="small"
          sx={{ minWidth: 650, width: "100%" }}
        >
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "key"}
                  direction={orderBy === "key" ? order : "asc"}
                  onClick={() => handleRequestSort("key")}
                >
                  {/* {data.groups[0]?.key
                    ? data.groups[0].key.split(" ")[0]
                    : "Service"} */}
                </TableSortLabel>
              </TableCell>
              {data.timeUnits.map((timeUnit) => (
                <TableCell align="right" key={timeUnit}>
                  <TableSortLabel
                    active={orderBy === timeUnit}
                    direction={orderBy === timeUnit ? order : "asc"}
                    onClick={() => handleRequestSort(timeUnit)}
                  >
                    {/* {timeUnit} */}
                  </TableSortLabel>
                </TableCell>
              ))}
              <TableCell align="right">
                <TableSortLabel
                  active={orderBy === "total"}
                  direction={orderBy === "total" ? order : "asc"}
                  onClick={() => handleRequestSort("total")}
                >
                  Total
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedGroups.map((group) => (
              <TableRow key={group.key} hover>
                <TableCell component="th" scope="row">
                  {group.key}
                </TableCell>
                {data.timeUnits.map((timeUnit) => (
                  <TableCell align="right" key={`${group.key}-${timeUnit}`}>
                    {formatCurrency(group.values[timeUnit])}
                  </TableCell>
                ))}
                <TableCell align="right" sx={{ fontWeight: "bold" }}>
                  {formatCurrency(group.total)}
                </TableCell>
              </TableRow>
            ))}
            {/* Totals row */}
            <TableRow
              sx={{
                "& th, & td": {
                  fontWeight: "bold",
                  backgroundColor: "#f5f5f5",
                },
              }}
            >
              <TableCell>Total</TableCell>
              {data.timeUnits.map((timeUnit) => (
                <TableCell align="right" key={`total-${timeUnit}`}>
                  {formatCurrency(data.totals[timeUnit])}
                </TableCell>
              ))}
              <TableCell align="right">
                {formatCurrency(
                  Object.values(data.totals).reduce(
                    (sum, val) => sum + Number(val),
                    0
                  )
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={data.groups.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
};

export default CostTable;
