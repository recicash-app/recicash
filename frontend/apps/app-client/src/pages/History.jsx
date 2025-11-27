import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Select,
  MenuItem,
  FormControl,
  ListItemText,
  Checkbox,
  OutlinedInput,
  CircularProgress
} from "@mui/material";
import { useTheme } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import FilterListIcon from '@mui/icons-material/FilterList';

import api from "../utils/api"; 
import LeafBox from "@shared/ui/LeafBox";
import HistoryTable from "../components/HistoryTable";  


const MenuProps = {
  PaperProps: {
    style: { maxHeight: 224, width: 200 },
  },
};

const ALL_MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

function History() {

    // Initialization of states and hooks
    const theme = useTheme();
    
    const [loading, setLoading] = useState(true);
    const [historyRows, setHistoryRows] = useState([]);
    const [selectedMonths, setSelectedMonths] = useState([]);
    const [chartDataState, setChartDataState] = useState(
        ALL_MONTHS.map(month => ({ month, value: 0 }))
    );


    // Fetches recyclings
    const fetchGetRecyclings = async (userId) => {

        return api.get(`/recyclings/?user_id=${userId}&status=REDEEMED`);
    }
    
    

    // Busca e processa dados do Backend
    useEffect(() => {
        const fetchHistory = async () => {
            const userId = localStorage.getItem('user_id');
            
            if (!userId) {
                setLoading(false);
                return;
            }

            try {
                const response = await fetchGetRecyclings(userId);
                const dataList = Array.isArray(response.data) ? response.data : (response.data.results || []);

                // Graphics and Table Data Processing
                const monthlyTotals = new Array(12).fill(0);

                dataList.forEach(item => {

                    const date = new Date(item.date);
                    const monthIndex = date.getMonth();

                    monthlyTotals[monthIndex] += 1; 
                    
                });

                const newChartData = ALL_MONTHS.map((month, index) => ({
                    month: month,
                    value: monthlyTotals[index]
                }));

                setChartDataState(newChartData);

                const formattedRows = dataList.map(item => ({

                    // Data Formatting to DD/MM/YYYY
                    date: new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                    points: item.points_value,
                    weight: parseFloat(item.weight).toFixed(2)

                }));

                setHistoryRows(formattedRows);

            } 
            catch (error) {
                console.error("Erro ao carregar histórico:", error);
            } 
            finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    // Handle month filter change
    const handleMonthChange = (event) => {

        const { target: { value } } = event;
        if (value.includes("Todos")) {
           if (selectedMonths.length === ALL_MONTHS.length) {
             setSelectedMonths([]);
           } 
           else {
             setSelectedMonths(ALL_MONTHS);
           }
           return;
        }
        setSelectedMonths(typeof value === 'string' ? value.split(',') : value);
    };


    const filteredChartData = selectedMonths.length === 0 
        ? chartDataState 
        : chartDataState.filter(item => selectedMonths.includes(item.month));

    return (
        <Box sx={{ width: "auto", overflowX: "hidden" }}>
            <Grid container spacing={5} alignItems="center">
                
                
                <Grid item xs={12} sm={4} sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '30%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <LeafBox sx={{ gridRow: "2", 
                gridColumn: "1",
                borderRadius: "150px 0px",
                 }}>
                            <Box component="img" src="/icon-recycle.svg" alt="recycle icon" sx={{ userSelect: "none", pointerEvent: "none"}} />
                        </LeafBox>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: "bold", color: "#5E6282", fontFamily: "Poppins", textAlign: "center", pl: 2 }}>
                        Histórico de Reciclagens
                    </Typography>
                </Grid>

                {/* Graphic */}
                <Grid item xs={12} sm={8} sx={{ textAlign: 'left', width: '65%' }}>
                    <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", mb: 2, pr: 2 }}>
                        <FormControl sx={{ m: 1, width: 110 }} size="small">
                            <Select
                                multiple
                                displayEmpty
                                value={selectedMonths}
                                onChange={handleMonthChange}
                                input={<OutlinedInput sx={{ height: '40px', width: '102px', borderRadius: '5px', outline: 'none', color: '#D9D9D9' }} />}
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
                                        <Checkbox checked={selectedMonths.indexOf(month) > -1} />
                                        <ListItemText primary={month} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    <Box sx={{ height: '100%', width: '100%', mb: 2 }}>
                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                                <CircularProgress color="success" />
                            </Box>
                        ) : (
                            <BarChart
                                dataset={filteredChartData}
                                xAxis={[{ 
                                    scaleType: 'band', 
                                    dataKey: 'month',
                                    categoryGapRatio: 0.4, 
                                    barGapRatio: 0.1,
                                    tickInterval: (value, index) => true,
                                    tickLabelStyle: { fontSize: 12, angle: -35, textAnchor: 'end', dominantBaseline: 'hanging' } 
                                }]}
                                series={[{ dataKey: 'value', color: '#93B17D' }]}
                                borderRadius={10}
                                height={300}
                                margin={{ left: 40, right: 10, top: 10, bottom: 70 }}
                                grid={{ horizontal: true }}
                            />
                        )}
                    </Box>
                </Grid>
            </Grid>

            {/* Table */}
            <HistoryTable rows={historyRows} />
            
        </Box>
    );
}

export default History;