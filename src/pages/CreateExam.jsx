import { useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

export default function CreateExam() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [examId, setExamId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // MCQ creation mode (Manual / AI placeholder)
  const [mode, setMode] = useState("MANUAL");

  const [syllabus, setSyllabus] = useState("");
  const [aiCount, setAiCount] = useState("");
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [aiLoading, setAiLoading] = useState(false);

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

  // ---------------- STEP 1: CREATE EXAM (DRAFT) ----------------
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
        status: "DRAFT" // IMPORTANT: must be DRAFT
      });

      console.log("EXAM CREATED:", res.data.exam);

      setExamId(res.data.exam._id);
      setStep(2);
    } catch (err) {
      console.error(err.response?.data || err);
      alert("Failed to create exam");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- ADD MANUAL MCQ QUESTION ----------------
  const addQuestion = async () => {
if (
!currentQ.questionText ||
currentQ.options.some(o => !o) ||
currentQ.correctOptionIndex === null
) {
alert("Complete the question and select correct answer");
return;
}

const payload = {
questionType: "MCQ",
questionText: currentQ.questionText,
options: currentQ.options,
correctAnswer: currentQ.options[currentQ.correctOptionIndex],
difficulty: "MEDIUM"
};

try {
const res = await api.post(
`/faculty/exams/${examId}/questions/manual`,
payload
);

console.log("QUESTION ADDED:", res.data);

setQuestions(prev => [...prev, res.data.question]);

setCurrentQ({
  questionText: "",
  options: ["", "", "", ""],
  correctOptionIndex: null
});
} catch (err) {
console.error("ADD QUESTION ERROR:", err.response?.data || err);
alert("Failed to add question");
}
};

  return (
    <div style={{ padding: 40, maxWidth: 700, margin: "auto" }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, -60%); }
          to { opacity: 1; transform: translate(-50%, -50%); }
        }
      `}</style>
      <h2>Create Exam</h2>
      <p>Step {step} of 2</p>

      {/* ---------------- STEP 1: EXAM DETAILS ---------------- */}
      {step === 1 && (
        <>
          <input
            placeholder="Exam Title"
            value={examData.title}
            onChange={e =>
              setExamData({ ...examData, title: e.target.value })
            }
          />

          <select value={examData.examType} disabled style={{ marginTop: 10 }}>
            <option value="MCQ">MCQ Exam</option>
            <option value="CODING">Coding Exam</option>
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
            placeholder="Instructions (shown before exam starts)"
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

      {/* ---------------- STEP 2: ADD QUESTIONS ---------------- */}
      {step === 2 && (
        <>
          <h3>Add MCQ Questions</h3>

          {/* MCQ MODE TOGGLE */}
          <div style={{ marginBottom: 20 }}>
            <label>
              <input
                type="radio"
                checked={mode === "MANUAL"}
                onChange={() => setMode("MANUAL")}
              />{" "}
              Manual
            </label>

            <label style={{ marginLeft: 20 }}>
              <input
                type="radio"
                checked={mode === "AI"}
                onChange={() => setMode("AI")}
              />{" "}
              AI Generated
            </label>
          </div>

          {mode === "AI" && (
            <div style={{ marginBottom: 20 }}>
              <textarea
                placeholder="Enter syllabus / topic"
                value={syllabus}
                onChange={(e) => setSyllabus(e.target.value)}
              />

              <input
                type="number"
                placeholder="Number of questions"
                value={aiCount}
                onChange={(e) => setAiCount(e.target.value)}
                style={{ marginTop: 10 }}
              />

              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                style={{ marginTop: 10 }}
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>

              <button
                style={{ marginTop: 15 }}
                disabled={aiLoading}
                onClick={async () => {
                  if (!syllabus || !aiCount) {
                    alert("Syllabus and number of questions required");
                    return;
                  }

                  setAiLoading(true);
                  try {
                    const res = await api.post(
                      `/faculty/exams/${examId}/questions/ai-generate`,
                      {
                        syllabus,
                        numberOfQuestions: Number(aiCount),
                        difficulty
                      }
                    );

                    setQuestions([...questions, ...res.data.questions]);
                    alert("AI questions generated");
                  } catch (err) {
                    console.error(err.response?.data || err);
                    alert("AI generation failed");
                  } finally {
                    setAiLoading(false);
                  }
                }}
              >
                {aiLoading ? "Generating..." : "Generate Questions"}
              </button>
            </div>
          )}

          {mode === "MANUAL" && (
            <>
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
                    checked={currentQ.correctOptionIndex === i}
                    onChange={() =>
                      setCurrentQ({ ...currentQ, correctOptionIndex: i })
                    }
                  />{" "}
                  Correct
                </div>
              ))}

              <button style={{ marginTop: 15 }} onClick={addQuestion}>
                Add Question
              </button>
            </>
          )}

          <p style={{ marginTop: 10 }}>
            Total Questions Added: <b>{questions.length}</b>
          </p>

          {/* PUBLISH — ENFORCE MINIMUM 1 QUESTION */}
          <button
            style={{ marginTop: 10 }}
            disabled={questions.length < 1}
            onClick={async () => {
              try {
                await api.patch(`/faculty/exams/${examId}/publish`);
                setShowSuccess(true);
                setTimeout(() => navigate("/faculty"), 2000);
              } catch (err) {
                console.error(err.response?.data || err);
                alert("Failed to publish exam");
              }
            }}
          >
            Publish Exam
          </button>

          {questions.length < 1 && (
            <p style={{ color: "red", marginTop: 6 }}>
              Add at least one question to publish.
            </p>
          )}
        </>
      )}

      {showSuccess && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'green',
            color: 'white',
            padding: '20px',
            borderRadius: '10px',
            animation: 'fadeIn 0.5s ease-in',
            zIndex: 1000
          }}
        >
          Exam Published Successfully!
        </div>
      )}
    </div>
  );
}
