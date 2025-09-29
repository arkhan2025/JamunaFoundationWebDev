import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./result.css";

const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { quizId, userId } = location.state || {};
  const [quizData, setQuizData] = useState(null);
  const [attemptData, setAttemptData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        if (!quizId || !userId) return;

        const quizRes = await axios.get(`http://localhost:5000/api/quizzes/${quizId}`);
        const quiz = quizRes.data;
        setQuizData(quiz);

        const userRes = await axios.get(`http://localhost:5000/api/users/id/${userId}`);
        const user = userRes.data;

        const submission = user.attempts?.find(
          (a) => a.quizId.toString() === quizId.toString()
        );
        if (!submission) {
          setAttemptData(null);
          return;
        }

        const calculatedQuestions = quiz.questions.map((q) => {
          const userQ = submission.questions.find((uq) => uq.questionId === q._id) || {};
          const userAnswers = userQ.userAnswers || [];
          const correctAnswers = Array.isArray(q.correctAnswers) ? q.correctAnswers : [q.correctAnswers];
          return {
            question: q.question,
            options: q.options,
            correctAnswers,
            userAnswers,
          };
        });

        setAttemptData({
          ...submission,
          questions: calculatedQuestions,
          totalCorrect: submission.totalCorrect,
          totalWrong: submission.totalWrong,
          totalSkipped: submission.totalSkipped,
          marksAchieved: submission.marksAchieved,
        });
      } catch (err) {
        console.error("Error fetching result:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [quizId, userId]);

  if (loading) return <p style={{ textAlign: "center", marginTop: "50px" }}>Loading result...</p>;
  if (!quizData || !attemptData) return <p style={{ textAlign: "center", marginTop: "50px" }}>No result found.</p>;

  const totalQuestions = quizData.questions.length;
  const answeredCount = totalQuestions - (attemptData.totalSkipped || 0);

  return (
    <div className="result">
      <h2>{quizData.title}</h2>
      {quizData.topic && <h4>Topic: {quizData.topic}</h4>}
      <p>Total Questions: {totalQuestions}</p>

      <div className="questions-review">
        {attemptData.questions.map((q, idx) => (
          <div key={idx} className="review-question">
            <p className="question-text">{idx + 1}. {q.question}</p>
            <div className="options-list">
              {q.options.map((opt, i) => {
                let className = "normal";

                const isCorrect = q.correctAnswers.includes(opt);
                const isUserSelected = q.userAnswers.includes(opt);

                if (isUserSelected && isCorrect) {
                  className = "user-correct"; // light yellow
                } else if (isUserSelected && !isCorrect) {
                  className = "user-wrong"; // light red
                } else if (!isUserSelected && isCorrect) {
                  className = "correct-not-selected"; // light green
                }

                return (
                  <div key={i} className={`option ${className}`}>
                    <span>{opt}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="result-stats">
        <p>Answered Questions: {answeredCount}</p>
        <p>Unanswered Questions: {attemptData.totalSkipped || totalQuestions - answeredCount}</p>
        <p>Correct Answers: {attemptData.totalCorrect || 0}</p>
        <p>Wrong Answers: {attemptData.totalWrong || 0}</p>
        <p>Achieved Marks: {attemptData.marksAchieved || 0}</p>
      </div>

      <button onClick={() => navigate("/quizzes")} className="back-btn">
        Back to Quiz List
      </button>
    </div>
  );
};

export default Result;
