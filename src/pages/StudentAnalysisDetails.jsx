import { useLocation, useNavigate } from "react-router-dom";
import {
BarChart,
Bar,
XAxis,
YAxis,
Tooltip,
ResponsiveContainer
} from "recharts";

export default function StudentAnalysisDetails() {
const { state } = useLocation();
const navigate = useNavigate();

if (!state) {
return <p>No student data available</p>;
}

const chartData = [
{
name: "Attempts",
value: state.totalAttempts
},
{
name: "Auto Submits",
value: state.autoSubmittedCount
},
{
name: "Avg Score",
value: state.avgScore
}
];

return (
<div className="page-container">
<button onClick={() => navigate(-1)}>← Back</button>

  <h2>Student Analysis Report</h2>

  <div className="card">
    <h3>{state.name}</h3>
    <p>{state.rollNo} · {state.class}</p>
    <p><b>Risk Level:</b> {state.riskLevel}</p>
  </div>

  {/* Chart */}
  <div className="card">
    <h4>Performance Overview</h4>

    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" />
      </BarChart>
    </ResponsiveContainer>
  </div>

  {/* Summary */}
  <div className="card">
    <p><b>Total Exams:</b> {state.totalAttempts}</p>
    <p><b>Auto Submits:</b> {state.autoSubmittedCount}</p>
    <p><b>Average Score:</b> {state.avgScore}</p>
  </div>
</div>
);
}