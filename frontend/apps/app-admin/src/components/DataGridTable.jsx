import { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box } from "@mui/material";

function DataGridTable({
  columns,
  refreshKey,
  fetchCallback,
  actionsColumn,
  pageSizes = [5, 10, 25, 50],
}) {
  const [rows, setRows] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchCallback({
        page: paginationModel.page + 1,
        page_size: paginationModel.pageSize,
      });

      if (Array.isArray(data)) {
        setRows(data);
        setRowCount(data.length);
      } else {
        setRows(data.results || []);
        setRowCount(data.count || 0);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [paginationModel, refreshKey]);

  const enhancedColumns = columns.map((col) => ({
    field: col.key,
    headerName: col.label,
    flex: col.flex || 1,
    width: col.width,
    sortable: col.sortable ?? false,
    renderCell: col.render
      ? (params) => col.render(params.value, params.row)
      : undefined,
  }));

  if (actionsColumn) {
    enhancedColumns.push({
      field: "__actions",
      headerName: "Ações",
      sortable: false,
      filterable: false,
      width: 120,
      align: "right",
      renderCell: (params) => actionsColumn(params.row),
    });
  }

  return (
    <Box>
      <DataGrid
        rows={rows}
        columns={enhancedColumns}
        rowCount={rowCount}
        loading={loading}
        pageSizeOptions={pageSizes}
        getRowId={(row) => row.id}
        pagination
        paginationMode="server"
        disableRowSelectionOnClick
        paginationModel={paginationModel}
        onPaginationModelChange={(model) => setPaginationModel(model)}
        sx={{
          borderRadius: "5px",
          color: "#212832",
          backgroundColor: "transparent",

          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "transparent",
            fontWeight: 600,
            color: "#212832",
          },

          "& .MuiDataGrid-columnHeaderTitle": {
            fontWeight: 600,
            fontSize: "0.9rem",
          },

          "& .MuiDataGrid-row:hover": {
            backgroundColor: "#f5f5f5",
          },

          "& .MuiDataGrid-footerContainer": {
            backgroundColor: "transparent",
          },

          "& .MuiTablePagination-displayedRows, & .MuiTablePagination-selectLabel": {
            color: "#212832",
          },

          "& .MuiTablePagination-actions button": {
            color: "#212832",
          },

          "& .MuiInputBase-root": {
            color: "#212832",
          },

          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
          
          '& .MuiDataGrid-cell:focus-within': {
            outline: 'none',
          },
        }}
      />
    </Box>
  );
}

export default DataGridTable;