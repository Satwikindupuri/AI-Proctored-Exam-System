export default function StudentAnalysisCard({ student }) {
const riskClass =
student.riskLevel === "High Risk"
? "highrisk"
: student.riskLevel === "Average"
? "average"
: "perfect";

return (
<div className="student-card student-summary">

  {/* Left Section */}
  <div>
    <h3 className="text-lg font-semibold">{student.name}</h3>
    <p className="text-sm text-gray-400">
      {student.rollNo} • {student.class}
    </p>

    <div className="flex gap-6 mt-3 text-sm">
      <span>
        Avg Score: <b>{student.avgScore}</b>
      </span>
      <span>
        Auto Submits: <b>{student.autoSubmittedCount}</b>
      </span>
      <span>
        Exams Attempted: <b>{student.totalAttempts}</b>
      </span>
    </div>
  </div>

  {/* Right Section */}
  <div className="flex flex-col items-end gap-3">
    <span className={`risk ${riskClass}`}>
      {student.riskLevel}
    </span>

    <button
      className="text-sm text-blue-400 hover:underline"
      disabled
      title="Coming next"
    >
      View Details →
    </button>
  </div>
</div>
);
}
