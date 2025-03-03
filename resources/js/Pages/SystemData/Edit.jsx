import React, { useState } from 'react';
import Layout from '../Layouts/Layout';
import { router } from '@inertiajs/react';
import ToastComponent from '../Components/ToastComponent';

export default function Edit({ type, record }) {
    // Toast state
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState("");

    // Initialize form state, formatting date fields
    const [recordValues, setRecordValues] = useState(() => {
        const formattedRecord = { ...record };

        // Convert only `created_at` and `updated_at` to YYYY-MM-DD format
        ["created_at", "updated_at"].forEach((key) => {
            if (formattedRecord[key]) {
                formattedRecord[key] = formattedRecord[key].split("T")[0]; // Extract YYYY-MM-DD
            }
        });

        return formattedRecord;
    });

    const handleChange = (e) => {
        const key = e.target.id;
        const value = e.target.value;
        setRecordValues((values) => ({
            ...values,
            [key]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Prepare only the updated fields
        const updatedValues = Object.keys(recordValues).reduce((acc, key) => {
            if (recordValues[key] !== record[key]) {
                acc[key] = recordValues[key];
            }
            return acc;
        }, {});

        // If no changes, show a warning
        if (Object.keys(updatedValues).length === 0) {
            setToastMessage("No changes detected.");
            setToastType("alert-warning");
            return;
        }

        // Send update request
        router.put(`/system-data/${type}/${record.id}`, updatedValues, {
            onSuccess: () => {
                setToastMessage(`${type} updated successfully!`);
                setToastType("alert-success");
            },
            onError: (errors) => {
                console.error("Update failed:", errors);
                setToastMessage(`Failed to update ${type}. Please try again.`);
                setToastType("alert-error");
            },
        });
    };

    return (
        <Layout>
            <div className="mx-4 mt-1">
                <p className="text-3xl font-bold text-primary">{type} Management</p>
                <p className="text-sm font-normal animate-pulse">Edit & Update {type} Data.</p>
            </div>

            <div className="divider" />

            <div className="card bg-base-300 flex-auto mb-1 rounded-sm">
                <div className="card-body">
                    <h2 className="card-title text-primary">Edit {type}</h2>
                    <form onSubmit={handleSubmit} className="mt-1">
                        <div className="flex flex-col space-y-2">
                            {Object.keys(recordValues).map((key) => (
                                key !== "id" && ( // Exclude ID field
                                    <div key={key}>
                                        <label className="text-sm font-semibold capitalize">{key.replace("_", " ")}</label>
                                        <input
                                            type={["created_at", "updated_at"].includes(key) ? "date" : "text"}
                                            className="input input-bordered w-full text-sm"
                                            id={key}
                                            value={recordValues[key] || ""}
                                            onChange={handleChange}
                                        />
                                    </div>
                                )
                            ))}
                            <div className="card-actions justify-end">
                                <button type="submit" className="btn btn-sm btn-primary px-8 py-1 mt-2">
                                    Update
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Toast Notification */}
            <ToastComponent
                message={toastMessage}
                type={toastType}
                onClose={() => setToastMessage("")} // Clear toast after closing
            />
        </Layout>
    );
}
