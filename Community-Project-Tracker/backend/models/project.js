import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: [
      "Venue & Logistic Setup",
      "Registration & Scheduling",
      "Doctors & Consultants",
      "Media & Documentation",
      "Community Awareness",
      "Miscellaneous"
    ],
    required: true
  },
  volunteers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  doctors: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  status: {
    type: String,
    enum: ["Pending", "In Progress", "Completed"],
    default: "Pending"
  },
  completedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  completedAt: { type: Date }
});

const projectSchema = new mongoose.Schema({
  projectId: { type: String, unique: true, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  eventDate: { type: Date, required: true },
  volunteers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  doctors: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  status: {
    type: String,
    enum: ["running", "completed"],
    default: "running"
  },
  tasks: [taskSchema],
  createdAt: { type: Date, default: Date.now }
});

projectSchema.pre("validate", function (next) {
  if (!this.tasks || this.tasks.length === 0) {
    this.tasks = [
      { name: "Venue & Logistic Setup" },
      { name: "Registration & Scheduling" },
      { name: "Doctors & Consultants" },
      { name: "Media & Documentation" },
      { name: "Community Awareness" },
      { name: "Miscellaneous" }
    ];
  }
  if (!this.projectId) {
    this.projectId = new mongoose.Types.ObjectId().toString();
  }
  next();
});

export default mongoose.model("Project", projectSchema);
