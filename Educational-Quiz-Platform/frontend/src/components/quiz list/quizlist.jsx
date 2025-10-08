import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./quizlist.css";

const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  // Fetch all quizzes
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await fetch("https://educational-quiz-platform-l7r4.onrender.com/api/quizzes");
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        setQuizzes(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching quizzes:", err);
        setQuizzes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  // Fetch user attempts
  useEffect(() => {
    const fetchUserAttempts = async () => {
      if (!user?._id) return;
      try {
        const res = await fetch(`https://educational-quiz-platform-l7r4.onrender.com/api/users/id/${user._id}`);
        if (!res.ok) throw new Error("Failed to fetch user data");
        const userData = await res.json();
        setAttempts(userData.attempts || []);
      } catch (err) {
        console.error("Error fetching user attempts:", err);
        setAttempts([]);
      }
    };

    fetchUserAttempts();
  }, [user]);

  const handleTakeQuiz = (quizId) => {
    navigate(`/quiz/${quizId}`, { state: { userId: user?._id } });
  };

  const handleViewResult = (quizId) => {
    // Find the attempt for this quiz
    const attempt = attempts.find((a) => a.quizId === quizId);
    if (!attempt) return;

    navigate(`/result`, {
      state: {
        quizId,
        userId: user?._id,
        attemptData: attempt,
      },
    });
  };

  if (loading)
    return (
      <p style={{ textAlign: "center", marginTop: "50px" }}>
        Loading quizzes...
      </p>
    );

  return (
    <div className="quiz-list">
      <h2>Available Quizzes</h2>
      <div className="quiz-cards">
        {quizzes.length > 0 ? (
          quizzes.map((quiz) => {
            const alreadyParticipated = attempts.some(
              (a) => a.quizId === quiz._id
            );

            return (
              <div className="quiz-card" key={quiz._id}>
                <h3>{quiz.title}</h3>
                <p>
                  <strong>Topic:</strong> {quiz.topic}
                </p>
                <p>
                  <strong>Questions:</strong> {quiz.questions?.length || 0}
                </p>
                <p>
                  <strong>Participants:</strong> {quiz.attempts || 0}
                </p>
                <p>
                  <strong>Highest Marks:</strong> {quiz.highestScore || "N/A"}
                </p>

                {alreadyParticipated ? (
                  <button onClick={() => handleViewResult(quiz._id)}>
                    View Result
                  </button>
                ) : (
                  <button onClick={() => handleTakeQuiz(quiz._id)}>
                    Take Quiz
                  </button>
                )}
              </div>
            );
          })
        ) : (
          <p style={{ textAlign: "center", marginTop: "30px" }}>
            No quizzes available.
          </p>
        )}
      </div>
    </div>
  );
};

export default QuizList;
