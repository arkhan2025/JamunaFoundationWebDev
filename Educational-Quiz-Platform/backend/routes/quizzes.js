import express from "express";
import Quiz from "../models/Quiz.js";
import User from "../models/User.js";

const router = express.Router();

// Get all quizzes (optional filter by publisher)
router.get("/", async (req, res) => {
  try {
    const { publisherId } = req.query;
    const filter = publisherId ? { publisherId } : {};
    const quizzes = await Quiz.find(filter).sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (err) {
    console.error("Error fetching quizzes:", err);
    res.status(500).json({ message: "Error fetching quizzes", error: err.message });
  }
});

// Get quiz by ID
router.get("/:id", async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    res.json(quiz);
  } catch (err) {
    console.error("Error fetching quiz:", err);
    res.status(500).json({ message: "Error fetching quiz", error: err.message });
  }
});

// Create new quiz
router.post("/", async (req, res) => {
  try {
    const { title, topic, questions, publisherId, attempts, highestScore } = req.body;
    if (!publisherId) return res.status(400).json({ message: "Publisher ID is required" });

    const quiz = new Quiz({
      title,
      topic,
      questions: questions.map((q) => ({
        question: q.question,
        options: q.options,
        correctAnswers: q.correctAnswers,
        type: q.type || "multiple-choice",
      })),
      publisherId,
      attempts: typeof attempts === "number" ? attempts : 0,
      highestScore: highestScore || `0/${questions.length}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await quiz.save();
    res.status(201).json({ message: "Quiz created successfully!", quiz });
  } catch (err) {
    console.error("Error creating quiz:", err);
    res.status(500).json({ message: "Error creating quiz", error: err.message });
  }
});

// ✅ Update existing quiz
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const quiz = await Quiz.findById(id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    quiz.title = updatedData.title || quiz.title;
    quiz.topic = updatedData.topic || quiz.topic;
    quiz.questions = updatedData.questions || quiz.questions;
    quiz.attempts = updatedData.attempts ?? quiz.attempts;
    quiz.highestScore = updatedData.highestScore ?? quiz.highestScore;
    quiz.updatedAt = new Date();

    const savedQuiz = await quiz.save();
    res.json({ message: "Quiz updated successfully", quiz: savedQuiz });
  } catch (err) {
    console.error("Error updating quiz:", err);
    res.status(500).json({ message: "Error updating quiz", error: err.message });
  }
});

// Add attempt to user
router.put("/:userId/add-attempt", async (req, res) => {
  try {
    const { userId } = req.params;
    const attempt = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const existingIndex = user.attempts.findIndex((a) => a.quizId === attempt.quizId);
    if (existingIndex !== -1) {
      user.attempts[existingIndex] = attempt;
    } else {
      user.attempts.push(attempt);
    }

    if (!user.participated_quiz.includes(attempt.quizId)) {
      user.participated_quiz.push(attempt.quizId);
    }

    await user.save();
    res.status(200).json({ message: "Attempt added successfully", attempt });
  } catch (err) {
    console.error("❌ Error adding attempt:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Delete quiz
router.delete("/:id", async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    await Quiz.findByIdAndDelete(req.params.id);
    res.json({ message: "Quiz deleted successfully!" });
  } catch (err) {
    console.error("Error deleting quiz:", err);
    res.status(500).json({ message: "Error deleting quiz", error: err.message });
  }
});

// Submit quiz
router.post("/:id/submit", async (req, res) => {
  try {
    const { userId, answers } = req.body;
    if (!userId || !answers) return res.status(400).json({ message: "userId and answers are required" });

    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    let score = 0;

    const attemptQuestions = quiz.questions.map((q, idx) => {
      const userAnswerIndexes = answers[q._id.toString()] || [];
      const userAnswers = userAnswerIndexes.map(i => q.options[i]);
      const correctAnswers = Array.isArray(q.correctAnswers) ? q.correctAnswers : [q.correctAnswers];

      const isCorrect =
        userAnswers.length > 0 &&
        userAnswers.length === correctAnswers.length &&
        userAnswers.every(a => correctAnswers.includes(a));

      if (isCorrect) score++;

      return {
        questionNumber: idx + 1,
        question: q.question,
        options: q.options,
        correctAnswers,
        userAnswers,
        isCorrect,
      };
    });

    const attemptData = {
      quizId: quiz._id.toString(),
      attemptDate: new Date(),
      questions: attemptQuestions,
      totalCorrect: attemptQuestions.filter(q => q.isCorrect).length,
      totalWrong: attemptQuestions.filter(q => !q.isCorrect && q.userAnswers.length > 0).length,
      totalSkipped: attemptQuestions.filter(q => q.userAnswers.length === 0).length,
      marksAchieved: score,
    };

    const existingIndex = user.attempts.findIndex(a => a.quizId === quiz._id.toString());
    if (existingIndex !== -1) {
      user.attempts[existingIndex] = attemptData;
    } else {
      user.attempts.push(attemptData);
      quiz.attempts = (quiz.attempts || 0) + 1;
    }

    const prevHigh = parseInt(quiz.highestScore?.split("/")[0]) || 0;
    quiz.highestScore = `${Math.max(prevHigh, score)}/${quiz.questions.length}`;

    await user.save();
    await quiz.save();

    res.json({ message: "Quiz submitted successfully", score, quiz });
  } catch (err) {
    console.error("Error submitting quiz:", err);
    res.status(500).json({ message: "Error submitting quiz", error: err.message });
  }
});

export default router;
