import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import FacultyDashboard from "./pages/FacultyDashboard";
import FlaggedStudents from "./pages/FlaggedStudents";
import ExamView from "./pages/ExamView";
import CompletedExams from "./pages/CompletedExams";
// import LiveExams from "./pages/LiveExams";
import CreateExam from "./pages/CreateExam";
import FacultyLiveExams from "./pages/FacultyLiveExams";
import CompletedExamDetails from "./pages/CompletedExamsDetails";
import FacultyStudentAnalysis from "./pages/FacultyStudentAnalysis";
import StudentAnalysisDetails from "./pages/StudentAnalysisDetails";

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
        <Route path="/faculty/live-exams" element={<FacultyLiveExams />} />
        <Route path="/faculty/create-exam" element={<CreateExam />} />
        <Route
          path="/faculty/completed/:examId"
          element={<CompletedExamDetails />}
        />
        <Route
          path="/faculty/faculty-student-analysis"
          element={<FacultyStudentAnalysis />}
        />
        <Route
          path="/faculty/student-analysis/:studentId"
          element={<StudentAnalysisDetails />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
