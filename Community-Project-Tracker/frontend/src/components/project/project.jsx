import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../AuthContext";
import "./Project.css";

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await api.get(`/projects/${id}`);
        setProject(res.data);
      } catch (err) {
        console.error("Error fetching project:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="page-container">Loading…</div>;
  if (!project) return <div className="page-container">Project not found</div>;

  const tasks = project.tasks || [];
  const doneCount = tasks.filter((t) => t.status === "Completed").length;
  const progress = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;

  const handleEdit = () => {
    if (project.status === "running") {
      navigate("/projects/create", { state: { projectId: id } });
    }
  };

  return (
    <div className="page-container project-page">
      <div className="project-header">
        <h1>{project.title}</h1>

        {user && user.role === "admin" && (
          <button
            className={`btn-edit ${project.status === "completed" ? "disabled" : ""}`}
            onClick={handleEdit}
            title={project.status === "completed" ? "Completed projects can not be edited" : "Edit Project"}
            disabled={project.status === "completed"}
          >
            Edit Project
          </button>
        )}
      </div>

      <div className="info">
        <p className="muted">{project.description}</p>
        <p><strong>Location:</strong> {project.location}</p>
        <p><strong>Event Date:</strong> {new Date(project.eventDate).toLocaleDateString()}</p>
        <p><strong>Status:</strong> {project.status}</p>
      </div>

      <div className="progress-row">
        <div className="progress-bar-bg">
          <div
            className="progress-bar"
            style={{
              width: `${progress}%`,
              background: progress === 100 ? "#22c55e" : "#3b82f6",
            }}
          ></div>
        </div>
        <div className="muted">{progress}% complete</div>
      </div>

      <h3>Tasks</h3>
      <div className="tasks-list">
        {tasks.length === 0 && <p>No tasks yet.</p>}

        {tasks.map((t, index) => (
          <div key={index} className={`task-card ${t.status === "Completed" ? "done" : ""}`}>
            <div className="task-left">
              <strong className="task-title">{t.name}</strong>

              <div className="assigned-section">
                {t.volunteers && t.volunteers.length > 0 && (
                  <>
                    <div className="assigned-title">Assigned Person/s:</div>
                    {t.volunteers.map((v, i) => (
                      <div key={i} className="assigned-item">
                        <span className="role-tag volunteer-tag">Volunteer: </span>
                        <span className="assigned-name">{v.firstName} {v.lastName}</span>
                        {v.phone && <span className="assigned-phone"> 📞 {v.phone}</span>}
                      </div>
                    ))}
                  </>
                )}

                {t.doctors && t.doctors.length > 0 && (
                  <>
                    <div className="assigned-title">Assigned Person/s:</div>
                    {t.doctors.map((d, i) => (
                      <div key={i} className="assigned-item">
                        <span className="role-tag doctor-tag">Doctor: </span>
                        <span className="assigned-name">{d.firstName} {d.lastName}</span>
                        {d.phone && <span className="assigned-phone"> 📞 {d.phone}</span>}
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            <div className="task-right">
              <div><strong>Status:</strong> {t.status}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
