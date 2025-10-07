import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./CreateProject.css";

const TASKS = [
  "Venue & Logistic Setup",
  "Registration & Scheduling",
  "Doctors & Consultants",
  "Media & Documentation",
  "Community Awareness",
];

const CreateProject = ({ projectId: propProjectId }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const projectId = propProjectId || location.state?.projectId;

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    eventDate: "",
    tasks: TASKS.map((t) => ({
      name: t,
      volunteers: [],
      doctors: [],
    })),
  });

  const [volunteers, setVolunteers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [isUpdate, setIsUpdate] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [prevAssignedUsers, setPrevAssignedUsers] = useState(new Set());
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRefs = useRef([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("https://community-project-tracker.onrender.com/api/users/approved");
        const allUsers = res.data || [];
        setVolunteers(allUsers.filter((u) => u.role === "volunteer"));
        setDoctors(allUsers.filter((u) => u.role === "doctor"));
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!projectId) return;
    const fetchProject = async () => {
      try {
        const res = await axios.get(
          `https://community-project-tracker.onrender.com/api/projects/${projectId}`
        );
        const project = res.data;

        const tasks =
          project.tasks?.map((t) => ({
            name: t.name,
            volunteers: t.volunteers.map((v) =>
              typeof v === "object" ? v._id : v
            ),
            doctors: t.doctors.map((d) =>
              typeof d === "object" ? d._id : d
            ),
          })) ||
          TASKS.map((t) => ({ name: t, volunteers: [], doctors: [] }));

        const allAssigned = new Set(
          tasks.flatMap((t) => [...t.volunteers, ...t.doctors])
        );
        setPrevAssignedUsers(allAssigned);

        setForm({
          title: project.title,
          description: project.description,
          location: project.location,
          eventDate: project.eventDate.slice(0, 10),
          tasks,
        });
        setIsUpdate(true);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProject();
  }, [projectId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const showPopup = (message, redirect = null) => {
    setPopupMessage(message);
    setTimeout(() => {
      setPopupMessage("");
      if (redirect) navigate(redirect);
    }, 2000);
  };

  const toggleUserSelection = (taskName, type, id) => {
    setForm((prev) => {
      const updatedTasks = prev.tasks.map((task) => {
        if (task.name === taskName) {
          const list = task[type];
          if (list.includes(id)) {
            return { ...task, [type]: list.filter((v) => v !== id) };
          } else {
            return { ...task, [type]: [...list, id] };
          }
        }
        return task;
      });
      return { ...prev, tasks: updatedTasks };
    });
  };

  const getAllSelectedIds = () => {
    return form.tasks.flatMap((t) => [...t.volunteers, ...t.doctors]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allSelected = getAllSelectedIds();
    if (allSelected.length < 4) {
      showPopup("Please assign at least 4 people in total.");
      return;
    }

    try {
      if (isUpdate) {
        const newAssigned = new Set(allSelected);
        const removedUsers = Array.from(
          [...prevAssignedUsers].filter((id) => !newAssigned.has(id))
        );

        // Remove project from users who are unassigned AND set availability
        if (removedUsers.length > 0) {
          await Promise.all(
            removedUsers.map(async (userId) => {
              await axios.put(
                `https://community-project-tracker.onrender.com/api/users/${userId}/removeProject`,
                { projectId, setAvailable: true } // Pass flag to update availability
              );
            })
          );
        }

        // Add project to newly assigned users
        const addedUsers = Array.from(
          [...newAssigned].filter((id) => !prevAssignedUsers.has(id))
        );
        if (addedUsers.length > 0) {
          await Promise.all(
            addedUsers.map(async (userId) => {
              await axios.put(
                `https://community-project-tracker.onrender.com/api/users/${userId}/addProject`,
                { projectId }
              );
            })
          );
        }

        // Update project itself
        await axios.put(`https://community-project-tracker.onrender.com/api/projects/${projectId}`, form);
        setPrevAssignedUsers(newAssigned);
        showPopup("Project updated successfully", "/projectlist");
      } else {
        const res = await axios.post("https://community-project-tracker.onrender.com/api/projects", form);
        const newProjectId = res.data.project._id;
        if (!newProjectId) throw new Error("New project ID is missing");

        if (allSelected.length > 0) {
          await Promise.all(
            allSelected.map(async (userId) => {
              await axios.put(
                `https://community-project-tracker.onrender.com/api/users/${userId}/addProject`,
                { projectId: newProjectId }
              );
            })
          );
        }

        showPopup("Project created successfully", "/projectlist");
        setForm({
          title: "",
          description: "",
          location: "",
          eventDate: "",
          tasks: TASKS.map((t) => ({ name: t, volunteers: [], doctors: [] })),
        });
      }
    } catch (err) {
      console.error(err);
      showPopup("Error: " + (err.response?.data?.error || err.message));
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRefs.current.every((ref) => !ref || !ref.contains(e.target))
      ) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const renderUserLabel = (u) =>
    `${u.role === "doctor" ? "D" : "V"} - ${u.firstName} ${u.lastName}`;

  const renderDropdown = (task, i) => {
    const selectedIds = getAllSelectedIds();

    const taskVolunteerObjects = volunteers.filter(
      (v) =>
        task.volunteers.includes(v._id) ||
        (v.availability === "available" && !selectedIds.includes(v._id))
    );

    const taskDoctorObjects = doctors.filter(
      (d) =>
        task.doctors.includes(d._id) ||
        (d.availability === "available" && !selectedIds.includes(d._id))
    );

    const allUsers = [...taskVolunteerObjects, ...taskDoctorObjects].filter(
      (value, index, self) =>
        self.findIndex((u) => u._id === value._id) === index
    );

    const selectedNames = [
      ...volunteers
        .filter((v) => task.volunteers.includes(v._id))
        .map(renderUserLabel),
      ...doctors
        .filter((d) => task.doctors.includes(d._id))
        .map(renderUserLabel),
    ];

    return (
      <div
        key={task.name}
        className="dropdown-container"
        ref={(el) => (dropdownRefs.current[i] = el)}
      >
        <label>{task.name}</label>
        <div
          className="dropdown-input"
          onClick={() => setOpenDropdown(openDropdown === i ? null : i)}
        >
          {selectedNames.length > 0
            ? selectedNames.join(", ")
            : "Select people for this task"}
        </div>
        {openDropdown === i && (
          <div className="dropdown-list">
            {allUsers.map((u) => (
              <div key={u._id} className="dropdown-item">
                <div>
                  <input
                    type="checkbox"
                    checked={
                      task.volunteers.includes(u._id) ||
                      task.doctors.includes(u._id)
                    }
                    onChange={() =>
                      toggleUserSelection(
                        task.name,
                        u.role === "doctor" ? "doctors" : "volunteers",
                        u._id
                      )
                    }
                  />
                  <span>{renderUserLabel(u)}</span>
                </div>
                <span className="count">
                  ({u.assignedProjects?.length || 0})
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="create-project-container">
      <h2>{isUpdate ? "Update Project" : "Create New Project"}</h2>
      {popupMessage && <div className="popup center-popup">{popupMessage}</div>}
      <form onSubmit={handleSubmit} className="create-project-form">
        <label>Project Title</label>
        <input
          type="text"
          name="title"
          placeholder="Project Title"
          value={form.title}
          onChange={handleChange}
          required
        />
        <label>Project Description</label>
        <textarea
          name="description"
          placeholder="Project Description"
          value={form.description}
          onChange={handleChange}
          required
        />
        <label>Location</label>
        <input
          type="text"
          name="location"
          placeholder="Location"
          value={form.location}
          onChange={handleChange}
          required
        />
        <label>Event Date</label>
        <input
          type="date"
          name="eventDate"
          value={form.eventDate}
          onChange={handleChange}
          required
        />

        <h3 className="task-section-title">Assign People to Tasks</h3>
        {form.tasks.map((task, i) => renderDropdown(task, i))}

        <div className="mi">
          <button type="submit">
            {isUpdate ? "Update Project" : "Create Project"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProject;
