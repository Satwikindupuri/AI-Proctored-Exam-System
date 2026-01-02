import { useEffect, useState } from "react";
import api from "../api/api";

export default function FlaggedStudents() {
  const [data, setData] = useState([]);

  useEffect(() => {
    api.get("/faculty/flagged-students")
      .then(res => setData(res.data))
      .catch(() => alert("Failed to load flagged students"));
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h2>🚩 Flagged Students</h2>

      {data.length === 0 ? (
        <p>No flagged students</p>
      ) : (
        <table border="1" cellPadding="10" cellSpacing="0">
          <thead>
            <tr>
              <th>Name</th>
              <th>Roll No</th>
              <th>Class</th>
              <th>Exam</th>
              {/* <th>Violations</th> */}
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx}>
                <td>{row.studentName}</td>
                <td>{row.rollNo}</td>
                <td>{row.class}</td>
                <td>{row.examTitle}</td>
                {/* <td style={{ color: "red", fontWeight: "bold" }}>
                  {row.violationsCount}
                </td> */}
                <td>
                  {row.submissionType === "AUTO_SUBMITTED" ? "🚩 Auto" : "Manual"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
