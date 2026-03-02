import { useState, useEffect, useRef } from "react";
import api from "../api/api";
import { Link } from "react-router-dom";

function NotificationDropdown({ user }) {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            const res = await api.get(`/notifications?userId=${user.id}`);
            setNotifications(res.data);
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put(`/notifications/read-all?userId=${user.id}`);
            fetchNotifications();
        } catch (err) {
            console.error("Failed to mark all as read", err);
        }
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 10000); // Poll every 10s
            return () => clearInterval(interval);
        }
    }, [user]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const toggleDropdown = () => {
        const nextState = !isOpen;
        if (nextState && unreadCount > 0) {
            markAllAsRead();
        }
        setIsOpen(nextState);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className="relative p-2 text-white hover:bg-indigo-700 rounded-full transition"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-[10px] flex items-center justify-center border-2 border-indigo-600">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl z-50 overflow-hidden border border-gray-200">
                    <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-700">Notifications</h3>
                        <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-semibold">
                            {unreadCount} New
                        </span>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 italic">
                                No new notifications
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <div key={n.id} className={`p-4 border-b hover:bg-gray-50 transition cursor-default ${!n.read ? 'bg-indigo-50' : ''}`}>
                                    <p className="text-sm text-gray-800 break-words">{n.message}</p>
                                    <span className="text-[10px] text-gray-400 mt-1 block">Recently</span>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="p-3 text-center bg-gray-50 border-t">
                        <Link to="/booking" className="text-xs text-indigo-600 font-bold hover:underline" onClick={() => setIsOpen(false)}>
                            View Booking Details
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

export default NotificationDropdown;
