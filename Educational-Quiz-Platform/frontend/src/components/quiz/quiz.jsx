import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./quiz.css";

const Quiz = () => {
  const { id } = useParams();
  const location = useLocation();
  const userId = location.state?.userId;
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [showWarning, setShowWarning] = useState(false);
  const [unansweredCount, setUnansweredCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await axios.get(`https://educational-quiz-platform-l7r4.onrender.com/api/quizzes/${id}`);
        setQuiz(res.data);
      } catch (err) {
        console.error("Error fetching quiz:", err);
      }
    };
    fetchQuiz();
  }, [id]);

  const handleChange = (qId, optIndex) => {
    setAnswers((prev) => {
      const existing = prev[qId] || [];
      if (existing.includes(optIndex)) {
        return { ...prev, [qId]: existing.filter((v) => v !== optIndex) };
      } else {
        return { ...prev, [qId]: [...existing, optIndex] };
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const totalQ = quiz.questions.length;
    let unanswered = 0;
    quiz.questions.forEach((q) => {
      const ans = answers[q._id] || [];
      if (!ans.length) unanswered++;
    });

    if (unanswered > 0) {
      setUnansweredCount(unanswered);
      setShowWarning(true);
      return; 
    }

    finalizeSubmit();
  };

  const finalizeSubmit = async () => {
    try {
      const mappedQuestions = quiz.questions.map((q, idx) => {
        const userAnsIndexes = answers[q._id] || [];
        const userAnswers = userAnsIndexes.map((i) => q.options[i]);
        const correctAnswers = Array.isArray(q.correctAnswers) ? q.correctAnswers : [q.correctAnswers];

        const isCorrect =
          userAnswers.length > 0 &&
          userAnswers.length === correctAnswers.length &&
          userAnswers.every((a) => correctAnswers.includes(a));

        return {
          questionId: q._id,
          questionNumber: idx + 1,
          questionText: q.question,
          options: q.options,
          userAnswers,
          correctAnswers,
          isCorrect,
        };
      });

      const totalCorrect = mappedQuestions.filter((q) => q.isCorrect).length;
      const totalWrong = mappedQuestions.filter((q) => !q.isCorrect && q.userAnswers.length > 0).length;
      const totalSkipped = mappedQuestions.filter((q) => q.userAnswers.length === 0).length;
      const score = totalCorrect;

      const attemptPayload = {
        quizId: quiz._id.toString(),
        attemptDate: new Date(),
        questions: mappedQuestions,
        totalCorrect,
        totalWrong,
        totalSkipped,
        marksAchieved: score,
      };

      await axios.put(`https://educational-quiz-platform-l7r4.onrender.com/api/users/${userId}/add-attempt`, attemptPayload);

      const prevHigh = parseInt(quiz.highestScore?.split("/")[0]) || 0;
      const newHighScore = Math.max(prevHigh, score);
      await axios.put(`https://educational-quiz-platform-l7r4.onrender.com/api/quizzes/${quiz._id}`, {
        attempts: (quiz.attempts || 0) + 1,
        highestScore: `${newHighScore}/${quiz.questions.length}`,
      });

      navigate("/result", { state: { quizId: quiz._id, userId } });
    } catch (err) {
      console.error("Error submitting quiz:", err.response || err);
    }
  };

  if (!quiz) return <p>Loading quiz...</p>;

  return (
    <div className="quiz">
      <h2>{quiz.title}</h2>
      <form onSubmit={handleSubmit}>
        {quiz.questions.map((q, idx) => (
          <div key={q._id} className="quiz-question">
            <div className="question-text">
              {idx + 1}. {q.question}
              {q.correctAnswers?.length > 1 && (
                <span className="multi-msg">(Multiple answers can be selected)</span>
              )}
            </div>
            <div className="options">
              {q.options?.map((opt, i) => (
                <div key={i} className="option">
                  <input
                    type="checkbox"
                    checked={answers[q._id]?.includes(i) || false}
                    onChange={() => handleChange(q._id, i)}
                  />
                  <span>{opt}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        <button type="submit" className="submit-btn">
          Submit Quiz
        </button>
      </form>

      {showWarning && (
        <div className="warning-popup">
          <div className="popup-content">
            <p>{unansweredCount} question(s) are left unanswered. Do you want to proceed?</p>
            <div className="popup-actions">
              <button
                onClick={() => setShowWarning(false)}
                className="btn-no"
              >
                No
              </button>
              <button
                onClick={() => {
                  setShowWarning(false);
                  finalizeSubmit(); 
                }}
                className="btn-yes"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Quiz;
