import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const AddCodingQuestions = () => {
const { examId } = useParams();
const navigate = useNavigate();
const token = localStorage.getItem("token");

const [questions, setQuestions] = useState([]);

const [formData, setFormData] = useState({
title: "",
description: "",
difficulty: "MEDIUM",
functionName: "",
parameters: "",
returnType: "",
sampleTestCases: [{ input: "", expectedOutput: "" }],
hiddenTestCases: [{ input: "", expectedOutput: "" }],
marks: 10
});

const handleChange = (e) => {
setFormData({
...formData,
[e.target.name]: e.target.value
});
};

const updateSampleTestCase = (index, field, value) => {
  const updated = [...formData.sampleTestCases];
  updated[index][field] = value;
  setFormData({
    ...formData,
    sampleTestCases: updated
  });
};

const addHiddenTestCase = () => {
  if (formData.hiddenTestCases.length >= 5) {
    alert("Maximum 5 hidden test cases allowed");
    return;
  }

  setFormData({
    ...formData,
    hiddenTestCases: [
      ...formData.hiddenTestCases,
      { input: "", expectedOutput: "" }
    ]
  });
};

const removeHiddenTestCase = (index) => {
  const updated = [...formData.hiddenTestCases];
  updated.splice(index, 1);
  setFormData({
    ...formData,
    hiddenTestCases: updated
  });
};

const updateHiddenTestCase = (index, field, value) => {
  const updated = [...formData.hiddenTestCases];
  updated[index][field] = value;
  setFormData({
    ...formData,
    hiddenTestCases: updated
  });
};

const addQuestion = async () => {
  if (!examId) {
    alert("Missing exam id in the URL. Please create an exam first.");
    return;
  }

  if (formData.hiddenTestCases.length === 0) {
    alert("At least one hidden test case required");
    return;
  }

  const requestPayload = {
    title: formData.title,
    description: formData.description,
    difficulty: formData.difficulty,
    functionName: formData.functionName,
    parameters: [],
    returnType: formData.returnType,
    sampleTestCases: formData.sampleTestCases,
    hiddenTestCases: formData.hiddenTestCases,
    marks: Number(formData.marks)
  };

try {
// Convert parameters string → array
const parsedParams = formData.parameters
? formData.parameters.split(",").map(p => {
const [name, type] = p.trim().split(":");
return { name, type };
})
: [];

  requestPayload.parameters = parsedParams;

  const res = await axios.post(
    "http://localhost:5000/api/faculty/coding-question",
    requestPayload,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  const questionId = res.data._id;

  // Attach question to exam
  await axios.post(
    `http://localhost:5000/api/faculty/exams/${examId}/add-coding-question`,
    { questionId },
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  setQuestions(prev => [...prev, res.data]);

  alert("Coding question added successfully");

} catch (error) {
  console.error("Add coding question failed", {
    message: error?.message,
    status: error?.response?.status,
    data: error?.response?.data,
    requestPayload,
    examId
  });
  alert("Failed to add coding question");
}
};

const publishExam = async () => {
try {
await axios.patch(
`http://localhost:5000/api/faculty/exams/${examId}/publish`,
{},
{
headers: { Authorization: `Bearer ${token}` }
}
);

  alert("Exam Published Successfully");
  navigate("/faculty");

} catch (error) {
  alert("Publish failed");
}
};

return (
<div className="container">
<h2>Add Coding Questions</h2>

  <input name="title" placeholder="Question Title" onChange={handleChange} />
  <textarea name="description" placeholder="Description" onChange={handleChange} />

  <input name="functionName" placeholder="Function Name" onChange={handleChange} />

  <input
    name="parameters"
    placeholder="Parameters (ex: a:int,b:int)"
    onChange={handleChange}
  />

  <input name="returnType" placeholder="Return Type" onChange={handleChange} />

  <h3>Sample Test Case</h3>
  <input
    placeholder="Sample Input"
    value={formData.sampleTestCases[0]?.input || ""}
    onChange={(e) => updateSampleTestCase(0, "input", e.target.value)}
  />
  <input
    placeholder="Expected Output"
    value={formData.sampleTestCases[0]?.expectedOutput || ""}
    onChange={(e) => updateSampleTestCase(0, "expectedOutput", e.target.value)}
  />

  <h3>Hidden Test Cases (Min 1, Max 5)</h3>
  {formData.hiddenTestCases.map((test, index) => (
    <div key={index}>
      <input
        placeholder="Input"
        value={test.input}
        onChange={(e) => updateHiddenTestCase(index, "input", e.target.value)}
      />
      <input
        placeholder="Expected Output"
        value={test.expectedOutput}
        onChange={(e) => updateHiddenTestCase(index, "expectedOutput", e.target.value)}
      />
      {formData.hiddenTestCases.length > 1 && (
        <button onClick={() => removeHiddenTestCase(index)}>Remove</button>
      )}
    </div>
  ))}

  <button onClick={addHiddenTestCase}>Add Hidden Test Case</button>

  <input
    type="number"
    name="marks"
    placeholder="Marks"
    onChange={handleChange}
  />

  <button onClick={addQuestion}>Add Question</button>

  <hr />

  <h3>Added Questions</h3>
  {questions.map((q, index) => (
    <div key={index}>
      <p><strong>{q.title}</strong> ({q.marks} marks)</p>
    </div>
  ))}

  {questions.length > 0 && (
    <button onClick={publishExam}>Publish Exam</button>
  )}
</div>
);
};

export default AddCodingQuestions;