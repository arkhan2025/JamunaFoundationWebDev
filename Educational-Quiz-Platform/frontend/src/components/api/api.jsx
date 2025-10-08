import axios from "axios";

const API_URL = "https://educational-quiz-platform-l7r4.onrender.com/api";

export const registerUser = (data) => axios.post(`${API_URL}/register`, data);
export const loginUser = (data) => axios.post(`${API_URL}/login`, data);
export const getUserProfile = (userId) => axios.get(`${API_URL}/users/${userId}`);
export const updateUserProfile = (userId, data) => axios.put(`${API_URL}/users/${userId}`, data);

export const fetchQuizzes = () => axios.get(`${API_URL}/quizzes`);
export const fetchQuizById = (quizId) => axios.get(`${API_URL}/quizzes/${quizId}`);
export const createQuiz = (quizData) => axios.post(`${API_URL}/quizzes`, quizData);

export const submitQuiz = (quizId, answers) => axios.post(`${API_URL}/quizzes/${quizId}/submit`, answers);
export const fetchQuizResults = (quizId) => axios.get(`${API_URL}/quizzes/${quizId}/results`);
export const fetchUserQuizzes = (userId) => axios.get(`${API_URL}/users/${userId}/quizzes`);
