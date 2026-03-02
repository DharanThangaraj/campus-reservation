import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/api";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";

function Login() {
    const [form, setForm] = useState({
        email: "",
        password: ""
    });
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { login } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post("/users/login", form);
            login(res.data);
            showToast("Login successful!", "success");
            navigate("/");
        } catch (err) {
            showToast("Invalid email or password", "error");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-lg w-96">
                <h2 className="text-2xl font-bold mb-6 text-center text-indigo-600">Login</h2>
                <form onSubmit={handleLogin} className="space-y-4">
                    <input
                        type="email"
                        className="border p-2 rounded w-full"
                        placeholder="Email"
                        required
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                    <input
                        type="password"
                        className="border p-2 rounded w-full"
                        placeholder="Password"
                        required
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                    />
                    <button
                        type="submit"
                        className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 w-full transition"
                    >
                        Login
                    </button>
                </form>
                <p className="mt-4 text-center text-gray-600">
                    Don't have an account? <Link to="/signup" className="text-indigo-600 hover:underline">Sign Up</Link>
                </p>
            </div>
        </div>
    );
}

export default Login;
