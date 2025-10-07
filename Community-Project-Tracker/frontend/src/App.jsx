import React, { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./components/AuthContext";
import Header from "./components/header/header";
import Login from "./components/login/login";
import Register from "./components/registration/registration";
import ProjectList from "./components/projectlist/projectlist";
import ProjectDetail from "./components/project/project";
import Profile from "./components/profile/profile";
import Home from "./components/home/home";
import Request from "./components/request/request";
import CreateProject from "./components/createproject/createproject";

function ProtectedRoute({ children }) {
  const { token, loading } = useContext(AuthContext);
  if (loading) return null;
  return token ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { token } = useContext(AuthContext);

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Navigate to={token ? "/home" : "/login"} replace />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <ProjectList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/create"
          element={
            <ProtectedRoute>
              <CreateProject />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:id"
          element={
            <ProtectedRoute>
              <ProjectDetail />
            </ProtectedRoute>
          }
        />
        <Route
  path="/projects/create"
  element={
    <ProtectedRoute>
      <CreateProject />
    </ProtectedRoute>
  }
/>

        <Route
          path="/login"
          element={token ? <Navigate to="/home" replace /> : <Login />}
        />
        <Route
          path="/register"
          element={token ? <Navigate to="/home" replace /> : <Register />}
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/request/:id"
          element={
            <ProtectedRoute>
              <Request />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
