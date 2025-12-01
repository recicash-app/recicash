import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';

import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';


function parseValue(value, orderBy) {
  if (!value && value !== 0) return '';

  // Date: DD/MM/YYYY -> Timestamp
  if (orderBy === 'date' && typeof value === 'string') {
    const parts = value.split('/');
    if (parts.length === 3) {
      return new Date(parts[2], parts[1] - 1, parts[0]).getTime();
    }
  }

  // weight: "5.00" -> 5.00
  if (orderBy === 'weight') {
    return parseFloat(value);
  }

  // points number
  if (orderBy === 'points') {
    return Number(value);
  }

  return value;
}

function descendingComparator(a, b, orderBy) {

  const valA = parseValue(a[orderBy], orderBy);
  const valB = parseValue(b[orderBy], orderBy);

  if (valB < valA) return -1;
  if (valB > valA) return 1;
  return 0;

}

function getComparator(order, orderBy) {

  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);

}

function stableSort(array, comparator) {

  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  return stabilizedThis.map((el) => el[0]);
}

// Columns 
const headCells = [
  { id: 'date', label: 'Data', withDivider: true },
  { id: 'weight', label: 'Peso', withDivider: true },
  { id: 'points', label: 'Pontos', withDivider: false },
];

export default function HistoryTable({ rows = [] }) {

  // Initialization of states and hooks
  const rowsPerPage = 5;
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('date');
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeColumn, setActiveColumn] = useState(null);

  const pageCount = Math.max(1, Math.ceil(rows.length / rowsPerPage));

  useEffect(() => {

    if (page > pageCount - 1) {
      setPage(Math.max(0, pageCount - 1));
    }
    
  }, [rows.length, pageCount, page]);

  // Pagination
  const handlePrev = () => setPage((p) => Math.max(0, p - 1));
  const handleNext = () => setPage((p) => Math.min(pageCount - 1, p + 1));

  // Handles
  const handleOpenMenu = (event, columnId) => {
    setAnchorEl(event.currentTarget);
    setActiveColumn(columnId);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setActiveColumn(null);
  };

  const handleSort = (direction) => {
    if (activeColumn) {
      setOrderBy(activeColumn);
      setOrder(direction);
    }
    handleCloseMenu();
  };

  // Data processing
  const sortedRows = stableSort(rows, getComparator(order, orderBy));
  const visibleRows = sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Styles Cells
  const headerCellStyle = (withDivider) => ({
    fontWeight: 'bold',
    color: '#181E4B',
    position: 'relative',
    '&:not(:last-of-type)::after': withDivider ? {
      content: '""',
      position: 'absolute',
      right: 0,
      top: '30%',
      bottom: '30%',
      width: '1px',
      backgroundColor: 'rgba(224, 224, 224, 1)'
    } : {},
    '&:hover .column-actions': {
      opacity: 1,
    }
  });

  return (
    <Box sx={{ width: '100%', mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, width: '100%' }}>
        <IconButton sx={{ color: '#999' }} onClick={handlePrev} disabled={page <= 0}>
          <NavigateBeforeIcon fontSize="large" />
        </IconButton>

        <TableContainer component={Paper} elevation={0} sx={{ flex: 1, borderRadius: '16px', border: '1px solid #E0E0E0' }}>
          <Table aria-label="tabela de historico" sx={{ width: '100%' }}>
            <TableHead sx={{ backgroundColor: '#F8F9FA' }}>
              <TableRow>
                {headCells.map((headCell) => (
                  <TableCell
                    key={headCell.id}
                    sx={headerCellStyle(headCell.withDivider)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <span style={{ userSelect: 'none' }}>
                        {headCell.label}
                        {orderBy === headCell.id && (
                          <span style={{ marginLeft: 4, fontSize: '0.7em', color: '#5E6282', verticalAlign: 'middle' }}>
                            {order === 'asc' ? '▲' : '▼'}
                          </span>
                        )}
                      </span>

                      <IconButton
                        size="small"
                        className="column-actions"
                        onClick={(e) => handleOpenMenu(e, headCell.id)}
                        sx={{ 
                          opacity: 0,
                          transition: 'opacity 0.2s', 
                          padding: '2px',
                          color: '#5E6282',
                          '&:hover': { backgroundColor: 'rgba(0,0,0,0.05)' }
                        }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {visibleRows.map((row, index) => (
                <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell sx={{ color: '#5E6282' }}>{row.date}</TableCell>
                  <TableCell sx={{ color: '#5E6282' }}>{row.weight} kg</TableCell>
                  <TableCell>
                    <Chip label={`+ ${row.points}`} size="small" sx={{ bgcolor: '#E8F5E9', color: '#2E7D32', fontWeight: 'bold' }} />
                  </TableCell>
                </TableRow>
              ))}
              {visibleRows.length === 0 && (
                  <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                          Nenhum registro encontrado.
                      </TableCell>
                  </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <IconButton sx={{ color: '#999' }} onClick={handleNext} disabled={page >= pageCount - 1}>
          <NavigateNextIcon fontSize="large" />
        </IconButton>
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1, color: '#666', fontSize: 13 }}>
        Página {page + 1} de {pageCount}
      </Box>

      {/* Sorting Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          elevation: 3,
          sx: { minWidth: 180, borderRadius: 2, mt: 1 }
        }}
      >
        <MenuItem onClick={() => handleSort('asc')} selected={orderBy === activeColumn && order === 'asc'}>
          <ListItemIcon>
            <ArrowUpwardIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Ordenar Crescente</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleSort('desc')} selected={orderBy === activeColumn && order === 'desc'}>
          <ListItemIcon>
            <ArrowDownwardIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Ordenar Decrescente</ListItemText>
        </MenuItem>
      </Menu>

    </Box>
  );
}