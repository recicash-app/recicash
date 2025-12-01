import {
  Box,
  FormControl,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import { ALL_MONTHS } from ".";

const MenuProps = {
  PaperProps: { style: { maxHeight: 224, width: 200 } },
};

export default function HistoryFilter({ selectedMonths, handleMonthChange }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        mb: 2,
        pr: 2,
      }}
    >
      <FormControl sx={{ m: 1, width: 110 }} size="small">
        <Select
          multiple
          displayEmpty
          value={selectedMonths}
          onChange={handleMonthChange}
          input={
            <OutlinedInput
              sx={{
                height: "40px",
                width: "102px",
                borderRadius: "5px",
                color: "#D9D9D9",
              }}
            />
          }
          renderValue={() => "Filtro"}
          MenuProps={MenuProps}
          IconComponent={FilterListIcon}
        >
          <MenuItem value="Todos">
            <Checkbox checked={selectedMonths.length === ALL_MONTHS.length} />
            <ListItemText primary="Todos" />
          </MenuItem>

          {ALL_MONTHS.map((month) => (
            <MenuItem key={month} value={month}>
              <Checkbox checked={selectedMonths.includes(month)} />
              <ListItemText primary={month} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}