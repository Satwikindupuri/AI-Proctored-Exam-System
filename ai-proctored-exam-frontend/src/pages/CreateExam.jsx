import { useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

export default function CreateExam() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [examId, setExamId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [examData, setExamData] = useState({
    title: "",
    examType: "MCQ",
    duration: "",
    instructions: "",
    year: "",
    branch: "",
    section: ""
  });

  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState({
    questionText: "",
    options: ["", "", "", ""],
    correctAnswer: ""
  });

  // ---------------- STEP 1: CREATE EXAM ----------------
  const createExam = async () => {
    if (
      !examData.title ||
      !examData.duration ||
      !examData.year ||
      !examData.branch ||
      !examData.section
    ) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/faculty/exams", {
        ...examData,
        status: "DRAFT"
      });
      setExamId(res.data._id);
      setStep(2);
    } catch {
      alert("Failed to create exam");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- ADD QUESTION ----------------
  const addQuestion = async () => {
  if (
    !currentQ.questionText ||
    currentQ.options.some(o => !o) ||
    !currentQ.correctAnswer
  ) {
    alert("Complete the question and select correct answer");
    return;
  }

  const payload = {
    questionType: "MCQ",
    questionText: currentQ.questionText,
    options: currentQ.options,
    correctAnswer: currentQ.correctAnswer,
    difficulty: "MEDIUM"
  };

  try {
    await api.post(
      `/faculty/exams/${examId}/questions/manual`,
      payload
    );

    setQuestions([...questions, payload]);
    setCurrentQ({
      questionText: "",
      options: ["", "", "", ""],
      correctAnswer: ""
    });
  } catch (err) {
    console.error(err.response?.data || err);
    alert("Failed to add question");
  }
};


  return (
    <div style={{ padding: 40, maxWidth: 700, margin: "auto" }}>
      <h2>Create Exam</h2>
      <p>Step {step} of 2</p>

      {/* ---------------- STEP 1 ---------------- */}
      {step === 1 && (
        <>
          <input
            placeholder="Exam Title"
            value={examData.title}
            onChange={e =>
              setExamData({ ...examData, title: e.target.value })
            }
          />

          <select
            value={examData.examType}
            disabled
            style={{ marginTop: 10 }}
          >
            <option value="MCQ">MCQ Exam</option>
          </select>

          <input
            type="number"
            placeholder="Duration (minutes)"
            value={examData.duration}
            onChange={e =>
              setExamData({ ...examData, duration: e.target.value })
            }
            style={{ marginTop: 10 }}
          />

          <textarea
            placeholder="Instructions"
            value={examData.instructions}
            onChange={e =>
              setExamData({ ...examData, instructions: e.target.value })
            }
            style={{ marginTop: 10 }}
          />

          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <input
              placeholder="Year"
              onChange={e =>
                setExamData({ ...examData, year: e.target.value })
              }
            />
            <input
              placeholder="Branch"
              onChange={e =>
                setExamData({ ...examData, branch: e.target.value })
              }
            />
            <input
              placeholder="Section"
              onChange={e =>
                setExamData({ ...examData, section: e.target.value })
              }
            />
          </div>

          <button
            style={{ marginTop: 20 }}
            onClick={createExam}
            disabled={loading}
          >
            {loading ? "Creating..." : "Next → Add Questions"}
          </button>
        </>
      )}

      {/* ---------------- STEP 2 ---------------- */}
      {step === 2 && (
        <>
          <h3>Add MCQ Questions</h3>

          <textarea
            placeholder="Question text"
            value={currentQ.questionText}
            onChange={e =>
              setCurrentQ({ ...currentQ, questionText: e.target.value })
            }
          />

          {currentQ.options.map((opt, i) => (
            <div key={i} style={{ marginTop: 8 }}>
              <input
                placeholder={`Option ${i + 1}`}
                value={opt}
                onChange={e => {
                  const opts = [...currentQ.options];
                  opts[i] = e.target.value;
                  setCurrentQ({ ...currentQ, options: opts });
                }}
              />
              <input
                type="radio"
                name="correct"
                checked={currentQ.correctAnswer === opt}
                onChange={() =>
                  setCurrentQ({ ...currentQ, correctAnswer: opt })
                }
              />{" "}
              Correct
            </div>
          ))}

          <button style={{ marginTop: 15 }} onClick={addQuestion}>
            Add Question
          </button>

          <p style={{ marginTop: 10 }}>
            Total Questions Added: <b>{questions.length}</b>
          </p>

          <button
            style={{ marginTop: 10 }}
            onClick={async () => {
              try {
                await api.patch(`/faculty/exams/${examId}/publish`);
                navigate("/faculty");
              } catch (err) {
                console.error(err.response?.data || err);
                alert("Failed to publish exam");
              }
            }}
          >
            Publish Exam
          </button>

          <button
            style={{ marginTop: 20 }}
            onClick={() => navigate("/faculty")}
          >
            Finish & Go to Dashboard
          </button>
        </>
      )}
    </div>
  );
}
