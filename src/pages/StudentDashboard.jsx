import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Use this instead of window.location
import api from "../api/api";

export default function StudentDashboard() {
  const [exams, setExams] = useState([]);
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await api.get("/student/exams/live");
        console.log("Exams Data:", res.data); // 👈 DEBUG: Check exactly what 'examType' says
        setExams(res.data);
      } catch (err) {
        alert("Failed to load exams");
      }
    };
    fetchExams();
  }, []);

  const handleOpenExam = (exam) => {
    // 1. Log the type to your console so you can see why it picks which route
    console.log(`Navigating to ${exam.examType} exam: ${exam._id}`);

    // 2. Make the check case-insensitive and robust
    const type = exam.examType?.toLowerCase();

    if (type === "coding") {
      navigate(`/coding-exam/${exam._id}`);
    } else {
      navigate(`/exam/${exam._id}`);
    }
  };

  return (
    <div style={{ padding: 40, backgroundColor: '#121212', minHeight: '100vh', color: 'white' }}>
      <h2>Student Dashboard</h2>
      <h3>Live Exams</h3>

      {exams.length === 0 && <p>No live exams available right now.</p>}

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {exams.map((exam) => (
          <li key={exam._id} style={{ 
            padding: '20px', 
            border: '1px solid #333', 
            marginBottom: '10px', 
            borderRadius: '8px',
            backgroundColor: '#1e1e1e' 
          }}>
            <strong>{exam.title}</strong> 
            <span style={{ margin: '0 10px', color: '#888' }}>|</span>
            <span style={{ textTransform: 'capitalize' }}>{exam.examType}</span>
            <span style={{ margin: '0 10px', color: '#888' }}>|</span>
            {exam.duration} mins
            <br /><br />
            <button
              style={{
                padding: '8px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
              onClick={() => handleOpenExam(exam)}
            >
              Open Exam
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}


// import { useEffect, useState } from "react";
// import api from "../api/api";

// export default function StudentDashboard() {
//   const [exams, setExams] = useState([]);

//   useEffect(() => {
//     const fetchExams = async () => {
//       try {
//         const res = await api.get("/student/exams/live");
//         setExams(res.data);
//       } catch (err) {
//         alert("Failed to load exams");
//       }
//     };

//     fetchExams();
//   }, []);

//   return (
//     <div style={{ padding: 40 }}>
//       <h2>Student Dashboard</h2>

//       <h3>Live Exams</h3>

//       {exams.length === 0 && <p>No live exams</p>}

//       <ul>
//         {exams.map((exam) => (
//           <li key={exam._id}>
//             <strong>{exam.title}</strong> — {exam.examType} —{" "}
//             {exam.duration} mins
//             <br />
//             <button
//               onClick={() =>
//                 (window.location.href = exam.examType === "coding" 
//                   ? `/coding-exam/${exam._id}`
//                   : `/exam/${exam._id}`)
//               }
//             >
//               Open Exam
//             </button>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }
