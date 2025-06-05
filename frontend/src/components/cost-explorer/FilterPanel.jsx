import React, { useState } from "react";
import {
  FormControl,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Typography,
  Box,
  TextField,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const filterConfig = [
  { key: "services", label: "Service", valueKey: "Service" },
  { key: "instanceTypes", label: "Instance Type", valueKey: "InstanceType" },
  { key: "usageTypes", label: "Usage Type", valueKey: "UsageType" },
  { key: "platforms", label: "Platform", valueKey: "Platform" },
  { key: "regions", label: "Region", valueKey: "Region" },
  {
    key: "usageTypeGroups",
    label: "Usage Type Group",
    valueKey: "UsageTypeGroup",
  },
  {
    key: "purchaseOptions",
    label: "Purchase Option",
    valueKey: "PurchaseOption",
  },
  { key: "apiOperations", label: "API Operation", valueKey: "ApiOperation" },
  { key: "resources", label: "Resource", valueKey: "Resource" },
  {
    key: "availabilityZones",
    label: "Availability Zone",
    valueKey: "AvailabilityZone",
  },
  { key: "tenancies", label: "Tenancy", valueKey: "Tenancy" },
  { key: "chargeTypes", label: "Charge Type", valueKey: "ChargeType" },
];

const FilterPanel = ({ filterValues, selectedFilters, onFilterChange }) => {
  // Add search state for each filter
  const [searchTerms, setSearchTerms] = useState(
    Object.fromEntries(filterConfig.map((filter) => [filter.key, ""]))
  );

  const handleChange = (filterKey, selectedValues) => {
    onFilterChange(filterKey, selectedValues);
  };

  const handleSearchChange = (filterKey, term) => {
    setSearchTerms((prev) => ({
      ...prev,
      [filterKey]: term,
    }));
  };

  // Function to filter options based on search term
  const getFilteredOptions = (options, filterKey) => {
    if (!options || !Array.isArray(options)) return [];
    if (!searchTerms[filterKey]) return options;

    const term = searchTerms[filterKey].toLowerCase();
    return options.filter((option) =>
      String(option).toLowerCase().includes(term)
    );
  };

  // Create a handler for checkbox clicks to stop propagation
  const handleCheckboxClick = (event, filterKey, value) => {
    event.stopPropagation();
    const currentIndex = selectedFilters[filterKey].indexOf(value);
    const newChecked = [...selectedFilters[filterKey]];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    handleChange(filterKey, newChecked);
  };

  return (
    <Box>
      {filterConfig.map((filter) => {
        const options = Array.isArray(filterValues[filter.valueKey])
          ? filterValues[filter.valueKey]
          : [];
        const filteredOptions = getFilteredOptions(options, filter.key);

        return (
          <Box key={filter.key} sx={{ mb: 2.5 }}>
            <Typography
              variant="subtitle2"
              sx={{ mb: 0.75, fontSize: "0.875rem", fontWeight: 500 }}
            >
              {filter.label}
            </Typography>

            <FormControl fullWidth size="small">
              <Select
                multiple
                value={selectedFilters[filter.key]}
                onChange={(e) => handleChange(filter.key, e.target.value)}
                displayEmpty
                renderValue={(selected) => {
                  if (selected.length === 0) {
                    return (
                      <Typography color="text.secondary" variant="body2">
                        Select {filter.label}
                      </Typography>
                    );
                  }
                  return (
                    <Typography variant="body2">
                      {selected.length} selected
                    </Typography>
                  );
                }}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: ITEM_HEIGHT * 8,
                      width: "auto",
                      minWidth: 250,
                      maxWidth: 300,
                    },
                  },
                  anchorOrigin: {
                    vertical: "bottom",
                    horizontal: "left",
                  },
                }}
              >
                <MenuItem disableRipple style={{ padding: "8px" }}>
                  <TextField
                    size="small"
                    placeholder="Search..."
                    fullWidth
                    value={searchTerms[filter.key]}
                    onChange={(e) =>
                      handleSearchChange(filter.key, e.target.value)
                    }
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </MenuItem>

                <MenuItem disabled>
                  <Typography variant="caption">
                    Showing {filteredOptions.length} of {options.length} results
                  </Typography>
                </MenuItem>

                {filteredOptions.length > 0 ? (
                  filteredOptions.map((value) => (
                    <MenuItem
                      key={value}
                      value={value}
                      sx={{
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                      }}
                    >
                      <Checkbox
                        checked={
                          selectedFilters[filter.key].indexOf(value) > -1
                        }
                        onClick={(e) =>
                          handleCheckboxClick(e, filter.key, value)
                        }
                      />
                      <ListItemText
                        primary={value}
                        primaryTypographyProps={{
                          style: {
                            whiteSpace: "normal",
                            overflowWrap: "break-word",
                          },
                        }}
                      />
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No matching options</MenuItem>
                )}
              </Select>
            </FormControl>
          </Box>
        );
      })}
    </Box>
  );
};

export default FilterPanel;
