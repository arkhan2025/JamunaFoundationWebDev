import express from "express";
import Project from "../models/project.js";
import User from "../models/User.js"; // needed to update assignedProjects & availability
import { body, validationResult } from "express-validator";

const router = express.Router();

// 🟢 Get all projects
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find().populate(
      "volunteers doctors tasks.volunteers tasks.doctors tasks.completedBy"
    );
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🟢 Get running projects
router.get("/running", async (req, res) => {
  try {
    const runningProjects = await Project.find({ status: "running" });
    res.json(runningProjects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🟢 Get project by ID
router.get("/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate(
      "volunteers doctors tasks.volunteers tasks.doctors tasks.completedBy"
    );
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🟢 Create or update project
router.post(
  "/",
  body("title").notEmpty(),
  body("description").notEmpty(),
  body("location").notEmpty(),
  body("eventDate").notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { projectId, title, description, location, eventDate, tasks = [] } = req.body;

      const volunteers = [];
      const doctors = [];
      tasks.forEach((t) => {
        if (t.volunteers) volunteers.push(...t.volunteers);
        if (t.doctors) doctors.push(...t.doctors);
      });

      let project;
      if (projectId) {
        project = await Project.findById(projectId);
      }

      if (project) {
        const prevUsers = new Set([
          ...(project.volunteers || []).map((id) => id.toString()),
          ...(project.doctors || []).map((id) => id.toString()),
        ]);

        project.title = title;
        project.description = description;
        project.location = location;
        project.eventDate = eventDate;
        project.tasks = tasks.map((task) => ({
          ...task,
          volunteers: task.volunteers || [],
          doctors: task.doctors || [],
          status: task.status || "Pending",
        }));

        project.volunteers = volunteers;
        project.doctors = doctors;

        await project.save();

        const newUsers = new Set([...volunteers, ...doctors]);
        await User.updateMany(
          { _id: { $in: Array.from(newUsers) } },
          { $addToSet: { assignedProjects: project._id }, $set: { availability: "occupied" } }
        );

        const removedUsers = Array.from([...prevUsers].filter((id) => !newUsers.has(id)));
        for (const userId of removedUsers) {
          const user = await User.findById(userId);
          if (user) {
            user.assignedProjects = user.assignedProjects.filter(
              (pId) => pId.toString() !== project._id.toString()
            );
            if (user.assignedProjects.length === 0) user.availability = "available";
            await user.save();
          }
        }

        return res.status(200).json({ message: "Project updated", project });
      }

      project = new Project({
        title,
        description,
        location,
        eventDate,
        tasks,
        volunteers,
        doctors,
      });

      await project.save();

      const allUsers = [...new Set([...volunteers, ...doctors])];
      await User.updateMany(
        { _id: { $in: allUsers } },
        { $addToSet: { assignedProjects: project._id }, $set: { availability: "occupied" } }
      );

      res.status(201).json({ message: "Project created", project });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// 🟢 Update existing project by ID (alternative PUT)
router.put("/:id", async (req, res) => {
  try {
    const { tasks = [] } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });

    const prevUsers = new Set([
      ...(project.volunteers || []).map((id) => id.toString()),
      ...(project.doctors || []).map((id) => id.toString()),
    ]);

    Object.assign(project, req.body);

    const volunteers = [];
    const doctors = [];
    tasks.forEach((t) => {
      if (t.volunteers) volunteers.push(...t.volunteers);
      if (t.doctors) doctors.push(...t.doctors);
    });

    project.tasks = tasks.map((task) => ({
      ...task,
      volunteers: task.volunteers || [],
      doctors: task.doctors || [],
      status: task.status || "Pending",
    }));

    project.volunteers = volunteers;
    project.doctors = doctors;

    await project.save();

    const allNewUsers = [...new Set([...volunteers, ...doctors])];
    await User.updateMany(
      { _id: { $in: allNewUsers } },
      { $addToSet: { assignedProjects: project._id }, $set: { availability: "occupied" } }
    );

    const removedUsers = Array.from([...prevUsers].filter((id) => !allNewUsers.includes(id)));
    for (const userId of removedUsers) {
      const user = await User.findById(userId);
      if (user) {
        user.assignedProjects = user.assignedProjects.filter(
          (pId) => pId.toString() !== project._id.toString()
        );
        if (user.assignedProjects.length === 0) user.availability = "available";
        await user.save();
      }
    }

    res.json({ message: "Project updated", project });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🟢 Mark a task completed
router.put("/:id/complete-task", async (req, res) => {
  try {
    const { id } = req.params; // project ID
    const { taskName, userId } = req.body;

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ error: "Project not found" });

    const task = project.tasks.find((t) => t.name === taskName);
    if (!task) return res.status(404).json({ error: "Task not found" });

    // ✅ Mark this user's completion
    if (!task.completedBy) task.completedBy = [];
    if (!task.completedBy.includes(userId)) {
      task.completedBy.push(userId);
    }
    task.status = "Completed";
    task.completedAt = new Date();

    // ✅ Check if all tasks are now completed
    const allTasksCompleted = project.tasks.every((t) => t.status === "Completed");
    if (allTasksCompleted) {
      project.status = "completed";

      // ✅ Once the whole project is completed:
      // Make *all* users available again, but KEEP assignedProjects intact
      const allUserIds = [
        ...project.volunteers,
        ...project.doctors,
        ...project.tasks.flatMap((t) => [...(t.volunteers || []), ...(t.doctors || [])]),
      ];

      const uniqueUserIds = [...new Set(allUserIds.map((id) => id.toString()))];

      await User.updateMany(
        { _id: { $in: uniqueUserIds } },
        { $set: { availability: "available" } } // do not touch assignedProjects
      );
    }

    await project.save();

    res.json({
      message: allTasksCompleted
        ? "✅ All tasks completed — project marked as completed!"
        : "🎯 Task marked complete!",
      project,
    });
  } catch (err) {
    console.error("Error completing task:", err);
    res.status(500).json({ error: err.message });
  }
});

// 🟢 Delete project
router.delete("/:id", async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });

    const allUsers = [...new Set([...project.volunteers, ...project.doctors])];
    for (const userId of allUsers) {
      const user = await User.findById(userId);
      if (user) {
        user.assignedProjects = user.assignedProjects.filter(
          (pId) => pId.toString() !== project._id.toString()
        );
        if (user.assignedProjects.length === 0) user.availability = "available";
        await user.save();
      }
    }

    res.json({ message: "Project deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
