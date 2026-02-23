import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:8000/Easeincart",
    withCredentials: true,
});

// Automatically attach the token from localStorage to every request
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Handle 401 (unauthorized) globally — clear session and redirect to login
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("userID");
            localStorage.removeItem("role");
            localStorage.removeItem("isProfileCreated");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default API;
