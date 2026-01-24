import { useEffect, useState } from "react";
import api from "../api/api";

export default function FlaggedStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFlagged = async () => {
      try {
        const res = await api.get("/faculty/flagged");
        setStudents(res.data);
      } catch (err) {
        console.error(err);
        alert("Failed to load flagged students");
      } finally {
        setLoading(false);
      }
    };

    loadFlagged();
  }, []);

  if (loading) return <p>Loading flagged students...</p>;

  if (students.length === 0)
    return <p>No flagged students found.</p>;

  return (
    <div style={{ padding: "30px" }}>
      <h2>🚩 Flagged Students</h2>

      {students.map((s, idx) => (
        <div key={idx} style={cardStyle}>
          <div style={colStyle}>
            {s.submissionType === "AUTO_SUBMITTED" ? "🚩" : "Manual"}
          </div>

          <div style={colStyle}><b>{s.name}</b></div>
          <div style={colStyle}>{s.rollNo}</div>
          <div style={colStyle}>{s.class}</div>
          <div style={colStyle}>{s.examTitle}</div>

          {/* <div style={colStyle}>
            <span style={badgeStyle}>
              {s.violationsCount} Violations
            </span>
          </div> */}

        </div>
      ))}
    </div>
  );
}

const cardStyle = {
  display: "grid",
  gridTemplateColumns: "2fr 1.5fr 1.5fr 2fr ",
  padding: "15px",
  marginBottom: "12px",
  background: "#1e1e1e",
  borderRadius: "10px",
  alignItems: "center",
  color: "white",
};

const colStyle = {
  padding: "0 10px",
};

const badgeStyle = {
  background: "#ff4d4f",
  padding: "5px 10px",
  borderRadius: "12px",
  fontSize: "12px",
};
