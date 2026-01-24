import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api.js";

export default function CompletedExamDetails() {
const { examId } = useParams();

const [attempts, setAttempts] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

useEffect(() => {
const loadAttempts = async () => {
try {
const res = await api.get(
`/faculty/exams/${examId}/attempts`
);

    if (Array.isArray(res.data)) {
      setAttempts(res.data);
    } else {
      setAttempts([]);
    }
  } catch (err) {
    console.error(err);
    setError("Failed to load attempts");
    setAttempts([]);
  } finally {
    setLoading(false);
  }
};

loadAttempts();
}, [examId]);

return (
<div style={{ padding: 30 }}>
<h2>Exam Attempts</h2>

  {/* Loading */}
  {loading && <p>Loading attempts...</p>}

  {/* Error */}
  {!loading && error && (
    <p style={{ color: "red" }}>{error}</p>
  )}

  {/* Empty */}
  {!loading && attempts.length === 0 && !error && (
    <p>No student attempts found</p>
  )}

  {/* Table */}
  {!loading && attempts.length > 0 && (
    <>
      <table
        border="1"
        cellPadding="8"
        style={{ borderCollapse: "collapse", width: "100%" }}
      >
        <thead>
          <tr>
            <th>Name</th>
            <th>Roll No</th>
            <th>Score</th>
            <th>Time Taken</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {attempts.map((a, i) => (
            <tr key={i}>
              <td>{a.student?.name}</td>
              <td>{a.student?.rollNo}</td>
              <td>{a.score}</td>
              <td>{a.timeTaken} mins</td>
              <td>
                {a.autoSubmitted ? (
                  <span style={{ color: "red", fontWeight: "bold" }}>
                    🚩 Auto Submitted
                  </span>
                ) : (
                  "Submitted"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Download Buttons */}
      <div style={{ marginTop: 20 }}>
        <a
          href={`http://localhost:5000/api/faculty/exams/${examId}/attempts/download`}
          target="_blank"
          rel="noreferrer"
        >
          <button>Download Attempts (Excel)</button>
        </a>

        <a
          href={`http://localhost:5000/api/faculty/exams/${examId}/questions/download`}
          target="_blank"
          rel="noreferrer"
          style={{ marginLeft: 10 }}
        >
          <button>Download Questions</button>
        </a>
      </div>
    </>
  )}
</div>
);
}