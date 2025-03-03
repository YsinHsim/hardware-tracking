import React from "react";

export default function AlertComponent({ message, onConfirm, onCancel }) {
    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center h-screen">
                <div role="alert" className="alert bg-base-300 shadow-lg rounded-md p-6 w-3/5 flex flex-row">
                    <span className="flex-1">{message}</span>
                    <div className="flex gap-2 justify-end">
                        <button onClick={onCancel} className="btn btn-sm btn-neutral">Cancel</button>
                        <button onClick={onConfirm} className="btn btn-sm btn-error">Delete</button>
                    </div>
                </div>
            </div>
        </>
    );
}
