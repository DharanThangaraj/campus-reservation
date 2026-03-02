import { useState, useEffect, useCallback } from "react";
import api from "../api/api";

function NotificationSection() {
    const [notifications, setNotifications] = useState([]);
    const user = JSON.parse(localStorage.getItem("user"));

    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        try {
            const res = await api.get(`/notifications?userId=${user.id}`);
            setNotifications(res.data);
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        }
    }, [user]);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 10000); // Poll every 10 seconds
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            fetchNotifications();
        } catch (err) {
            console.error("Failed to mark notification as read", err);
        }
    };

    if (notifications.length === 0) return null;

    return (
        <div className="bg-white p-6 rounded-xl shadow-md mt-6">
            <h3 className="text-xl font-semibold mb-4 text-indigo-600">Notifications</h3>
            <div className="space-y-3">
                {notifications.map((n) => (
                    <div
                        key={n.id}
                        className={`p-3 rounded-lg border flex justify-between items-center ${n.read ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200 shadow-sm'}`}
                    >
                        <p className={`text-sm ${n.read ? 'text-gray-600' : 'text-blue-800 font-medium'}`}>{n.message}</p>
                        {!n.read && (
                            <button
                                onClick={() => markAsRead(n.id)}
                                className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition"
                            >
                                Mark as read
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default NotificationSection;
