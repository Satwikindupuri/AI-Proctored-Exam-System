import { useEffect, useState } from "react";
import api from "../api/api";

export default function LiveExams() {
  const [exams, setExams] = useState([]);

  useEffect(() => {
    api.get("/faculty/live-exams")
      .then(res => setExams(res.data))
      .catch(() => alert("Failed to load live exams"));
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h2>Live Exams</h2>

      {exams.length === 0 ? (
        <p>No live exams</p>
      ) : (
        <table border="1" cellPadding="10" cellSpacing="0">
          <thead>
            <tr>
              <th>Title</th>
              <th>Duration (min)</th>
              <th>Year</th>
              <th>Branch</th>
              <th>Section</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {exams.map((exam) => (
              <tr key={exam._id}>
                <td>{exam.title}</td>
                <td>{exam.duration}</td>
                <td>{exam.year}</td>
                <td>{exam.branch}</td>
                <td>{exam.section}</td>
                <td style={{ color: "green", fontWeight: "bold" }}>
                  LIVE
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}