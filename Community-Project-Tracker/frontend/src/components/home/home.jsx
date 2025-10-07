import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import "./home.css";
import { AuthContext } from "../AuthContext";

export default function Home() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    runningProjects: 0,
    totalVolunteers: 0,
    freeVolunteers: 0,
    totalDoctors: 0,
    freeDoctors: 0,
  });
  const [requests, setRequests] = useState([]);
  const [projects, setProjects] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [showRequests, setShowRequests] = useState(false);
  const [showVolunteers, setShowVolunteers] = useState(false);
  const [showDoctors, setShowDoctors] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [assignedProjects, setAssignedProjects] = useState([]);
  const [popupMessage, setPopupMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, usersRes, requestsRes] = await Promise.all([
          axios.get("http://localhost:5000/api/projects"),
          axios.get("http://localhost:5000/api/users/approved"),
          axios.get("http://localhost:5000/api/requests"),
        ]);

        const allProjects = projectsRes.data;
        const allUsers = usersRes.data;

        const runningProjects = allProjects.filter(p => p.status === "running").length;
        const allVolunteers = allUsers.filter(u => u.role === "volunteer");
        const freeVolunteers = allVolunteers.filter(u => u.availability === "available");
        const allDoctors = allUsers.filter(u => u.role === "doctor");
        const freeDoctors = allDoctors.filter(u => u.availability === "available");

        setProjects(allProjects);
        setVolunteers(allVolunteers);
        setDoctors(allDoctors);
        setRequests(requestsRes.data);

        setStats({
          runningProjects,
          totalVolunteers: allVolunteers.length,
          freeVolunteers: freeVolunteers.length,
          totalDoctors: allDoctors.length,
          freeDoctors: freeDoctors.length,
        });

        if (user && (user.role === "volunteer" || user.role === "doctor")) {
          const loggedUser = allUsers.find(u => u._id === user._id);
          if (loggedUser) {
            setAssignedProjects(loggedUser.assignedProjects || []);
            if (loggedUser.availability === "occupied") {
              const lastProjectId = loggedUser.assignedProjects?.slice(-1)[0];
              if (lastProjectId) {
                const proj = allProjects.find(p => p._id === lastProjectId);
                setCurrentProject(proj || null);
              }
            }
          }
        }
      } catch (err) {
        console.error("Error loading data:", err);
      }
    };
    fetchData();
  }, [user]);

  const showPopup = (message) => {
    setPopupMessage(message);
    setTimeout(() => setPopupMessage(""), 2000);
  };

  // ✅ UPDATED: only update the current user's availability, keep assignedProjects
  const markTaskComplete = async (projectId, taskName) => {
    try {
      await axios.put(
        `http://localhost:5000/api/projects/${projectId}/complete-task`,
        { taskName, userId: user._id }
      );

      // Update only your availability locally
      setProjects(prev =>
        prev.map(p => {
          if (p._id === projectId) {
            return {
              ...p,
              tasks: p.tasks.map(t =>
                t.name === taskName
                  ? { ...t, completedBy: [...(t.completedBy || []), user._id], status: "Completed" }
                  : t
              ),
            };
          }
          return p;
        })
      );

      showPopup("🎉 Task completed! You are now available for new tasks!!!");
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  // ---- ADMIN VIEW ----
  if (user?.role === "admin") {
    return (
      <div className="home-container">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Running Projects</h3>
            <p>{stats.runningProjects}</p>
          </div>

          <div className="stat-card">
            <h3>Volunteers</h3>
            <p>
              Total: {stats.totalVolunteers} | Free: {stats.freeVolunteers}
            </p>
            <button
              className="btn-toggle"
              onClick={() => setShowVolunteers(!showVolunteers)}
            >
              {showVolunteers ? "Hide Volunteers" : "View Volunteers"}
            </button>
          </div>

          <div className="stat-card">
            <h3>Doctors</h3>
            <p>
              Total: {stats.totalDoctors} | Free: {stats.freeDoctors}
            </p>
            <button
              className="btn-toggle"
              onClick={() => setShowDoctors(!showDoctors)}
            >
              {showDoctors ? "Hide Doctors" : "View Doctors"}
            </button>
          </div>
        </div>

        {showVolunteers && (
          <div className="requests-table-container">
            <h3>All Volunteers</h3>
            <table className="requests-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Location</th>
                  <th>Phone</th>
                  <th>Qualification</th>
                  <th>Assigned Projects</th>
                  <th>Available</th>
                </tr>
              </thead>
              <tbody>
                {volunteers.map((v) => (
                  <tr key={v._id}>
                    <td>{v.firstName + " " + v.lastName}</td>
                    <td>{v.address}</td>
                    <td>{v.phone}</td>
                    <td>{v.qualification}</td>
                    <td>{v.assignedProjects?.length || 0}</td>
                    <td>{v.availability === "available" ? "Yes" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showDoctors && (
          <div className="requests-table-container">
            <h3>All Doctors</h3>
            <table className="requests-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Location</th>
                  <th>Phone</th>
                  <th>Qualification</th>
                  <th>Assigned Projects</th>
                  <th>Available</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((d) => (
                  <tr key={d._id}>
                    <td>{d.firstName + " " + d.lastName}</td>
                    <td>{d.address}</td>
                    <td>{d.phone}</td>
                    <td>{d.qualification}</td>
                    <td>{d.assignedProjects?.length || 0}</td>
                    <td>{d.availability === "available" ? "Yes" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button
          className="btn-toggle"
          onClick={() => setShowRequests(!showRequests)}
        >
          {showRequests ? "Hide Requests" : "Show Requests"}
        </button>

        {showRequests && (
          <div className="requests-table-container">
            <table className="requests-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Address</th>
                  <th>Phone</th>
                  <th>Date Applied</th>
                  <th>Qualification</th>
                  <th>Applied As</th>
                  <th>View</th>
                </tr>
              </thead>
              <tbody>
                {requests.length > 0 ? (
                  requests.map((req) => (
                    <tr key={req._id}>
                      <td>{req.firstName} {req.lastName}</td>
                      <td>{req.address}</td>
                      <td>{req.phone}</td>
                      <td>{new Date(req.requestedAt).toLocaleDateString()}</td>
                      <td>{req.qualification}</td>
                      <td>{req.role}</td>
                      <td>
                        <a href={`/request/${req._id}`} className="view-btn">
                          View
                        </a>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center" }}>
                      No requests found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // ---- USER VIEW ----
  const assignedProjectsData = assignedProjects
    .map(projId => projects.find(p => p._id === projId))
    .filter(Boolean);

  return (
    <div className="home-container">
      {popupMessage && <div className="popup">{popupMessage}</div>}

      <div className="stat-card">
        <h3>Assigned Projects: {assignedProjectsData.length}</h3>
      </div>

      {user?.availability === "available" ? (
        <div className="stat-card available-card">
          <h3>Available for New Project</h3>
          <p>You are currently not assigned to any running project.</p>
        </div>
      ) : currentProject ? (
        <div className="project-details-card">
          <h2>{currentProject.title}</h2>
          <p>{currentProject.description}</p>
          <p><strong>Location:</strong> {currentProject.location}</p>
          <p><strong>Date:</strong> {new Date(currentProject.eventDate).toLocaleDateString()}</p>

          <h4>Your Current Tasks</h4>
          {currentProject.tasks
            .filter(t =>
              t.volunteers.map(v => v._id || v).includes(user._id) ||
              t.doctors.map(d => d._id || d).includes(user._id)
            )
            .map(t => (
              <div key={t._id} className="task-complete">
                <span>{t.name}</span>
                {t.status !== "Completed" && (
                  <button className="btn-complete" onClick={() => markTaskComplete(currentProject._id, t.name)}>
                    Complete
                  </button>
                )}
              </div>
            ))}

          <h4>Tasks Overview</h4>
          <table className="requests-table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Assigned</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {currentProject.tasks.map(t => {
                const assignedUsers = t.volunteers
                  .concat(t.doctors)
                  .map(u => {
                    if (typeof u === "object") return u.firstName + " " + u.lastName;
                    const userObj = [...volunteers, ...doctors].find(usr => usr._id === u);
                    return userObj ? userObj.firstName + " " + userObj.lastName : u;
                  });
                return (
                  <tr key={t._id}>
                    <td>{t.name}</td>
                    <td>{assignedUsers.join(", ") || "N/A"}</td>
                    <td>{t.status}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No project data available.</p>
      )}

      <div className="requests-table-container">
        <h4>Your Assigned Projects</h4>
        <table className="requests-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Location</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {assignedProjectsData.map(proj => (
              <tr key={proj._id}>
                <td>{proj.title}</td>
                <td>{proj.location}</td>
                <td>{new Date(proj.eventDate).toLocaleDateString()}</td>
                <td>{proj.status}</td>
              </tr>
            ))}
            {assignedProjectsData.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: "center" }}>No assigned projects</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
