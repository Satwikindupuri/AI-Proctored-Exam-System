import { useEffect, useState } from "react";
import api from "../api/api";

export default function StudentDashboard() {
  const [exams, setExams] = useState([]);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await api.get("/student/exams/live");
        setExams(res.data);
      } catch (err) {
        alert("Failed to load exams");
      }
    };

    fetchExams();
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h2>Student Dashboard</h2>

      <h3>Live Exams</h3>

      {exams.length === 0 && <p>No live exams</p>}

      <ul>
        {exams.map((exam) => (
          <li key={exam._id}>
            <strong>{exam.title}</strong> — {exam.examType} —{" "}
            {exam.duration} mins
            <br />
            <button
              onClick={() =>
                (window.location.href = `/exam/${exam._id}`)
              }
            >
              Open Exam
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
