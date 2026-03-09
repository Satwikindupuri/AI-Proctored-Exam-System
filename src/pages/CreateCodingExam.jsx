import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CreateCodingExam = () => {
const navigate = useNavigate();

const [formData, setFormData] = useState({
title: "",
duration: "",
instructions: "",
year: "",
branch: "",
section: ""
});

const handleChange = (e) => {
setFormData({
...formData,
[e.target.name]: e.target.value
});
};

const handleSubmit = async (e) => {
e.preventDefault();

try {
  const token = localStorage.getItem("token");

  const res = await axios.post(
    "http://localhost:5000/api/faculty/exams",
    {
      ...formData,
      examType: "CODING"
    },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  const examId =
    res.data?._id ||
    res.data?.examId ||
    res.data?.exam?._id ||
    res.data?.data?._id;

  if (!examId) {
    console.error("Create coding exam returned unexpected payload", res.data);
    alert("Exam created, but no exam id was returned. Please contact support.");
    return;
  }

  // Redirect to add coding questions page
  navigate(`/faculty/coding-exam/${examId}/add-questions`);

} catch (error) {
  console.error("Create coding exam failed", error);
  alert("Failed to create coding exam");
}
};

return (
<div className="container">
<h2>Create Coding Exam</h2>

  <form onSubmit={handleSubmit}>

    <input
      type="text"
      name="title"
      placeholder="Exam Title"
      value={formData.title}
      onChange={handleChange}
      required
    />

    <input
      type="number"
      name="duration"
      placeholder="Duration (minutes)"
      value={formData.duration}
      onChange={handleChange}
      required
    />

    <input
      type="text"
      name="year"
      placeholder="Year"
      value={formData.year}
      onChange={handleChange}
      required
    />

    <input
      type="text"
      name="branch"
      placeholder="Branch"
      value={formData.branch}
      onChange={handleChange}
      required
    />

    <input
      type="text"
      name="section"
      placeholder="Section"
      value={formData.section}
      onChange={handleChange}
    />

    <textarea
      name="instructions"
      placeholder="Instructions"
      value={formData.instructions}
      onChange={handleChange}
    />

    <button type="submit">Create Exam</button>

  </form>
</div>
);
};

export default CreateCodingExam;