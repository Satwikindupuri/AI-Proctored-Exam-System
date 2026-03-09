import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";
import { initFaceDetector, detectFaces } from "../ai/faceProctor";

// --- REUSEABLE CAMERA COMPONENT ---
const CameraPreview = ({ stream, videoRef }) => {
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, videoRef]);

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      style={{
        width: "100%",
        borderRadius: "8px",
        transform: "scaleX(-1)",
        backgroundColor: "#000"
      }}
    />
  );
};

export default function CodingExamView() {
  const { examId } = useParams();
  const navigate = useNavigate();

  // CORE CODING STATES
  const [exam, setExam] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [output, setOutput] = useState("");
  const [loadingRun, setLoadingRun] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [totalScore, setTotalScore] = useState(0);

  // PROCTORING STATES
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [violations, setViolations] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [showModal, setShowModal] = useState(true);
  const [modalType, setModalType] = useState("PERMISSIONS"); 
  const [warningMsg, setWarningMsg] = useState(""); 
  const [isLocked, setIsLocked] = useState(false); 

  const MAX_VIOLATIONS = 3;
  const proctoringPaused = useRef(true);
  const cooldown = useRef(false);
  const faceDetectorRef = useRef(null); 
  const noFaceStartRef = useRef(null);
  const webcamVideoRef = useRef(null); 
  const modalVideoRef = useRef(null);
  const aiIntervalRef = useRef(null);

  // 1. AI PROCTORING ENGINE
  const startAIProctoring = async () => {
    noFaceStartRef.current = null;
    proctoringPaused.current = false;

    if (aiIntervalRef.current) clearInterval(aiIntervalRef.current);
    aiIntervalRef.current = setInterval(async () => {
      if (proctoringPaused.current) return;
      const video = webcamVideoRef.current;
      if (!video || video.readyState < 2) return;

      try {
        const faces = await detectFaces(video);
        if (faces.length === 0) {
          if (!noFaceStartRef.current) noFaceStartRef.current = Date.now();
          if ((Date.now() - noFaceStartRef.current) / 1000 >= 5) handleViolation("NO_FACE_DETECTED");
        } else {
          noFaceStartRef.current = null;
        }
      } catch (err) { console.error(err); }
    }, 1000);
  };

  // 2. RESUME EXAM AFTER VIOLATION
  const resumeExam = () => {
    setShowModal(false);
    proctoringPaused.current = true;
    noFaceStartRef.current = null;
    if (webcamVideoRef.current) {
      webcamVideoRef.current.play().catch(e => console.log("Play error", e));
    }
    setTimeout(() => {
      startAIProctoring();
    }, 1500);
  };

  // 3. VIOLATION HANDLER
  const handleViolation = useCallback((reason) => {
    if (finished || submitting || proctoringPaused.current || cooldown.current) return;
    cooldown.current = true;
    proctoringPaused.current = true;
    
    if (aiIntervalRef.current) clearInterval(aiIntervalRef.current);

    setViolations((prev) => {
      const newCount = prev + 1;
      api.post(`/student/exams/${examId}/violation`, { reason, count: newCount }).catch(() => {});
      if (newCount >= MAX_VIOLATIONS) {
        handleFinishExam(true);
      } else {
        setModalType("VIOLATION");
        setShowModal(true);
      }
      return newCount;
    });
    setTimeout(() => { cooldown.current = false; }, 2000);
  }, [examId, finished, submitting]);

  // 4. INITIAL LOAD
  useEffect(() => {
    api.get(`/student/exams/${examId}`).then((res) => setExam(res.data)).catch(() => alert("Error loading exam"));
  }, [examId]);

  const requestCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      setCameraStream(stream);
      setModalType("START"); 
    } catch (err) { alert("Webcam access is required."); }
  };

  const enterFullscreenAndStart = async () => {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
      await initFaceDetector();
      if (!started) {
        await api.post(`/student/exams/${examId}/start`).catch(() => {});
        setStarted(true);
      }
      setIsFullScreen(true); setShowModal(false); setIsLocked(false);
      setTimeout(() => startAIProctoring(), 1500);
    } catch (err) { alert("Fullscreen is mandatory."); }
  };

  // 5. FULLSCREEN EXIT DETECTION
  useEffect(() => {
    if (!started || finished) return;
    const onFullscreenChange = () => {
      if (!document.fullscreenElement && !proctoringPaused.current) {
        setIsFullScreen(false);
        setIsLocked(true);
        setModalType("FULLSCREEN_EXIT");
        setShowModal(true);
        proctoringPaused.current = true;
        if (aiIntervalRef.current) clearInterval(aiIntervalRef.current);
        handleViolation("Exited Fullscreen");
      }
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, [started, finished, handleViolation]);

  // 6. SECURITY LISTENERS
  useEffect(() => {
    if (!started || finished) return;
    const checkIntegrity = () => {
      if (document.fullscreenElement && (window.screen.width - window.innerWidth > 100)) {
        setIsLocked(true); handleViolation("Sidebar extension detected");
      }
    };
    const interval = setInterval(checkIntegrity, 2000);
    const onBlur = () => handleViolation("Focus Loss (Extension/Popup)");
    window.addEventListener("blur", onBlur);
    return () => { clearInterval(interval); window.removeEventListener("blur", onBlur); };
  }, [started, finished, handleViolation]);

  // 7. CODING LOGIC
  const currentQuestion = exam?.codingQuestions?.[currentIndex];

  const handleRun = async () => {
    if (!currentQuestion) return;
    setLoadingRun(true); setOutput("");
    try {
      const res = await api.post(`/student/exams/${examId}/coding/run`, {
        questionId: currentQuestion._id, code, language
      });
      setOutput(res.data.output || "Executed");
    } catch { setOutput("Execution error"); }
    finally { setLoadingRun(false); }
  };

  const handleSubmitQuestion = async () => {
    if (!currentQuestion) return;
    setLoadingSubmit(true);
    try {
      const res = await api.post(`/student/exams/${examId}/coding/submit`, {
        questionId: currentQuestion._id, code, language
      });
      setTotalScore((prev) => prev + (res.data.marksAwarded || 0));
      alert("Submitted!");
    } catch { alert("Failed"); }
    finally { setLoadingSubmit(false); }
  };

  const handleFinishExam = async (auto = false) => {
    if (submitting || finished) return;
    setSubmitting(true);
    setFinished(true);
    proctoringPaused.current = true;
    if (aiIntervalRef.current) clearInterval(aiIntervalRef.current);
    try {
      await api.post(`/student/exams/${examId}/submit`, { autoSubmit: auto, totalScore });
      alert(auto ? "Exam auto-submitted due to violations." : "Exam submitted successfully!");
    } finally {
      if (cameraStream) cameraStream.getTracks().forEach(t => t.stop());
      if (document.fullscreenElement) await document.exitFullscreen().catch(() => {});
      navigate("/student");
    }
  };

  if (!exam) return <div style={{color: 'white', textAlign: 'center', marginTop: '20%'}}>Loading...</div>;

  return (
    <div id="exam-root-container" style={mainContainerStyle}>
      {warningMsg && <div style={warningToastStyle}>{warningMsg}</div>}

      {(showModal || isLocked) && (
        <div style={modalOverlayStyle}>
          <div style={modalBoxStyle}>
            {cameraStream && (
              <div style={{ marginBottom: "20px", width: "240px", margin: "0 auto 20px" }}>
                <CameraPreview stream={cameraStream} videoRef={modalVideoRef} />
              </div>
            )}
            {isLocked ? (
              <><h2>⚠️ FULLSCREEN REQUIRED</h2><p>You must return to fullscreen to continue.</p><button style={btnStyle} onClick={enterFullscreenAndStart}>Return to Fullscreen</button></>
            ) : modalType === "PERMISSIONS" ? (
              <button style={btnStyle} onClick={requestCamera}>Allow Camera</button>
            ) : modalType === "START" ? (
              <button style={btnStyle} onClick={enterFullscreenAndStart}>Start Exam</button>
            ) : modalType === "FULLSCREEN_EXIT" ? (
              <><h2>⚠️ FULLSCREEN EXITED</h2><p>Violation recorded. Return to fullscreen.</p><button style={btnStyle} onClick={enterFullscreenAndStart}>Return to Fullscreen</button></>
            ) : (
              <><h2>⚠️ Violation Detected!</h2><p>Violations: {violations}/{MAX_VIOLATIONS}</p><button style={btnStyle} onClick={resumeExam}>Return to Exam</button></>
            )}
          </div>
        </div>
      )}

      {started && isFullScreen && (
        <div style={{ display: "flex", gap: "30px", opacity: showModal ? 0.3 : 1 }}>
          <div style={{ flex: 1 }}>
            <h2>{exam.title}</h2>
            <p style={{ color: "#ff4d4d", fontWeight: "bold" }}>Violations: {violations}/{MAX_VIOLATIONS} | Score: {totalScore}</p>
            <div style={{ marginBottom: 20 }}>
              {(exam.codingQuestions || []).map((q, idx) => (
                <button key={q._id} onClick={() => setCurrentIndex(idx)} style={{ marginRight: 10, padding: 10, background: currentIndex === idx ? '#007bff' : '#444', color: 'white' }}>
                  Q{idx + 1}
                </button>
              ))}
            </div>

            {currentQuestion && (
              <div style={questionCardStyle}>
                <h3>{currentQuestion.title}</h3>
                <p>{currentQuestion.description}</p>
              </div>
            )}

            <select value={language} onChange={(e) => setLanguage(e.target.value)} style={{marginBottom: 10}}>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
            </select>

            <textarea rows={15} style={editorStyle} value={code} onChange={(e) => setCode(e.target.value)} />

            <div style={{ marginTop: 10 }}>
              <button style={btnStyle} onClick={handleRun} disabled={loadingRun}>Run</button>
              <button style={{...btnStyle, background: 'purple', marginLeft: 10}} onClick={handleSubmitQuestion} disabled={loadingSubmit}>Submit Q</button>
            </div>

            <div style={outputBoxStyle}><pre>{output}</pre></div>
            <button style={{...btnStyle, background: 'green', width: '100%', marginTop: 20}} onClick={() => handleFinishExam(false)}>Finish Exam</button>
          </div>

          <div style={{ width: "280px" }}>
            <div style={webcamContainerStyle}>
              <CameraPreview stream={cameraStream} videoRef={webcamVideoRef} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// STYLES
const mainContainerStyle = { minHeight: "100vh", padding: "20px", backgroundColor: "#121212", color: "white" };
const modalOverlayStyle = { position: "fixed", inset: 0, backgroundColor: "#000", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 99999 };
const modalBoxStyle = { backgroundColor: "#fff", padding: "40px", borderRadius: "15px", textAlign: "center", color: '#000' };
const btnStyle = { padding: "12px 24px", cursor: "pointer", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "8px" };
const questionCardStyle = { padding: "20px", borderRadius: "10px", marginBottom: "20px", backgroundColor: "#1e1e1e" };
const editorStyle = { width: "100%", backgroundColor: "#1e1e1e", color: "#fff", padding: "15px", fontFamily: "monospace" };
const outputBoxStyle = { background: "#000", color: "#0f0", padding: "15px", marginTop: "20px", minHeight: "100px" };
const webcamContainerStyle = { position: "sticky", top: "20px", border: "2px solid #444", padding: "10px", backgroundColor: "#000" };
const warningToastStyle = { position: "fixed", top: "20px", left: "50%", transform: "translateX(-50%)", backgroundColor: "#ffc107", padding: "10px 20px", borderRadius: "20px", color: "#000", zIndex: 99999 };