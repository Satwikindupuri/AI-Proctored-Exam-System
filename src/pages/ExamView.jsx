import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";

// --- REUSEABLE CAMERA COMPONENT ---
const CameraPreview = ({ stream, muted = true, style = {} }) => {
  const videoRef = useRef(null);
  useEffect(() => {
    if (videoRef.current && stream) videoRef.current.srcObject = stream;
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      muted={muted}
      playsInline
      style={{
        width: "100%", borderRadius: "8px", transform: "scaleX(-1)",
        backgroundColor: "#000", ...style
      }}
    />
  );
};

export default function ExamView() {
  const { examId } = useParams();
  const navigate = useNavigate();

  // CORE STATES
  const [exam, setExam] = useState(null);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState({});

  // PROCTORING STATES
  const [violations, setViolations] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [showModal, setShowModal] = useState(true);
  const [modalType, setModalType] = useState("PERMISSIONS"); 
  const [warningMsg, setWarningMsg] = useState(""); 

  const MAX_VIOLATIONS = 3;
  const proctoringPaused = useRef(true);
  const cooldown = useRef(false);

  useEffect(() => {
    api.get(`/student/exams/${examId}`).then((res) => setExam(res.data));
  }, [examId]);

  const requestCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      setCameraStream(stream);
      setModalType("START"); 
    } catch (err) {
      alert("Webcam access is required for proctoring.");
    }
  };

  const enterFullscreenAndStart = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
      if (!started) {
        await api.post(`/student/exams/${examId}/start`);
        setStarted(true);
      }
      setIsFullScreen(true);
      setShowModal(false);
      
      // Safety delay before enabling proctoring listeners
      setTimeout(() => { proctoringPaused.current = false; }, 1200);
    } catch (err) {
      alert("Fullscreen is mandatory for this exam.");
    }
  };

  // ---------------- MODIFIED VIOLATION LOGIC ----------------
  const handleViolation = useCallback((reason) => {
    if (finished || submitting || proctoringPaused.current || cooldown.current) return;

    cooldown.current = true;
    setViolations((prev) => {
      const newCount = prev + 1;
      api.post(`/student/exams/${examId}/violation`, { reason, count: newCount });

      if (newCount >= MAX_VIOLATIONS) {
        submitExam(true);
      } else {
        proctoringPaused.current = true; // Stop listening while modal is up
        setModalType("VIOLATION");
        setShowModal(true);
      }
      return newCount;
    });
    
    // Cooldown prevents multiple triggers for the same event
    setTimeout(() => { cooldown.current = false; }, 2000);
  }, [examId, finished, submitting]);

  // ---------------- NEW: KEYBOARD & RESIZE LISTENERS ----------------
  useEffect(() => {
    if (!started || finished) return;

    // Detect Keyboard Shortcut Combos (Warning Only)
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.altKey || e.metaKey || (e.shiftKey && e.keyCode !== 16)) {
        // We don't preventDefault here to avoid breaking system accessibility, 
        // but we show the warning as requested.
        setWarningMsg("WARNING: Keyboard shortcuts are prohibited!");
        setTimeout(() => setWarningMsg(""), 3000);
      }
    };

    // Detect Screen Resizing (Violation)
    const handleResize = () => {
      if (document.fullscreenElement && !proctoringPaused.current) {
        handleViolation("Screen Resizing / Split-screen Attempt");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, [started, finished, handleViolation]);

  // ---------------- EXISTING BROWSER LISTENERS (Modified) ----------------
  useEffect(() => {
    if (!started || finished) return;

    const onFullscreenChange = () => {
      if (!document.fullscreenElement && !proctoringPaused.current) {
        setIsFullScreen(false);
        handleViolation("Exited Fullscreen Mode");
      }
    };

    const onVisibilityChange = () => {
      if (document.hidden) handleViolation("Tab / Window Switch Detected");
    };

    // This catches the "Pop-ups" from your screenshot. 
    // If an external app appears, the browser window loses "Focus".
    const onBlur = () => {
      handleViolation("On-screen Pop-up or Focus Loss Detected");
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("blur", onBlur);

    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", onBlur);
    };
  }, [started, finished, handleViolation]);

  const submitExam = useCallback(async (auto = false) => {
    if (submitting || finished) return;
    setSubmitting(true);
    setFinished(true);
    proctoringPaused.current = true;

    try {
      const payload = Object.entries(answers).map(([qid, ans]) => ({ questionId: qid, answer: ans }));
      await api.post(`/student/exams/${examId}/submit`, { answers: payload, autoSubmit: auto });
      alert(auto ? "Exam auto-submitted due to violations." : "Exam submitted successfully.");
    } finally {
      if (cameraStream) cameraStream.getTracks().forEach(t => t.stop());
      if (document.fullscreenElement) await document.exitFullscreen().catch(() => {});
      navigate("/student");
    }
  }, [answers, examId, finished, navigate, submitting, cameraStream]);

  if (!exam) return <div style={{color: 'white', textAlign: 'center', marginTop: '20%'}}>Loading Exam...</div>;

  return (
    <div style={{ minHeight: "100vh", padding: "20px", backgroundColor: "#121212", color: "white" }}>
      
      {/* Non-violation Warning Pop-up */}
      {warningMsg && <div style={warningToastStyle}>{warningMsg}</div>}

      {/* ---------------- MODAL WITH WEBCAM ---------------- */}
      {showModal && (
        <div style={modalOverlayStyle}>
          <div style={modalBoxStyle}>
            {cameraStream && (
              <div style={{ marginBottom: "20px", width: "240px", margin: "0 auto 20px" }}>
                <CameraPreview stream={cameraStream} />
                <p style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>Live Verification Feed</p>
              </div>
            )}

            {modalType === "PERMISSIONS" ? (
              <>
                <h2 style={{color: '#333'}}>Step 1: Camera Access</h2>
                <p style={{color: '#666'}}>Please enable your webcam to proceed.</p>
                <button style={btnStyle} onClick={requestCamera}>Allow Camera</button>
              </>
            ) : modalType === "START" ? (
              <>
                <h2 style={{color: '#333'}}>Step 2: Start Exam</h2>
                <p style={{color: '#666'}}>Click below to enter secure fullscreen mode.</p>
                <button style={btnStyle} onClick={enterFullscreenAndStart}>Start Now</button>
              </>
            ) : (
              <>
                <h2 style={{ color: "red" }}>Violation Detected!</h2>
                <p style={{color: '#333'}}>Pop-ups, resizing, and window switching are prohibited.</p>
                <p style={{color: '#333', fontWeight: 'bold'}}>Violations: {violations} / {MAX_VIOLATIONS}</p>
                <button style={btnStyle} onClick={enterFullscreenAndStart}>Return to Exam</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ---------------- EXAM UI ---------------- */}
      {started && isFullScreen && !finished && (
        <div style={{ display: "flex", gap: "30px" }}>
          <div style={{ flex: 1 }}>
            <h1>{exam.title}</h1>
            <p style={{ color: "#ff4d4d", fontWeight: "bold", fontSize: '1.2rem' }}>
              Violations: {violations}/{MAX_VIOLATIONS}
            </p>

            {exam.questions.map((q, idx) => (
              <div key={q._id} style={questionCardStyle}>
                <p style={{fontSize: '1.1rem'}}><strong>Q{idx + 1}:</strong> {q.questionText}</p>
                {q.options.map((opt) => (
                  <label key={opt} style={{ display: "block", margin: "10px 0", cursor: "pointer" }}>
                    <input
                      type="radio"
                      name={q._id}
                      checked={answers[q._id] === opt}
                      onChange={() => setAnswers({ ...answers, [q._id]: opt })}
                    /> {opt}
                  </label>
                ))}
              </div>
            ))}

            <button style={{ ...btnStyle, backgroundColor: "#28a745" }} onClick={() => submitExam(false)}>
              Submit Exam
            </button>
          </div>

          <div style={{ width: "280px" }}>
            <div style={webcamContainerStyle}>
              <CameraPreview stream={cameraStream} />
              <div style={{ textAlign: "center", fontSize: "12px", marginTop: "8px" }}>Live Feed Active</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------- STYLES ----------------
const modalOverlayStyle = { position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.95)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 };
const modalBoxStyle = { backgroundColor: "#fff", padding: "40px", borderRadius: "15px", textAlign: "center", minWidth: "400px", boxShadow: '0 0 20px rgba(255,255,255,0.1)' };
const btnStyle = { padding: "14px 28px", cursor: "pointer", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", fontSize: '1rem', marginTop: '10px' };
const questionCardStyle = { padding: "20px", borderRadius: "10px", marginBottom: "20px", border: "1px solid #333", backgroundColor: "#1e1e1e" };
const webcamContainerStyle = { position: "sticky", top: "20px", border: "2px solid #444", borderRadius: "15px", padding: "10px", backgroundColor: "#000" };
const warningToastStyle = { position: "fixed", top: "20px", left: "50%", transform: "translateX(-50%)", backgroundColor: "#ffc107", color: "#000", padding: "15px 30px", borderRadius: "50px", fontWeight: "bold", zIndex: 10000, boxShadow: "0 4px 15px rgba(0,0,0,0.3)" };