import React, { useState, useEffect } from "react";
import { Box, Grid, CircularProgress } from "@mui/material";

import { useAuth } from "@shared/utils/AuthProvider";

import {
  HistoryHeader,
  HistoryFilter,
  HistoryChart,
  HistoryTable,
  ALL_MONTHS,
} from "../components/history";
import { getRecyclings } from "../services/history.js"

function History() {

    // Initialization of states    
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [historyRows, setHistoryRows] = useState([]);
    const [selectedMonths, setSelectedMonths] = useState([]);
    const [chartDataState, setChartDataState] = useState(
        ALL_MONTHS.map(month => ({ month, value: 0 }))
    );

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user || !user.user_id) {
                setLoading(false);
                return;
            }

            try {
                const response = await getRecyclings({ userId: user.user_id });
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
                <HistoryHeader />

                <Grid item xs={12} sm={8} sx={{ textAlign: 'left', width: '65%' }}>
                    <HistoryFilter
                        selectedMonths={selectedMonths}
                        handleMonthChange={handleMonthChange}
                    />

                    <Box sx={{ width: "100%", mb: 2 }}>
                        {loading ? (
                        <Box
                            sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            height: 300,
                            }}
                        >
                            <CircularProgress color="success" />
                        </Box>
                        ) : (
                        <HistoryChart data={filteredChartData} />
                        )}
                    </Box>
                </Grid>
            </Grid>

            <HistoryTable rows={historyRows} />
        </Box>
    );
}

export default History;