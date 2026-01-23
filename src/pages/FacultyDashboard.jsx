import { useNavigate } from "react-router-dom";

export default function FacultyDashboard() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 40 }}>
      <h2>Faculty Dashboard</h2>

      <button onClick={() => navigate("/faculty/flagged")}>
        🚩 Flagged Students
      </button>

      <button onClick={() => navigate("/faculty/completed")}>
        📄 Completed Exams
      </button>

      <button onClick={() => navigate("/faculty/live-exams")}>
        🟢 Live Exams
      </button>
      
      <button onClick={() => navigate("/faculty/create-exam")}>
        ➕ Create Exam
      </button>
    </div>
  );
}
