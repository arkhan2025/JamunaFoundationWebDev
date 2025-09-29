import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question: { 
    type: String, 
    required: [true, "Question text is required"] 
  },
  options: {
    type: [String],
    validate: {
      validator: (arr) => arr.length > 0,
      message: "At least one option is required"
    }
  },
  correctAnswers: {
    type: [String],
    validate: {
      validator: (arr) => arr.length > 0,
      message: "At least one correct answer is required"
    }
  },
  type: { 
    type: String, 
    enum: ["mcq", "multi", "fill"], 
    default: "mcq" 
  }
});

const quizSchema = new mongoose.Schema({
  publisherId: { 
    type: String, 
    required: [true, "Publisher ID is required"] 
  },
  title: { 
    type: String, 
    required: [true, "Quiz title is required"] 
  },
  topic: { 
    type: String, 
    required: [true, "Quiz topic is required"] 
  },
  questions: {
    type: [questionSchema],
    validate: {
      validator: (arr) => arr.length > 0,
      message: "Quiz must have at least one question"
    }
  },
  attempts: { type: Number, default: 0 },
  highestScore: { type: String, default: "0/0" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Quiz", quizSchema);
