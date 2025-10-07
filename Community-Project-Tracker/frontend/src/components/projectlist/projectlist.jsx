import React, { useContext, useEffect, useState } from "react";
import api from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import "./ProjectList.css";

export default function ProjectList() {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await api.get("/projects");
        setProjects(res.data);
      } catch (error) {
        setErr("Unable to fetch projects");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="page-container">Loading projects…</div>;
  if (err) return <div className="page-container error">{err}</div>;

  const runningProjects = projects.filter((p) => p.status !== "completed");
  const completedProjects = projects.filter((p) => p.status === "completed");

  return (
    <div className="page-container">
      {/* Header */}
      <div className="list-header">
        {user && user.role === "admin" && (
          <button className="btn" onClick={() => navigate("/projects/create")}>
            + Create Project
          </button>
        )}
      </div>

      {/* Running Projects Grid */}
      <h2>Running Projects</h2>
      <div className="projects-grid">
        {runningProjects.length === 0 && <p>No running projects.</p>}

        {runningProjects.map((p) => {
          const tasks = p.tasks || [];
          const doneCount = tasks.filter((t) => t.status === "Completed").length;
          const progress = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;
          const isCompleted = progress === 100;

          return (
            <div key={p._id} className="project-card">
              <div className="card-header">
                <h2>{p.title}</h2>
              </div>

              <p className="muted">
                {p.description?.slice(0, 120)}
                {p.description?.length > 120 ? "…" : ""}
              </p>

              <div className="progress-row">
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar"
                    style={{
                      width: `${progress}%`,
                      background: isCompleted ? "#22c55e" : "#3b82f6",
                    }}
                  ></div>
                </div>
                <span className="progress-label">{progress}%</span>
              </div>

              {isCompleted ? (
                <div className="completed-label">✔ Completed</div>
              ) : (
                <div className="meta">
                  <span>Tasks: {tasks.length}</span>
                  <Link to={`/projects/${p._id}`} className="details-link">
                    View Details →
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <h2>Completed Projects</h2>
      {completedProjects.length === 0 ? (
        <p>No completed projects yet.</p>
      ) : (
        <table className="completed-projects-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Location</th>
              <th>Date</th>
              <th>View</th>
            </tr>
          </thead>
          <tbody>
            {completedProjects.map((p) => (
              <tr key={p._id}>
                <td>{p.title}</td>
                <td>{p.location}</td>
                <td>{new Date(p.eventDate).toLocaleDateString()}</td>
                <td>
                  <button
                    className="btn-view"
                    onClick={() => navigate(`/projects/${p._id}`)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
