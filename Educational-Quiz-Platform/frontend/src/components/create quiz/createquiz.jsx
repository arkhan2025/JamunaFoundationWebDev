import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./createquiz.css";

const CreateQuiz = () => {
  const savedUser = JSON.parse(localStorage.getItem("user"));
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1);
  const [numQuestions, setNumQuestions] = useState(5);
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [questions, setQuestions] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [toastPosition, setToastPosition] = useState({ top: 0 });

  const location = useLocation();
  const navigate = useNavigate();
  const editQuiz = location.state?.quiz || null;

  useEffect(() => {
    if (!savedUser?.email) {
      setErrorMessage("You must be logged in to create a quiz.");
      return;
    }
    const fetchUserData = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/users/${savedUser.email}`);
        if (!res.ok) throw new Error("Failed to fetch user data");
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error(err);
        setErrorMessage("Failed to fetch user data. Please login again.");
      }
    };
    fetchUserData();
  }, [savedUser]);

  useEffect(() => {
    if (editQuiz) {
      setTitle(editQuiz.title || "");
      setTopic(editQuiz.topic || "");
      setNumQuestions(editQuiz.questions?.length || 5);
      const mappedQuestions = editQuiz.questions.map((q, i) => ({
        id: i + 1,
        text: q.question,
        options: q.options,
        correctAnswers: q.correctAnswers
          .map((ans) => q.options.indexOf(ans))
          .filter((idx) => idx !== -1),
      }));
      setQuestions(mappedQuestions);
      setStep(2);
    }
  }, [editQuiz]);

  const handleContinue = () => {
    const qs = Array.from({ length: numQuestions }, (_, i) => ({
      id: i + 1,
      text: "",
      options: ["", "", "", ""],
      correctAnswers: [],
    }));
    setQuestions(qs);
    setStep(2);
    setErrorMessage("");
  };

  const handleQuestionChange = (index, value) => {
    const updated = [...questions];
    updated[index].text = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = value;
    setQuestions(updated);
  };

  const handleCorrectToggle = (qIndex, optIndex) => {
    const updated = [...questions];
    const correctAnswers = updated[qIndex].correctAnswers;
    if (correctAnswers.includes(optIndex)) {
      updated[qIndex].correctAnswers = correctAnswers.filter((idx) => idx !== optIndex);
    } else {
      updated[qIndex].correctAnswers = [...correctAnswers, optIndex];
    }
    setQuestions(updated);
  };

  const handleSubmit = async () => {
    setErrorMessage("");
    if (!user?._id) {
      setErrorMessage("You must be logged in to create a quiz.");
      return;
    }
    if (user.role !== "publisher") {
      setErrorMessage("Only publishers can create quizzes.");
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].text.trim()) {
        setErrorMessage(`Question ${i + 1} cannot be empty.`);
        return;
      }
      for (let j = 0; j < questions[i].options.length; j++) {
        if (!questions[i].options[j].trim()) {
          setErrorMessage(`Option ${j + 1} of Question ${i + 1} cannot be empty.`);
          return;
        }
      }
      if (questions[i].correctAnswers.length === 0) {
        setErrorMessage(`Please select at least one correct answer for Question ${i + 1}.`);
        return;
      }
    }

    const formattedQuestions = questions.map((q) => ({
      question: q.text,
      options: q.options,
      correctAnswers: q.correctAnswers.map((idx) => q.options[idx]),
      type: q.correctAnswers.length > 1 ? "multi" : "mcq",
    }));

    const quizData = {
      publisherId: user._id,
      title,
      topic,
      questions: formattedQuestions,
      attempts: editQuiz?.attempts || 0,
      highestScore: editQuiz?.highestScore || `0/${questions.length}`,
      createdAt: editQuiz?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      let res;
      if (editQuiz?._id) {
        // PUT request for updating quiz
        res = await fetch(`http://localhost:5000/api/quizzes/${editQuiz._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(quizData),
        });
        if (!res.ok) throw new Error("Error updating quiz");
        setToastMessage("Quiz updated successfully!");
      } else {
        // POST request for creating new quiz
        res = await fetch("http://localhost:5000/api/quizzes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(quizData),
        });
        if (!res.ok) throw new Error("Error creating quiz");
        setToastMessage("Quiz created successfully!");
      }

      setToastPosition({ top: window.scrollY + 100 });
      setTimeout(() => {
        setToastMessage("");
        navigate("/dashboard");
      }, 2500);
    } catch (err) {
      console.error(err);
      setErrorMessage("Error saving quiz. Please try again.");
    }
  };

  return (
    <div className="create-quiz">
      <h2>{editQuiz ? "Edit Quiz" : "Create Quiz"}</h2>

      {toastMessage && (
        <div className="toast-message-floating" style={{ top: toastPosition.top }}>
          {toastMessage}
        </div>
      )}

      {step === 1 && !editQuiz && (
        <div className="floating-modal">
          <h3>Setup Quiz</h3>
          <label>
            Number of Questions:
            <select
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
            </select>
          </label>
          <button onClick={handleContinue}>Continue</button>
          {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
        </div>
      )}

      {step === 2 && (
        <div className="quiz-form">
          {errorMessage && <p style={{ color: "red", marginBottom: "10px" }}>{errorMessage}</p>}

          <label>
            Title:
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter quiz title"
            />
          </label>

          <label>
            Topic:
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter quiz topic"
            />
          </label>

          {questions.map((q, idx) => (
            <div key={q.id} className="question-block">
              <h4>
                Question {idx + 1}: {q.text || "Enter question here"}
                {q.correctAnswers.length > 1 && (
                  <span style={{ fontSize: "14px", color: "#555" }}> - You can select multiple answers</span>
                )}
              </h4>

              <input
                type="text"
                placeholder="Enter question"
                value={q.text}
                onChange={(e) => handleQuestionChange(idx, e.target.value)}
              />

              {q.options.map((opt, optIdx) => (
                <label key={optIdx} style={{ display: "block", margin: "6px 0" }}>
                  <input
                    type="checkbox"
                    checked={q.correctAnswers.includes(optIdx)}
                    onChange={() => handleCorrectToggle(idx, optIdx)}
                  />
                  <input
                    type="text"
                    placeholder={`Option ${optIdx + 1}`}
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, optIdx, e.target.value)}
                    style={{ marginLeft: "10px" }}
                  />
                </label>
              ))}
            </div>
          ))}

          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <button className="btn" onClick={handleSubmit}>
              {editQuiz ? "Update Quiz" : "Submit Quiz"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateQuiz;
