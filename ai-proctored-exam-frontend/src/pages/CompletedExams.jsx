import { useEffect, useState } from "react";
import api from "../api/api";

export default function CompletedExams() {
  const [exams, setExams] = useState([]);

  useEffect(() => {
    api.get("/faculty/completed-exams")
      .then(res => setExams(res.data))
      .catch(() => alert("Failed to load completed exams"));
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h2>Completed Exams</h2>

      {exams.length === 0 && <p>No completed exams</p>}

      {exams.map((exam) => (
        <div key={exam.examId} style={{ marginBottom: 30 }}>
          <h3>{exam.title}</h3>

          {exam.attempts.length === 0 ? (
            <p>No attempts</p>
          ) : (
            <table border="1" cellPadding="10" cellSpacing="0">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Roll No</th>
                  <th>Score</th>
                  <th>Time Taken</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {exam.attempts.map((a, idx) => (
                  <tr key={idx}>
                    <td>{a.studentName}</td>
                    <td>{a.rollNo}</td>
                    <td>{a.score}</td>
                    <td>{a.durationTaken}</td>
                    <td>
                      {a.status === "AUTO_SUBMITTED" ? "🚩 Cheated" : "Normal"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ))}
    </div>
  );
}
