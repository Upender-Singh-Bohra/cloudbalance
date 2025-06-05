import React from "react";
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";

/**
 * A reusable form field component that supports text fields and selects
 *
 * @param {Object} props - Component props
 * @param {string} props.type - Field type ('text' or 'select')
 * @param {string} props.id - Field ID
 * @param {string} props.name - Field name
 * @param {string} props.label - Field label
 * @param {string} props.value - Field value
 * @param {function} props.onChange - Change handler function
 * @param {function} props.onBlur - Blur handler function
 * @param {boolean} props.error - Whether the field has an error
 * @param {string} props.helperText - Helper text to display
 * @param {string} props.errorText - Error text to display when error is true
 * @param {boolean} props.required - Whether the field is required
 * @param {Array} props.options - Options for select fields
 * @param {Object} props.selectProps - Additional props for select fields
 * @param {Object} props.menuProps - Props for select menu
 */
const FormField = ({
  type = "text",
  id,
  name,
  label,
  value,
  onChange,
  onBlur,
  error = false,
  helperText,
  errorText,
  required = false,
  options = [],
  selectProps = {},
  menuProps = {},
  ...rest
}) => {
  const displayHelperText = error ? errorText : helperText;

  const handleChange = (e) => {
    onChange(name, e.target.value);
  };

  const handleBlur = () => {
    onBlur(name);
  };

  if (type === "select") {
    return (
      <FormControl fullWidth required={required} error={error} {...rest}>
        <InputLabel id={`${id}-label`}>{label}</InputLabel>
        <Select
          labelId={`${id}-label`}
          id={id}
          name={name}
          value={value || ""}
          label={label}
          onChange={handleChange}
          onBlur={handleBlur}
          MenuProps={{
            PaperProps: {
              sx: {
                maxHeight: 200,
              },
            },
            ...menuProps,
          }}
          {...selectProps}
        >
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
        {displayHelperText && (
          <FormHelperText>{displayHelperText}</FormHelperText>
        )}
      </FormControl>
    );
  }

  return (
    <TextField
      id={id}
      name={name}
      label={label}
      value={value || ""}
      onChange={handleChange}
      onBlur={handleBlur}
      helperText={displayHelperText}
      fullWidth
      error={error}
      required={required}
      {...rest}
    />
  );
};

export default FormField;
