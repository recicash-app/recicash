import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

function DataTable({ columns, rows, renderActions }) {
  return (
    <TableContainer component={Paper} elevation={1}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell key={col.key} align={col.align || "left"}>
                <strong>{col.label}</strong>
              </TableCell>
            ))}
            {renderActions && (
              <TableCell align="right">
                <strong>Ações</strong>
              </TableCell>
            )}
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              {columns.map((col) => (
                <TableCell key={col.key} align={col.align || "left"}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </TableCell>
              ))}

              {renderActions && (
                <TableCell align="right">{renderActions(row)}</TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DataTable;
