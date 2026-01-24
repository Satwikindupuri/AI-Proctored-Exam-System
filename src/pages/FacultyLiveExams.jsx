import { useEffect, useState } from "react";
import api from "../api/api.js";

export default function FacultyLiveExams() {
const [exams, setExams] = useState([]);
const [filters, setFilters] = useState({
year: "",
branch: "",
section: ""
});

const loadExams = async () => {
const params = {};
if (filters.year) params.year = filters.year;
if (filters.branch) params.branch = filters.branch;
if (filters.section) params.section = filters.section;

const res = await api.get("/faculty/exams/live", { params });
setExams(res.data);
};

useEffect(() => {
loadExams();
}, []);

return (
<div style={{ padding: 30 }}>
<h2>Live Exams</h2>

  {/* Filters */}
  <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
    <input
      placeholder="Year"
      value={filters.year}
      onChange={e => setFilters({ ...filters, year: e.target.value })}
    />
    <input
      placeholder="Branch"
      value={filters.branch}
      onChange={e => setFilters({ ...filters, branch: e.target.value })}
    />
    <input
      placeholder="Section"
      value={filters.section}
      onChange={e => setFilters({ ...filters, section: e.target.value })}
    />

    <button onClick={loadExams}>Apply</button>
    <button
      onClick={() => {
        setFilters({ year: "", branch: "", section: "" });
        setTimeout(loadExams, 0);
      }}
    >
      Clear
    </button>
  </div>

  {/* Exams List */}
  {exams.length === 0 && <p>No live exams found</p>}

  {exams.map(exam => (
    <div
      key={exam._id}
      style={{
        border: "1px solid #ccc",
        padding: 15,
        marginBottom: 15,
        borderRadius: 6
      }}
    >
      <h3>{exam.title}</h3>
      <p>
        {exam.year} - {exam.branch} - {exam.section}
      </p>
      <p>Duration: {exam.duration} mins</p>

      <button
        style={{
          marginTop: 10,
          backgroundColor: "#dc3545",
          color: "white",
          border: "none",
          padding: "8px 14px",
          borderRadius: 4,
          cursor: "pointer"
        }}
        onClick={async () => {
          if (!window.confirm("Are you sure you want to end this exam?")) return;

          try {
            await api.patch(`/faculty/exams/${exam._id}/end`);
            alert("Exam ended");

            // Remove exam from list immediately
            setExams(prev => prev.filter(e => e._id !== exam._id));
          } catch (err) {
            alert("Failed to end exam");
          }
        }}
      >
        End Exam
      </button>
    </div>
  ))}
</div>
);
}