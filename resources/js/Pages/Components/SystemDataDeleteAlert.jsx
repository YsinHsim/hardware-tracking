import { useState } from "react";

export default function SystemDataDeleteAlert({ item, type, onDelete, onCancel }) {
    const [inputValue, setInputValue] = useState("");
    const [error, setError] = useState("");

    const handleConfirm = () => {
        if (inputValue.trim() !== item.name) {
            setError("Entered value does not match.");
            return;
        }
        onDelete(); // Calls the delete function
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-base-200 p-6 rounded-md shadow-md w-96">
                <h2 className="text-lg font-semibold text-error">Confirm Deletion</h2>
                <p className="text-sm mt-2">
                    To delete <strong className="text-error">{item.name}</strong>, please type the exact name below.
                </p>
                <input
                    type="text"
                    className="input input-bordered w-full mt-3"
                    placeholder="Enter name to confirm"
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        setError(""); // Clear error when typing
                    }}
                />
                {error && <p className="text-sm text-error mt-1">{error}</p>}

                <div className="flex justify-end gap-2 mt-4">
                    <button className="btn btn-sm" onClick={onCancel}>Cancel</button>
                    <button 
                        className={`btn btn-sm btn-error ${inputValue.trim() !== item.name ? "opacity-50 cursor-not-allowed" : ""}`} 
                        onClick={handleConfirm}
                        disabled={inputValue.trim() !== item.name}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}
