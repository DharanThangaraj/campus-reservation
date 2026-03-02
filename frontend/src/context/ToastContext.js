import React, { createContext, useContext, useState, useCallback } from "react";
import Toast from "../components/Toast";

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = "info") => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((toast) => toast.id !== id));
        }, 4000);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed top-4 right-4 z-[100] space-y-4">
                {toasts.map((toast) => (
                    <Toast key={toast.id} message={toast.message} type={toast.type}
                        onClose={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))} />
                ))}
            </div>
        </ToastContext.Provider>
    );
};
