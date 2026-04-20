// Filename: Frontend/src/utils/axiosClient.js
// this is axiosClient.js - a configured axios instance for making API calls to the backend, with base URL and credentials set up
import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'http://localhost:3000/api', // 🔥 direct backend
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

export default axiosClient;

