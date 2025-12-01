import { BarChart } from "@mui/x-charts/BarChart";

export default function HistoryChart({ data }) {
  return (
    <BarChart
      dataset={data}
      xAxis={[
        {
          scaleType: "band",
          dataKey: "month",
          categoryGapRatio: 0.4,
          barGapRatio: 0.1,
          tickLabelStyle: {
            fontSize: 12,
            angle: -35,
            textAnchor: "end",
            dominantBaseline: "hanging",
          },
        },
      ]}
      series={[{ dataKey: "value", color: "#93B17D" }]}
      borderRadius={10}
      height={300}
      margin={{ left: 40, right: 10, top: 10, bottom: 70 }}
      grid={{ horizontal: true }}
    />
  );
}