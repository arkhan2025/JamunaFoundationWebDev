import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "participant" },
    profession: String,
    address: String,
    mobile: String,
    qualifications: String,
    photo: String,
    attempts: [
      {
        quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
        attemptDate: { type: Date, default: Date.now },
        questions: [
          {
            questionNumber: Number,
            questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
            questionText: String,
            options: [String],
            correctAnswers: [String],
            userAnswers: [String], // ✅ store user-selected answers
            isCorrect: Boolean,
          },
        ],
        totalCorrect: Number,
        totalWrong: Number,
        totalSkipped: Number,
        marksAchieved: Number,
      },
    ],
    participated_quiz: [{ type: mongoose.Schema.Types.ObjectId, ref: "Quiz" }],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
