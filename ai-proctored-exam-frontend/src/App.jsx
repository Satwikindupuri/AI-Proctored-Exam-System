import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import FacultyDashboard from "./pages/FacultyDashboard";
import FlaggedStudents from "./pages/FlaggedStudents";
import ExamView from "./pages/ExamView";
import CompletedExams from "./pages/CompletedExams";
import LiveExams from "./pages/LiveExams";
import CreateExam from "./pages/CreateExam";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Login />} />

        {/* Student */}
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/exam/:examId" element={<ExamView />} />

        {/* Faculty */}
        <Route path="/faculty" element={<FacultyDashboard />} />
        <Route path="/faculty/flagged" element={<FlaggedStudents />} />
        <Route path="/faculty/completed" element={<CompletedExams />} />
        <Route path="/faculty/live-exams" element={<LiveExams />} />
        <Route path="/faculty/create-exam" element={<CreateExam />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
