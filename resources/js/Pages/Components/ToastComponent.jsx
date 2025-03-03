import React, { useEffect } from "react";

export default function ToastComponent({ message, type, onClose }) {
    if (!message) return null;

    useEffect(() => {
        const timer = setTimeout(onClose, 2000); // Auto close after 2 seconds
        return () => clearTimeout(timer); // Cleanup on unmount
    }, [message, onClose]);

    const alertType = type;

    return (
        <div className="toast toast-top toast-end">
            <div className={`alert ${alertType} shadow-lg`}>
                <span className="ml-2">{message}</span>
                <button onClick={onClose} className="btn btn-sm btn-ghost">✕</button>
            </div>
        </div>
    );
}
