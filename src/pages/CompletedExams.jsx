import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api.js";

export default function CompletedExams() {
const navigate = useNavigate();

// ✅ IMPORTANT: initialize as ARRAY
const [exams, setExams] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

useEffect(() => {
const loadCompletedExams = async () => {
try {
const res = await api.get("/faculty/exams/completed");

    // Safety check
    if (Array.isArray(res.data)) {
      setExams(res.data);
    } else {
      setExams([]);
    }
  } catch (err) {
    console.error(err);
    setError("Failed to load completed exams");
    setExams([]);
  } finally {
    setLoading(false);
  }
};

loadCompletedExams();
}, []);

return (
<div style={{ padding: 30 }}>
<h2>Completed Exams</h2>

  {/* Loading */}
  {loading && <p>Loading completed exams...</p>}

  {/* Error */}
  {!loading && error && <p style={{ color: "red" }}>{error}</p>}

  {/* Empty state */}
  {!loading && exams.length === 0 && !error && (
    <p>No completed exams found</p>
  )}

  {/* Exams List */}
  {!loading &&
    exams.map((exam) => (
      <div
        key={exam._id}
        style={{
          border: "1px solid #ccc",
          padding: 15,
          marginBottom: 15,
          borderRadius: 6,
          cursor: "pointer"
        }}
        onClick={() =>
          navigate(`/faculty/completed/${exam._id}`)
        }
      >
        <h3>{exam.title}</h3>
        <p>
          {exam.year} – {exam.branch} – {exam.section}
        </p>
        <p>Duration: {exam.duration} mins</p>
        <p>
          Ended At:{" "}
          {exam.endTime
            ? new Date(exam.endTime).toLocaleString()
            : "N/A"}
        </p>
      </div>
    ))}
</div>
);
}