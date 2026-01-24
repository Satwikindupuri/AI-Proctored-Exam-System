import { useState } from "react";
import api from "../api/api.js";
import { useNavigate } from "react-router-dom";

export default function FacultyStudentAnalysis() {
const [year, setYear] = useState("");
const [branch, setBranch] = useState("");
const [section, setSection] = useState("");

const [students, setStudents] = useState([]);
const [selectedStudentId, setSelectedStudentId] = useState(null);

const navigate = useNavigate();

const fetchStudents = async () => {
try {
const res = await api.get("/faculty/student-analysis", {
params: { year, branch, section }
});
setStudents(res.data);
setSelectedStudentId(null); // reset details
} catch (err) {
console.error(err);
alert("Failed to load student analysis");
}
};

const toggleDetails = (studentId) => {
setSelectedStudentId(
selectedStudentId === studentId ? null : studentId
);
};

return (
<div className="page-container">
<h2>Student Analysis</h2>

  {/* Filters */}
  <div className="filters">
    <input
      placeholder="Year"
      value={year}
      onChange={(e) => setYear(e.target.value)}
    />
    <input
      placeholder="Branch"
      value={branch}
      onChange={(e) => setBranch(e.target.value)}
    />
    <input
      placeholder="Section"
      value={section}
      onChange={(e) => setSection(e.target.value)}
    />
    <button onClick={fetchStudents}>Fetch</button>
  </div>

  {/* Student List */}
  <div className="student-list">
    {students.length === 0 && (
      <p>No students found</p>
    )}

    {students.map((student) => (
      <div key={student.studentId} className="student-card">
        <div className="student-summary">
          <div>
            <strong>{student.name}</strong>
            <p>{student.rollNo} · {student.class}</p>
          </div>

          <span className={`risk ${student.riskLevel.replace(" ", "").toLowerCase()}`}>
            {student.riskLevel}
          </span>

          <button
            onClick={() =>
              navigate(`/faculty/student-analysis/${student.studentId}`, {
                state: student
              })
            }
          >
            View Details
          </button>
        </div>

        {/* Details Section */}
        {selectedStudentId === student.studentId && (
          <div className="student-details">
            <p><b>Exams Attempted:</b> {student.totalAttempts}</p>
            <p><b>Auto Submits:</b> {student.autoSubmittedCount}</p>
            <p><b>Average Score:</b> {student.avgScore}</p>
          </div>
        )}
      </div>
    ))}
  </div>
</div>
);
}