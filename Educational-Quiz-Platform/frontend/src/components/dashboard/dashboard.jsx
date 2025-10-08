import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./dashboard.css";

const Dashboard = () => {
  const savedUser = JSON.parse(localStorage.getItem("user"));
  const [user, setUser] = useState(savedUser || null);
  const [welcomeMsg, setWelcomeMsg] = useState(
    () => sessionStorage.getItem("showWelcome") === "true"
  );
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuizzes, setSelectedQuizzes] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deleteTargetIds, setDeleteTargetIds] = useState([]);
  const [showTable, setShowTable] = useState("quiz");
  const [attemptsData, setAttemptsData] = useState([]);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (welcomeMsg) {
      const timer = setTimeout(() => {
        setWelcomeMsg(false);
        sessionStorage.removeItem("showWelcome");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [welcomeMsg]);

  useEffect(() => {
    const fetchQuizzes = async () => {
      if (!user || user.role !== "publisher") return;
      try {
        const res = await fetch(
          `https://educational-quiz-platform-l7r4.onrender.com/api/quizzes?publisherId=${user._id}`
        );
        if (!res.ok) throw new Error("Failed to fetch quizzes");
        const data = await res.json();
        setQuizzes(data);
      } catch (err) {
        console.error("Error fetching quizzes:", err);
        setQuizzes([]);
      }
    };
    fetchQuizzes();
  }, [user]);

  const safeFetchQuiz = async (quizId) => {
  try {
    const res = await fetch(`https://educational-quiz-platform-l7r4.onrender.com/api/quizzes/${quizId}`);
    if (!res.ok) return null; 
    return await res.json();
  } catch {
    return null;
  }
};

useEffect(() => {
  const fetchAttempts = async () => {
    if (!user) return;
    try {
      const res = await fetch(`https://educational-quiz-platform-l7r4.onrender.com/api/users/id/${user._id}`);
      if (!res.ok) throw new Error("Failed to fetch user data");
      const userData = await res.json();
      const attempts = userData.attempts || [];

      const enrichedAttempts = await Promise.all(
        attempts.map(async (a) => {          
          if (!a.quizId || a.quizDeleted) {
            return {
              ...a,
              quizTitle: a.quizTitle || "Deleted Quiz",
              quizTopic: a.quizTopic || "-",
              totalQuestions: a.totalQuestions || (a.questions?.length || 0),
              marksAchieved: a.marksAchieved || 0,
              quizDeleted: true,
              quizData: null,
            };
          }

          try {
            const quizRes = await fetch(
              `https://educational-quiz-platform-l7r4.onrender.com/api/quizzes/${a.quizId}`
            );
            if (quizRes.ok) {
              const quizData = await quizRes.json();
              return {
                ...a,
                quizTitle: quizData.title,
                quizTopic: quizData.topic,
                totalQuestions: quizData.questions.length,
                quizDeleted: false,
                quizData,
              };
            } else {
              return {
                ...a,
                quizTitle: a.quizTitle || "Deleted Quiz",
                quizTopic: a.quizTopic || "-",
                totalQuestions: a.totalQuestions || (a.questions?.length || 0),
                marksAchieved: a.marksAchieved || 0,
                quizDeleted: true,
                quizData: null,
              };
            }
          } catch {
            return {
              ...a,
              quizTitle: a.quizTitle || "Deleted Quiz",
              quizTopic: a.quizTopic || "-",
              totalQuestions: a.totalQuestions || (a.questions?.length || 0),
              marksAchieved: a.marksAchieved || 0,
              quizDeleted: true,
              quizData: null,
            };
          }
        })
      );

      setAttemptsData(enrichedAttempts);
      setTotalAttempts(enrichedAttempts.length);
    } catch (err) {
      console.error("Error fetching attempts:", err);
      setAttemptsData([]);
    }
  };
  fetchAttempts();
}, [user]);


  const handleCreateQuiz = () => navigate("/create-quiz");
  const handleEditQuiz = (quiz) => navigate("/create-quiz", { state: { quiz } });

  const handleCheckboxChange = (id) => {
    setSelectedQuizzes((prev) =>
      prev.includes(id) ? prev.filter((q) => q !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    setSelectedQuizzes(e.target.checked ? quizzes.map((q) => q._id) : []);
  };

  const confirmDelete = (ids) => {
    setDeleteTargetIds(ids);
    setShowConfirmModal(true);
  };

  const handleDelete = async () => {
    try {
      await Promise.all(
        deleteTargetIds.map((id) =>
          fetch(`https://educational-quiz-platform-l7r4.onrender.com/api/quizzes/${id}`, { method: "DELETE" })
        )
      );
      setQuizzes(quizzes.filter((q) => !deleteTargetIds.includes(q._id)));
      setSelectedQuizzes((prev) =>
        prev.filter((id) => !deleteTargetIds.includes(id))
      );
    } catch (err) {
      console.error("Failed to delete quiz(es):", err);
    } finally {
      setShowConfirmModal(false);
      setDeleteTargetIds([]);
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="dashboard">
      {welcomeMsg && (
        <div className="welcome-popup">
          <p>Welcome, {user.name} 👋</p>
        </div>
      )}

      {user.role === "publisher" && (
        <div className="table-toggle-buttons">
          <button
            className={showTable === "quiz" ? "active" : ""}
            onClick={() => setShowTable("quiz")}
          >
            Quiz Table
          </button>
          <button
            className={showTable === "attempt" ? "active" : ""}
            onClick={() => setShowTable("attempt")}
          >
            Attempt Table
          </button>
        </div>
      )}

      {showTable === "quiz" && user.role === "publisher" && (
        <>
          <button onClick={handleCreateQuiz} className="create-btn">
            + Create Quiz
          </button>
          <p>Total Quizzes Posted: {quizzes.length}</p>

          <table className="quiz-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={
                      selectedQuizzes.length === quizzes.length &&
                      quizzes.length > 0
                    }
                  />
                </th>
                <th>Title</th>
                <th>Topic</th>
                <th>Questions</th>
                <th>Participants</th>
                <th>Highest Marks</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.length > 0 ? (
                quizzes.map((quiz) => (
                  <tr key={quiz._id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedQuizzes.includes(quiz._id)}
                        onChange={() => handleCheckboxChange(quiz._id)}
                      />
                    </td>
                    <td>{quiz.title}</td>
                    <td>{quiz.topic}</td>
                    <td>{quiz.questions?.length || 0}</td>
                    <td>{quiz.attempts || 0}</td>
                    <td>
                      {quiz.highestScore || `0/${quiz.questions?.length || 0}`}
                    </td>
                    <td>
                      {quiz.createdAt
                        ? new Date(quiz.createdAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td>
                      <button
                        className="edit-btn"
                        onClick={() => handleEditQuiz(quiz)}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => confirmDelete([quiz._id])}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center" }}>
                    No quizzes created yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {selectedQuizzes.length > 0 && (
            <button
              onClick={() => confirmDelete(selectedQuizzes)}
              className="delete-selected-btn"
            >
              Delete Selected
            </button>
          )}
        </>
      )}

      {(user.role === "participant" || showTable === "attempt") && (
        <>
          <p>Total Attempts: {totalAttempts}</p>
          <table className="quiz-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Title</th>
                <th>Topic</th>
                <th>Achieved Marks</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {attemptsData.length > 0 ? (
                attemptsData.map((attempt, idx) => {
                  const isDeleted = attempt.quizDeleted;
                  return (
                    <tr key={idx}>
                      <td>{new Date(attempt.attemptDate).toLocaleDateString()}</td>
                      <td>{attempt.quizTitle}</td>
                      <td>{attempt.quizTopic}</td>
                      <td>
                        {attempt.marksAchieved}/{attempt.totalQuestions}
                      </td>
                      <td>
                        {isDeleted ? (
                          <button
                            className="view-result-btn disabled"
                            disabled
                            title="This quiz has been deleted by the publisher"
                          >
                            View
                          </button>
                        ) : (
                          <button
                            className="view-result-btn"
                            onClick={() =>
                              navigate("/result", {
                                state: {
                                  attemptData: attempt,
                                  quiz: attempt.quizData,
                                  userId: user._id,
                                  quizId: attempt.quizId,
                                },
                              })
                            }
                          >
                            View
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    No attempts yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}

      {showConfirmModal && (
        <div className="modal-backdrop">
          <div className="confirm-modal">
            <p>
              Are you sure you want to delete{" "}
              {deleteTargetIds.length > 1 ? "these quizzes" : "this quiz"}?
            </p>
            <div className="modal-buttons">
              <button className="btn" onClick={handleDelete}>
                Yes, Delete
              </button>
              <button
                className="btn"
                onClick={() => {
                  setShowConfirmModal(false);
                  setDeleteTargetIds([]);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
