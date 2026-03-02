import React from "react";

const Toast = ({ message, type, onClose }) => {
    const typeStyles = {
        success: "bg-green-500",
        error: "bg-red-500",
        info: "bg-blue-500",
        warning: "bg-yellow-500",
    };

    return (
        <div className={`${typeStyles[type]} text-white px-6 py-3 rounded-xl shadow-2xl flex items-center justify-between min-w-[300px] animate-slide-in`}>
            <p className="font-semibold">{message}</p>
            <button onClick={onClose} className="ml-4 hover:scale-110 transition">
                &times;
            </button>
        </div>
    );
};

export default Toast;
