import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import React from "react";
import Header from "./components/header/header.jsx";
import Footer from "./components/footer/footer.jsx";
import Dashboard from "./components/dashboard/dashboard.jsx";
import Login from "./components/login/login.jsx";
import Registration from "./components/registration/registration.jsx";
import Profile from "./components/profile/profile.jsx";
import Quiz from "./components/quiz/quiz.jsx";
import QuizList from "./components/quiz list/quizlist.jsx";
import Result from "./components/result/result.jsx";
import CreateQuiz from "./components/create quiz/createquiz.jsx";

const ProtectedRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  const [user, setUser] = React.useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  return (
    <Router>
      <Header user={user} />
      <div className="main-content" style={{ marginTop: "70px" }}>
        <Routes>
          <Route path="/" element={<Navigate to="/quizzes" />} />

          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Registration setUser={setUser} />} />
          
          <Route path="/quizzes" element={<QuizList />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard user={user} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/create-quiz"
            element={
              <ProtectedRoute>
                <CreateQuiz user={user} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz/:id"
            element={
              <ProtectedRoute>
                <Quiz />
              </ProtectedRoute>
            }
          />

          <Route
            path="/result"
            element={
              <ProtectedRoute>
                <Result />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
}

export default App;
