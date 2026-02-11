import React, { useEffect, useState } from "react";

export default function Toast({ message, type = "success", onClose }) {
    const [exiting, setExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setExiting(true);
            setTimeout(onClose, 300);
        }, 2500);
        return () => clearTimeout(timer);
    }, [onClose]);

    const configs = {
        success: {
            bg: "bg-green-600",
            icon: "✓",
            border: "border-green-500",
        },
        cart: {
            bg: "bg-[#232f3e]",
            icon: "🛒",
            border: "border-[#febd69]",
        },
        wishlist: {
            bg: "bg-rose-600",
            icon: "❤️",
            border: "border-rose-400",
        },
        error: {
            bg: "bg-red-600",
            icon: "✕",
            border: "border-red-400",
        },
    };

    const config = configs[type] || configs.success;

    return (
        <div
            className={`fixed top-4 right-4 z-[100] max-w-sm ${exiting ? "animate-toast-out" : "animate-toast-in"
                }`}
        >
            <div
                className={`${config.bg} text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border-l-4 ${config.border} backdrop-blur-sm`}
            >
                <span className="text-lg flex-shrink-0">{config.icon}</span>
                <p className="text-sm font-medium">{message}</p>
                <button
                    onClick={() => {
                        setExiting(true);
                        setTimeout(onClose, 300);
                    }}
                    className="ml-2 text-white/60 hover:text-white transition-colors flex-shrink-0"
                >
                    ✕
                </button>
            </div>
        </div>
    );
}
